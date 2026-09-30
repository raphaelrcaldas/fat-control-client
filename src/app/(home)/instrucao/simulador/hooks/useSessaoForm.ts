import { useState, useEffect, useMemo, useCallback } from "react";
import { useToast } from "@/app/context/toast";
import { useCreateMissaoWithEtapas } from "@/hooks/queries/useEtapas";
import { useEsfAerList } from "@/hooks/queries/useEsfAer";
import { useTiposMissao } from "@/hooks/queries/useTiposMissao";
import { computeTvoo } from "../helpers/tvoo";
import {
   EMPTY_SESSAO_DRAFT,
   serializeSessaoDraft,
   type SessaoDraft,
} from "../helpers/sessaoDraft";
import {
   SIM_ANV,
   MAX_PILOTOS,
   type DuplaPilot,
   type CrewSearchResult,
} from "../types";

interface UseSessaoFormArgs {
   /** Ano de referencia da tela — a sessao deve cair dentro dele. */
   anoRef: number;
   /** Observacao da missao, enviada junto da criacao. */
   obs?: string | null;
   /** Chamado com o id real quando a 1ª sessao cria a missao. */
   onPersistDraft?: (newMissaoId: number) => void;
}

/**
 * Estado, validação e submit do formulário de nova dupla: a missão e a 1ª
 * sessão nascem juntas, numa única chamada transacional. A edição de missões
 * existentes é do `useSimuladorMissaoDraft`.
 */
