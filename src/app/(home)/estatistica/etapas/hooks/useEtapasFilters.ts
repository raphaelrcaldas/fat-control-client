"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useEtapas } from "@/hooks/queries";
import { useAeronaves } from "@/hooks/queries/useAeronaves";
import { useEsfAerList } from "@/hooks/queries/useEsfAer";
import { useTiposMissao } from "@/hooks/queries/useTiposMissao";
import { dateToIso, todayIso } from "@/../utils/dateHandler";

// Fuso local (dateHandler), não UTC: após ~21h em UTC-3, toISOString()
// devolveria "amanhã" e deslocaria a janela de 30 dias em um dia.
function getDefaultDataIni(): string {
   const d = new Date();
   d.setDate(d.getDate() - 30);
   return dateToIso(d);
}

function getDefaultDataFim(): string {
   return todayIso();
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
   const urlEsfAer = searchParams.get("esf_aer") ?? "";
   const urlDataIni = searchParams.get("data_ini") ?? getDefaultDataIni();
   const urlDataFim = searchParams.get("data_fim") ?? getDefaultDataFim();

   // --- Seed default dates into URL on first render ---
   // Aproveita para varrer page/per_page: a listagem deixou de paginar, mas
   // link salvo e historico ainda os carregam, e nada mais os removeria.
   useEffect(() => {
      const stale = ["page", "per_page"].filter((key) => searchParams.has(key));
      const needsDates =
         !searchParams.has("data_ini") || !searchParams.has("data_fim");
      if (!needsDates && stale.length === 0) return;

      const params = new URLSearchParams(searchParams.toString());
      if (!params.has("data_ini")) params.set("data_ini", getDefaultDataIni());
      if (!params.has("data_fim")) params.set("data_fim", getDefaultDataFim());
      stale.forEach((key) => params.delete(key));
      router.replace(`?${params.toString()}`, { scroll: false });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   // --- Local state (text inputs with debounce) ---
   const [filterOrigem, setFilterOrigem] = useState(urlOrigem);
   const [filterDestino, setFilterDestino] = useState(urlDestino);
   const [filterTrip, setFilterTrip] = useState(urlTrip);
   const [filterEsfAer, setFilterEsfAer] = useState(urlEsfAer);
   const [filterFuncao, setFilterFuncao] = useState(urlFuncao);

   const debouncedOrigem = useDebouncedValue(filterOrigem, 350);
   const debouncedDestino = useDebouncedValue(filterDestino, 350);
   const debouncedTrip = useDebouncedValue(filterTrip, 350);
   const debouncedEsfAer = useDebouncedValue(filterEsfAer, 350);

   // --- URL update helper ---
   const updateParams = useCallback(
      (updates: Record<string, string | undefined>) => {
         const params = new URLSearchParams(spString);

         for (const [key, value] of Object.entries(updates)) {
            if (value === undefined || value === "") {
               params.delete(key);
            } else {
               params.set(key, value);
            }
         }

         const qs = params.toString();
         router.replace(qs ? `?${qs}` : "?", { scroll: false });
      },
      [spString, router]
   );

   // --- Sync debounced text values to URL ---
   useSyncDebouncedParam(debouncedOrigem, "origem", urlOrigem, updateParams);
   useSyncDebouncedParam(debouncedDestino, "destino", urlDestino, updateParams);
   useSyncDebouncedParam(debouncedTrip, "trip_search", urlTrip, updateParams);
   useSyncDebouncedParam(debouncedEsfAer, "esf_aer", urlEsfAer, updateParams);

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
   useSyncParamToState(
      urlEsfAer,
      debouncedEsfAer,
      filterEsfAer,
      setFilterEsfAer
   );

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
            value: e.descricao,
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
         const params = new URLSearchParams(spString);
         params.delete(key);
         values.forEach((v) => params.append(key, v));
         const qs = params.toString();
         router.replace(qs ? `?${qs}` : "?", { scroll: false });
      },
      [spString, router]
   );

   // --- Select / date handlers (direct to URL) ---
   const handleDataIniChange = useCallback(
      (value: string) => updateParams({ data_ini: value || undefined }),
      [updateParams]
   );

   const handleDataFimChange = useCallback(
      (value: string) => updateParams({ data_fim: value || undefined }),
      [updateParams]
   );

   const handleFuncaoChange = useCallback(
      (value: string) => {
         setFilterFuncao(value);
         updateParams({ funcao: value || undefined });
      },
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
      setFilterEsfAer("");
      setFilterFuncao("");
      const params = new URLSearchParams();
      params.set("data_ini", getDefaultDataIni());
      params.set("data_fim", getDefaultDataFim());
      router.replace(`?${params.toString()}`, { scroll: false });
   }, [router]);

   // --- React Query ---
   // Sem paginacao: o backend devolve as missoes da janela de datas inteira.
   const params = {
      anv: urlAnv.length > 0 ? urlAnv : undefined,
      origem: debouncedOrigem || undefined,
      destino: debouncedDestino || undefined,
      trip_search: debouncedTrip || undefined,
      funcao: debouncedTrip && urlFuncao ? urlFuncao : undefined,
      esf_aer: debouncedEsfAer || undefined,
      tipo_missao_cod: urlTipoMissao.length > 0 ? urlTipoMissao : undefined,
      data_ini: urlDataIni || undefined,
      data_fim: urlDataFim || undefined,
      is_simulador: false,
   };

   const { data, isLoading: loading, isFetching } = useEtapas(params);

   const missoes = data ?? [];
   const totalMissoes = missoes.length;
   const totalEtapas = missoes.reduce((acc, m) => acc + m.etapas.length, 0);

   // Datas só contam como filtro quando o usuário sai do intervalo default
   // (a janela padrão é sempre semeada na URL — contá-la inflaria o badge).
   const dataIniActive = urlDataIni !== getDefaultDataIni();
   const dataFimActive = urlDataFim !== getDefaultDataFim();
   const activeFilterCount =
      (urlAnv.length > 0 ? 1 : 0) +
      (urlTipoMissao.length > 0 ? 1 : 0) +
      [urlOrigem, urlDestino, urlTrip, urlEsfAer].filter(Boolean).length +
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
      activeFilterCount,
      hasActiveFilters,

      // URL param values (for filter tags and filter panel)
      urlAnv,
      urlOrigem,
      urlDestino,
      urlTrip,
      urlFuncao,
      urlEsfAer,
      urlDataIni,
      urlDataFim,
      urlTipoMissao,

      // Local input state
      filterOrigem,
      setFilterOrigem,
      filterDestino,
      setFilterDestino,
      filterTrip,
      setFilterTrip,
      filterFuncao,
      filterEsfAer,
      setFilterEsfAer,

      // Options for selects
      aeronaveOptions,
      esfAerOptions,
      tipoMissaoOptions,

      // Handlers
      updateParams,
      handleMultiSelectChange,
      handleDataIniChange,
      handleDataFimChange,
      handleFuncaoChange,
      clearFilters,
   };
}
