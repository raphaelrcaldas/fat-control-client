"use client";

import {
   useState,
   useCallback,
   useEffect,
   useMemo,
   useRef,
   useLayoutEffect,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useEtapas } from "@/hooks/queries";
import { useAeronaves } from "@/hooks/queries/useAeronaves";
import { useEsfAerList } from "@/hooks/queries/useEsfAer";
import { useTiposMissao } from "@/hooks/queries/useTiposMissao";
import { dateToIso, todayIso } from "@/../utils/dateHandler";

// Fuso local (dateHandler), não UTC: após ~21h em UTC-3, toISOString()
// devolveria "amanhã" e deslocaria a janela de 30 dias em um dia.
export function getDefaultDataIni(): string {
   const d = new Date();
   d.setDate(d.getDate() - 30);
   return dateToIso(d);
}

export function getDefaultDataFim(): string {
   return todayIso();
}

// Formato ISO estrito (yyyy-mm-dd) E data de calendário real: a regex sozinha
// aceita "2026-02-30"/"2026-13-45", que sobrevivem até virar chip "NaN/NaN/NaN"
// e 422 do backend. `T00:00` (sem `Z`) força fuso local, casando com
// `dateToIso`: uma data que "rola" (2026-02-30 -> 2026-03-02) não bate mais
// com `raw` e cai no default, como qualquer outro valor inválido.
// O piso de ano é explícito: o input emite "0002-06-01" enquanto o ano é
// digitado, e sem o piso a rejeição dependeria de `dateToIso` não completar
// o ano com zeros.
const DATE_PARAM_RE = /^\d{4}-\d{2}-\d{2}$/;
const DATE_PARAM_MIN = "1900-01-01";
function isValidDateParam(raw: string | null): raw is string {
   if (raw === null || !DATE_PARAM_RE.test(raw)) return false;
   if (raw < DATE_PARAM_MIN) return false;
   return dateToIso(new Date(`${raw}T00:00`)) === raw;
}

// `esf_aer_id` viaja como id numérico positivo em forma canônica: `Number()`
// aceita "1.0", " 1", "0x1", "1e0", "01", que chegam à API como 1 mas não
// batem com a opção "1" do select (chip mostra "#1.0"). Teto de 32767: o id
// de `EsforcoAereo` é `smallint`, e o backend recusa acima disso (422). O
// valor enviado continua `Number(raw)` depois de validado.
const ESF_AER_ID_RE = /^[1-9]\d{0,4}$/;
const ESF_AER_ID_MAX = 32767;
function isValidEsfAerId(raw: string | null): raw is string {
   return (
      raw !== null && ESF_AER_ID_RE.test(raw) && Number(raw) <= ESF_AER_ID_MAX
   );
}

// Mesmo saneamento usado na leitura e no seed: data inválida cai no default;
// se isso inverter o período (a data sã vira depois da que ficou), as DUAS
// caem no default — o saneamento não pode ser a causa de "período inválido".
// A leitura sempre passa por aqui, inclusive com um par já invertido mas com
// as DUAS datas válidas: a condição abaixo exige que pelo menos uma seja
// inválida, então esse par sai intacto (a inversão é intenção do link).
function sanitizeDatePair(
   rawDataIni: string | null,
   rawDataFim: string | null
): { dataIni: string; dataFim: string } {
   const dataIniInvalid = !isValidDateParam(rawDataIni);
   const dataFimInvalid = !isValidDateParam(rawDataFim);
   let dataIni = isValidDateParam(rawDataIni)
      ? rawDataIni
      : getDefaultDataIni();
   let dataFim = isValidDateParam(rawDataFim)
      ? rawDataFim
      : getDefaultDataFim();
   if (dataIni > dataFim && (dataIniInvalid || dataFimInvalid)) {
      dataIni = getDefaultDataIni();
      dataFim = getDefaultDataFim();
   }
   return { dataIni, dataFim };
}