export function useSessaoForm({
   anoRef,
   obs = null,
   onPersistDraft,
}: UseSessaoFormArgs) {
   const { push } = useToast();
   const createMissaoWithEtapas = useCreateMissaoWithEtapas();
   const {
      data: esfAerData,
      error: esfAerError,
      isError: isEsfAerError,
      isLoading: loadingEsfAer,
      isRefetching: refetchingEsfAer,
      refetch: refetchEsfAer,
   } = useEsfAerList();
   const {
      data: tiposMissaoData,
      error: tiposMissaoError,
      isError: isTiposMissaoError,
      isLoading: loadingTipos,
      isRefetching: refetchingTipos,
      refetch: refetchTipos,
   } = useTiposMissao();

   // Estado do formulário
   const [data, setData] = useState("");
   const [origem, setOrigem] = useState("");
   const [destino, setDestino] = useState("");
   const [dep, setDep] = useState("");
   const [arr, setArr] = useState("");
   const [pousos, setPousos] = useState(0);
   const [sagem, setSagem] = useState(false);
   const [parte1, setParte1] = useState(false);
   const [reg, setReg] = useState<"d" | "n" | "v">("d");
   const [tipoMissaoId, setTipoMissaoId] = useState<number | null>(null);
   const [sessionPilots, setSessionPilots] = useState<DuplaPilot[]>([]);

   const addPilot = useCallback((crew: CrewSearchResult) => {
      setSessionPilots((prev) => {
         if (prev.length >= MAX_PILOTOS) return prev;
         return [
            ...prev,
            {
               trip_id: crew.id,
               trig: crew.trig,
               nome_guerra: crew.nome_guerra,
               p_g: crew.p_g,
               func: "pil",
               func_bordo: prev.length === 0 ? "1P" : "2P",
               ant: crew.ant,
               ult_promo: crew.ult_promo,
               ant_rel: crew.ant_rel,
            },
         ];
      });
   }, []);

   const removePilot = useCallback((tripId: number) => {
      setSessionPilots((prev) => prev.filter((p) => p.trip_id !== tripId));
   }, []);

   const updateFuncBordo = useCallback((tripId: number, fb: string) => {
      setSessionPilots((prev) =>
         prev.map((p) => (p.trip_id === tripId ? { ...p, func_bordo: fb } : p))
      );
   }, []);

   // Esforço aéreo SML (fixo do simulador)
   const smlEsfAer = useMemo(
      () => (esfAerData ?? []).find((e) => e.descricao.includes("SML")),
      [esfAerData]
   );

   const tvoo = useMemo(() => computeTvoo(dep, arr), [dep, arr]);
   const tvooValid = tvoo >= 5 && tvoo % 5 === 0;
   // DEP == ARR (duração zero) é diferente de "atravessa o dia" (ARR < DEP).
   const depArrEqual = !!dep && !!arr && dep === arr;
   const crossesDay = !!dep && !!arr && !depArrEqual && tvoo === 0;
   // A sessão precisa cair dentro do ano de referência exibido na tela; senão
   // some da listagem (filtro data_ini/data_fim) e parece que não foi salva.
   const dateOutOfYear = !!data && data.slice(0, 4) !== String(anoRef);

   // Default de tipo de missão quando nenhum está selecionado — garante um
   // valor válido para submeter.
   useEffect(() => {
      if (tiposMissaoData && tiposMissaoData.length > 0 && !tipoMissaoId) {
         setTipoMissaoId(tiposMissaoData[0].id);
      }
   }, [tiposMissaoData, tipoMissaoId]);

   const draft = useMemo<SessaoDraft>(
      () => ({
         data,
         origem,
         destino,
         dep,
         arr,
         pousos,
         sagem,
         parte1,
         reg,
         tipoMissaoId,
         sessionPilots,
      }),
      [
         data,
         origem,
         destino,
         dep,
         arr,
         pousos,
         sagem,
         parte1,
         reg,
         tipoMissaoId,
         sessionPilots,
      ]
   );
   const defaultTipoMissaoId = tiposMissaoData?.[0]?.id ?? null;
   const isDirty =
      serializeSessaoDraft(draft, defaultTipoMissaoId) !==
      serializeSessaoDraft(EMPTY_SESSAO_DRAFT, defaultTipoMissaoId);
   const preview = useMemo(
      () => ({ data, origem, destino, dep, arr, tvoo, sagem, parte1 }),
      [data, origem, destino, dep, arr, tvoo, sagem, parte1]
   );

   const isPending = createMissaoWithEtapas.isPending;
   const isLoadingData = loadingEsfAer || loadingTipos;
   const isCatalogConfigurationError =
      !isLoadingData &&
      !isEsfAerError &&
      !isTiposMissaoError &&
      (!smlEsfAer || !tiposMissaoData?.length);
   const isDataError =
      isEsfAerError || isTiposMissaoError || isCatalogConfigurationError;
   const dataError = esfAerError ?? tiposMissaoError;
   const dataErrorMessage = isCatalogConfigurationError
      ? !smlEsfAer
         ? "A configuração do simulador não contém o esforço aéreo SML."
         : "A configuração do simulador não contém tipos de missão disponíveis."
      : dataError instanceof Error
        ? `Não foi possível carregar os dados da sessão: ${dataError.message}`
        : "Não foi possível carregar os dados da sessão";
   const isRefetchingData = refetchingEsfAer || refetchingTipos;
   const retryLoadingData = useCallback(async () => {
      await Promise.all([refetchEsfAer(), refetchTipos()]);
   }, [refetchEsfAer, refetchTipos]);

   const canSubmit = Boolean(
      isDirty &&
      data &&
      !dateOutOfYear &&
      origem.length === 4 &&
      destino.length === 4 &&
      dep &&
      arr &&
      tvooValid &&
      // Cinto e suspensorio: o campo ja sanitiza, mas NaN aqui viraria
      // `null` no JSON e 422 generico do backend.
      Number.isInteger(pousos) &&
      pousos >= 0 &&
      tipoMissaoId &&
      smlEsfAer &&
      tiposMissaoData?.length &&
      !isDataError &&
      sessionPilots.length > 0 &&
      !isPending
   );

   const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
         e.preventDefault();
         if (!canSubmit) return;

         try {
            const res = await createMissaoWithEtapas.mutateAsync({
               titulo: "Simulador",
               obs,
               is_simulador: true,
               etapas: [
                  {
                     data,
                     origem: origem.toUpperCase(),
                     destino: destino.toUpperCase(),
                     dep: dep.length === 5 ? `${dep}:00` : dep,
                     arr: arr.length === 5 ? `${arr}:00` : arr,
                     tvoo,
                     anv: SIM_ANV,
                     pousos,
                     sagem,
                     parte1,
                     tripulantes: sessionPilots.map((p) => ({
                        trip_id: p.trip_id,
                        func: p.func,
                        func_bordo: p.func_bordo,
                     })),
                     oi_etapas: [
                        {
                           esf_aer_id: smlEsfAer!.id,
                           tipo_missao_id: tipoMissaoId!,
                           reg,
                           tvoo,
                        },
                     ],
                     tow: null,
                     pax: null,
                     carga: null,
                     comb: null,
                     lub: null,
                     nivel: null,
                     obs: null,
                     pqd: [],
                     revo: [],
                     heavy_cds: [],
                  },
               ],
            });
            push({
               title: res.ok ? "Sucesso!" : "Erro",
               message: res.message ?? "Dupla e sessão criadas",
               type: res.ok ? "success" : "error",
            });
            if (res.ok && res.data) onPersistDraft?.(res.data.id);
         } catch (err) {
            push({
               title: "Erro",
               message:
                  err instanceof Error ? err.message : "Erro ao criar sessão",
               type: "error",
            });
         }
      },
      [
         canSubmit,
         sessionPilots,
         smlEsfAer,
         tipoMissaoId,
         reg,
         tvoo,
         data,
         origem,
         destino,
         dep,
         arr,
         pousos,
         sagem,
         parte1,
         obs,
         createMissaoWithEtapas,
         onPersistDraft,
         push,
      ]
   );

   return {
      data,
      setData,
      origem,
      setOrigem,
      destino,
      setDestino,
      dep,
      setDep,
      arr,
      setArr,
      pousos,
      setPousos,
      sagem,
      setSagem,
      parte1,
      setParte1,
      reg,
      setReg,
      tipoMissaoId,
      setTipoMissaoId,
      sessionPilots,
      addPilot,
      removePilot,
      updateFuncBordo,
      smlEsfAer,
      tiposMissaoData,
      tvoo,
      tvooValid,
      crossesDay,
      depArrEqual,
      dateOutOfYear,
      canSubmit,
      isDirty,
      preview,
      isPending,
      isLoadingData,
      isDataError,
      dataErrorMessage,
      isRefetchingData,
      retryLoadingData,
      handleSubmit,
      anoRef,
   };
}

export type SessaoForm = ReturnType<typeof useSessaoForm>;