function useSyncDebouncedParam(
   debouncedValue: string,
   paramKey: string,
   urlValue: string,
   updateParams: (updates: Record<string, string | undefined>) => void
) {
   useEffect(() => {
      if (debouncedValue !== urlValue)
         updateParams({ [paramKey]: debouncedValue || undefined });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [debouncedValue]);
}

function useSyncParamToState(
   paramValue: string,
   debouncedValue: string,
   localValue: string,
   setter: (val: string) => void
) {
   useEffect(() => {
      if (paramValue !== localValue && paramValue !== debouncedValue)
         setter(paramValue);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [paramValue]);
}

export function useEtapasFilters() {
   const searchParams = useSearchParams();
   const router = useRouter();

   // Use the serialized form as a stable primitive dep so callbacks/memos
   // don't re-create on every render if Next returns a new searchParams ref.
   const spString = searchParams.toString();

   // Query mais recente PRETENDIDA. `router.replace` só reflete em
   // `useSearchParams` quando a transição comita — DEPOIS do render urgente
   // do estado local que disparou a escrita. Toda escrita de URL parte desta
   // ref (nunca de `spString` diretamente), então uma segunda escrita
   // disparada antes do commit da primeira compõe sobre ela em vez de
   // reconstruir a partir da URL velha: clearFilters() seguido do efeito de
   // [filterTrip] restaurava datas e origem antigos porque os dois montavam a
   // query a partir da mesma `spString` desatualizada (ver
   // docs/ai/notes/frontend-armadilhas.md).
   const latestQsRef = useRef(spString);

   // Mantém a ref em dia quando a URL muda por navegação EXTERNA (voltar/
   // avançar, link colado) — a única fonte de verdade nesse caso é a própria
   // `spString` comitada. Um layout effect (em vez de atribuição direta no
   // render) roda antes de todo efeito passivo, filhos inclusive, e é seguro: escrever num ref durante a renderização é impuro e o
   // React não garante que rode uma única vez por commit (StrictMode chama o
   // corpo do componente duas vezes em dev). Declarado ANTES do efeito de seed
   // abaixo: a cada mudança de `spString` os dois disparam na ordem de
   // declaração, então o seed sempre lê a ref já sincronizada.
   useLayoutEffect(() => {
      latestQsRef.current = spString;
   }, [spString]);

   // --- Read URL params ---
   const urlAnv = useMemo(
      () => searchParams.getAll("anv"),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [spString]
   );
   const urlTipoMissao = useMemo(
      () => searchParams.getAll("tipo_missao_cod"),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [spString]
   );
   const urlOrigem = searchParams.get("origem") ?? "";
   const urlDestino = searchParams.get("destino") ?? "";
   const urlTrip = searchParams.get("trip_search") ?? "";
   const urlFuncao = searchParams.get("funcao") ?? "";
   const rawEsfAerId = searchParams.get("esf_aer_id");
   const urlEsfAerId = isValidEsfAerId(rawEsfAerId) ? rawEsfAerId : "";
   const { dataIni: urlDataIni, dataFim: urlDataFim } = sanitizeDatePair(
      searchParams.get("data_ini"),
      searchParams.get("data_fim")
   );

   // --- Seed default dates into URL whenever it lacks them ---
   // Aproveita para varrer page/per_page/esf_aer: a listagem deixou de
   // paginar e o esforço aéreo passou a viajar por id (`esf_aer_id`), mas
   // link salvo e histórico ainda carregam os parâmetros antigos, e nada mais
   // os removeria.
   // Deps `[spString]`, não `[]`: navegar para esta rota pelo menu lateral usa
   // `router.push` sem remontar a página (a chave de estado do layout-router
   // ignora a query), então um efeito de montagem não roda de novo e a URL
   // fica sem datas. Lê de `new URLSearchParams(latestQsRef.current)` — não de
   // `searchParams` diretamente — para compor sobre a última escrita
   // pretendida; o efeito que mantém a ref em dia com `spString` está
   // declarado ANTES deste, então já rodou no mesmo commit. Sem laço: depois
   // da escrita, `latestQsRef.current` já contém as datas semeadas e nada
   // sobra para varrer, então a próxima execução retorna cedo.
   useEffect(() => {
      const params = new URLSearchParams(latestQsRef.current);
      const stale = ["page", "per_page", "esf_aer"].filter((key) =>
         params.has(key)
      );
      // Mesmo critério de validade usado na leitura acima: id malformado na
      // URL (texto, 0, negativo) é varrido em vez de sobreviver escondido.
      if (
         params.has("esf_aer_id") &&
         !isValidEsfAerId(params.get("esf_aer_id"))
      ) {
         stale.push("esf_aer_id");
      }
      const rawDataIni = params.get("data_ini");
      const rawDataFim = params.get("data_fim");
      const needsDates =
         !isValidDateParam(rawDataIni) || !isValidDateParam(rawDataFim);
      if (!needsDates && stale.length === 0) return;

      // Mesma regra de `sanitizeDatePair`: se o saneamento (não a URL) causar
      // a inversão, grava as DUAS datas default. Um par já invertido com as
      // DUAS datas válidas na URL é intenção do link: não aciona
      // `needsDates` e, se houver `stale` a varrer, atravessa
      // `sanitizeDatePair` intacto.
      const { dataIni: seededDataIni, dataFim: seededDataFim } =
         sanitizeDatePair(rawDataIni, rawDataFim);

      params.set("data_ini", seededDataIni);
      params.set("data_fim", seededDataFim);
      stale.forEach((key) => params.delete(key));
      const qs = params.toString();
      latestQsRef.current = qs;
      router.replace(`?${qs}`, { scroll: false });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [spString]);

   // --- Local state (text inputs with debounce) ---
   const [filterOrigem, setFilterOrigem] = useState(urlOrigem);
   const [filterDestino, setFilterDestino] = useState(urlDestino);
   const [filterTrip, setFilterTrip] = useState(urlTrip);
   const [filterFuncao, setFilterFuncao] = useState(urlFuncao);

   const debouncedOrigem = useDebouncedValue(filterOrigem, 350);
   const debouncedDestino = useDebouncedValue(filterDestino, 350);
   const debouncedTrip = useDebouncedValue(filterTrip, 350);

   // --- URL update helper ---
   const updateParams = useCallback(
      (updates: Record<string, string | undefined>) => {
         const params = new URLSearchParams(latestQsRef.current);

         for (const [key, value] of Object.entries(updates)) {
            if (value === undefined || value === "") {
               params.delete(key);
            } else {
               params.set(key, value);
            }
         }

         const qs = params.toString();
         latestQsRef.current = qs;
         router.replace(qs ? `?${qs}` : "?", { scroll: false });
      },
      [router]
   );

   // --- Sync debounced text values to URL ---
   useSyncDebouncedParam(debouncedOrigem, "origem", urlOrigem, updateParams);
   useSyncDebouncedParam(debouncedDestino, "destino", urlDestino, updateParams);
   useSyncDebouncedParam(debouncedTrip, "trip_search", urlTrip, updateParams);

   // --- Sync URL back to local state on external navigation ---
   useSyncParamToState(
      urlOrigem,
      debouncedOrigem,
      filterOrigem,
      setFilterOrigem
   );
   useSyncParamToState(
      urlDestino,
      debouncedDestino,
      filterDestino,
      setFilterDestino
   );
   useSyncParamToState(urlTrip, debouncedTrip, filterTrip, setFilterTrip);

   // --- Aeronaves data ---
   const { data: aeronaveData } = useAeronaves({
      per_page: 100,
      is_sim: false,
   });
   const aeronaveOptions = useMemo(
      () =>
         (aeronaveData?.items ?? []).map((a) => ({
            value: a.matricula,
            label: a.matricula,
         })),
      [aeronaveData]
   );

   // --- Esforco Aereo data ---
   const { data: esfAerData } = useEsfAerList();
   const esfAerOptions = useMemo(
      () =>
         (esfAerData ?? []).map((e) => ({
            value: String(e.id),
            label: e.descricao,
         })),
      [esfAerData]
   );

   // --- Tipos de missao data ---
   const { data: tiposMissaoData } = useTiposMissao();
   const tipoMissaoOptions = useMemo(
      () =>
         (tiposMissaoData ?? []).map((t) => ({
            value: t.cod,
            label: `${t.cod} - ${t.desc}`,
         })),
      [tiposMissaoData]
   );

   // --- Multiselect handlers (direct to URL) ---
   const handleMultiSelectChange = useCallback(
      (key: string, values: string[]) => {
         const params = new URLSearchParams(latestQsRef.current);
         params.delete(key);
         values.forEach((v) => params.append(key, v));
         const qs = params.toString();
         latestQsRef.current = qs;
         router.replace(qs ? `?${qs}` : "?", { scroll: false });
      },
      [router]
   );

   // --- Select / date handlers (direct to URL) ---
   // `resetDataIni`/`resetDataFim` limpam uma data explicitamente (chamados
   // pelo X do chip em `ActiveFilterTags`, hoje fora deste hook): se o default
   // inverte o período em relação à outra data vigente, gravam as DUAS datas
   // default; senão gravam só a resetada, explicitamente (não remove o param
   // — cairia no default de qualquer forma, mas de forma implícita e
   // inconsistente com o outro ramo). Leem a outra data de
   // `new URLSearchParams(latestQsRef.current)`, não do render (`urlDataIni`/
   // `urlDataFim`): `useSearchParams` só atualiza no commit, então entre
   // escrever "Até" e clicar no X de "De" o valor do render ainda reflete a
   // URL anterior e gravaria um par inconsistente com o que acabou de ser
   // digitado. Mesma classe de corrida que motivou a própria `latestQsRef`.
   const resetDataIni = useCallback(() => {
      const cur = new URLSearchParams(latestQsRef.current);
      const { dataFim } = sanitizeDatePair(
         cur.get("data_ini"),
         cur.get("data_fim")
      );
      const novaDataIni = getDefaultDataIni();
      if (novaDataIni > dataFim)
         updateParams({ data_ini: novaDataIni, data_fim: getDefaultDataFim() });
      else updateParams({ data_ini: novaDataIni });
   }, [updateParams]);

   const resetDataFim = useCallback(() => {
      const cur = new URLSearchParams(latestQsRef.current);
      const { dataIni } = sanitizeDatePair(
         cur.get("data_ini"),
         cur.get("data_fim")
      );
      const novaDataFim = getDefaultDataFim();
      if (dataIni > novaDataFim)
         updateParams({ data_ini: getDefaultDataIni(), data_fim: novaDataFim });
      else updateParams({ data_fim: novaDataFim });
   }, [updateParams]);

   // `<input type="date">` emite valores de digitação em andamento: "" ao
   // apagar um segmento e anos parciais ("0002-06-01") enquanto o ano é
   // digitado — nenhum deles é uma escolha do usuário. Gravar um desses na
   // URL faria o seed sanear a data para o default e, se isso invertesse o
   // período, trocar as DUAS datas, descartando a outra sem o usuário tocar
   // nela. Por isso só data válida vai à URL, e o retorno diz se o valor foi
   // aceito: o `DateFilterInput` mantém o rascunho durante a edição e, no
   // blur, volta ao valor vigente se a data não foi aceita.
   // Limpar explicitamente continua pelo X do chip, que chama os resets
   // acima.
   const handleDataIniChange = useCallback(
      (value: string): boolean => {
         if (!isValidDateParam(value)) return false;
         updateParams({ data_ini: value });
         return true;
      },
      [updateParams]
   );

   const handleDataFimChange = useCallback(
      (value: string): boolean => {
         if (!isValidDateParam(value)) return false;
         updateParams({ data_fim: value });
         return true;
      },
      [updateParams]
   );

   const handleFuncaoChange = useCallback(
      (value: string) => {
         setFilterFuncao(value);
         updateParams({ funcao: value || undefined });
      },
      [updateParams]
   );

   // Esforço aéreo é seleção em select fechado (agora por id), como os
   // multiselects: vai direto à URL, sem debounce nem estado local.
   const handleEsfAerChange = useCallback(
      (value: string) => updateParams({ esf_aer_id: value || undefined }),
      [updateParams]
   );

   useEffect(() => {
      if (urlFuncao !== filterFuncao) setFilterFuncao(urlFuncao);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [urlFuncao]);

   useEffect(() => {
      if (filterTrip !== "") return;
      const updates: Record<string, string | undefined> = {};
      if (urlTrip) updates.trip_search = undefined;
      if (urlFuncao) {
         updates.funcao = undefined;
         setFilterFuncao("");
      }
      if (Object.keys(updates).length > 0) updateParams(updates);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [filterTrip]);

   const clearFilters = useCallback(() => {
      setFilterOrigem("");
      setFilterDestino("");
      setFilterTrip("");
      setFilterFuncao("");
      const params = new URLSearchParams();
      params.set("data_ini", getDefaultDataIni());
      params.set("data_fim", getDefaultDataFim());
      const qs = params.toString();
      latestQsRef.current = qs;
      router.replace(`?${qs}`, { scroll: false });
   }, [router]);

   // Período com data inicial posterior à final: strings ISO comparam certo
   // lexicograficamente. Não é "nenhuma etapa encontrada" — é entrada
   // inválida, então a query nem dispara (mesmo 422 que o backend devolveria).
   const periodoInvalido = urlDataIni > urlDataFim;

   // --- React Query ---
   // Sem paginacao: o backend devolve as missoes da janela de datas inteira.
   const params = {
      anv: urlAnv.length > 0 ? urlAnv : undefined,
      origem: debouncedOrigem || undefined,
      destino: debouncedDestino || undefined,
      trip_search: debouncedTrip || undefined,
      funcao: debouncedTrip && urlFuncao ? urlFuncao : undefined,
      esf_aer_id: urlEsfAerId ? Number(urlEsfAerId) : undefined,
      tipo_missao_cod: urlTipoMissao.length > 0 ? urlTipoMissao : undefined,
      data_ini: urlDataIni || undefined,
      data_fim: urlDataFim || undefined,
      is_simulador: false,
   };

   const {
      data,
      isLoading: loading,
      isFetching,
      isError,
      error,
      refetch,
   } = useEtapas(params, !periodoInvalido);

   // `placeholderData: keepPreviousData` devolve o dado anterior mesmo com
   // `enabled: false` (status ainda "pending") — com período inválido a query
   // nem chega a disparar, então a lista (e quem deriva dela, como a seleção)
   // não pode herdar resultado de uma consulta anterior válida.
   const missoes = periodoInvalido ? [] : (data ?? []);
   const totalMissoes = missoes.length;
   const totalEtapas = missoes.reduce((acc, m) => acc + m.etapas.length, 0);

   // Datas só contam como filtro quando o usuário sai do intervalo default
   // (a janela padrão é sempre semeada na URL — contá-la inflaria o badge).
   const dataIniActive = urlDataIni !== getDefaultDataIni();
   const dataFimActive = urlDataFim !== getDefaultDataFim();
   const activeFilterCount =
      (urlAnv.length > 0 ? 1 : 0) +
      (urlTipoMissao.length > 0 ? 1 : 0) +
      [urlOrigem, urlDestino, urlTrip, urlEsfAerId].filter(Boolean).length +
      (urlTrip && urlFuncao ? 1 : 0) +
      (dataIniActive ? 1 : 0) +
      (dataFimActive ? 1 : 0);

   const hasActiveFilters = activeFilterCount > 0;
   const isRefetching = !loading && isFetching;

   return {
      missoes,
      totalMissoes,
      totalEtapas,
      loading,
      isRefetching,
      isError,
      error,
      refetch,
      activeFilterCount,
      hasActiveFilters,
      periodoInvalido,

      // URL param values (for filter tags and filter panel)
      urlAnv,
      urlOrigem,
      urlDestino,
      urlTrip,
      urlFuncao,
      urlEsfAerId,
      urlDataIni,
      urlDataFim,
      urlTipoMissao,
      dataIniActive,
      dataFimActive,

      // Local input state
      filterOrigem,
      setFilterOrigem,
      filterDestino,
      setFilterDestino,
      filterTrip,
      setFilterTrip,
      filterFuncao,

      // Options for selects
      aeronaveOptions,
      esfAerOptions,
      tipoMissaoOptions,

      // Handlers
      updateParams,
      handleMultiSelectChange,
      handleDataIniChange,
      handleDataFimChange,
      resetDataIni,
      resetDataFim,
      handleFuncaoChange,
      handleEsfAerChange,
      clearFilters,
   };
}
