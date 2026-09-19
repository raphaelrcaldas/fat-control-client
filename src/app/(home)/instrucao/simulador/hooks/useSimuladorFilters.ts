"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { todayIso } from "@/../utils/dateHandler";
import { useSimuladorDuplas } from "./useSimuladorDuplas";

function getCurrentYear(): number {
   return Number(todayIso().slice(0, 4));
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
      // O efeito deve reagir ao valor estabilizado, não a cada nova identidade
      // do helper causada pela própria atualização dos search params.
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [debouncedValue]);
}

function useSyncParamToState(
   paramValue: string,
   debouncedValue: string,
   localValue: string,
   setter: (value: string) => void
) {
   useEffect(() => {
      if (paramValue !== localValue && paramValue !== debouncedValue)
         setter(paramValue);
      // Sincroniza apenas navegação externa (voltar/avançar); incluir o estado
      // local faria a digitação disputar com o debounce.
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [paramValue]);
}

export function useSimuladorFilters() {
   const searchParams = useSearchParams();
   const router = useRouter();
   const currentYear = getCurrentYear();
   const spString = searchParams.toString();

   const rawAno = searchParams.get("ano") ?? "";
   const urlAno = /^\d{4}$/.test(rawAno) ? rawAno : String(currentYear);
   const anoRef = Number(urlAno);
   const urlPiloto = searchParams.get("piloto") ?? "";

   useEffect(() => {
      if (rawAno === urlAno) return;

      const params = new URLSearchParams(searchParams.toString());
      params.set("ano", urlAno);
      router.replace(`?${params.toString()}`, { scroll: false });
      // Semeia o default somente na primeira montagem. Mudanças posteriores
      // são feitas pelos handlers ou pela navegação do navegador.
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const [filterPiloto, setFilterPiloto] = useState(urlPiloto);
   const debouncedPiloto = useDebouncedValue(filterPiloto, 350);

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

         const query = params.toString();
         router.replace(query ? `?${query}` : "?", { scroll: false });
      },
      [router, spString]
   );

   useSyncDebouncedParam(debouncedPiloto, "piloto", urlPiloto, updateParams);
   useSyncParamToState(
      urlPiloto,
      debouncedPiloto,
      filterPiloto,
      setFilterPiloto
   );

   const handleAnoChange = useCallback(
      (value: string) => {
         setFilterPiloto("");
         // Ano e piloto mudam juntos para produzir um unico router.replace.
         // Assim o novo ano sempre abre inteiro, sem herdar a busca anterior.
         updateParams({ ano: value, piloto: undefined });
      },
      [updateParams]
   );

   const clearFilters = useCallback(() => {
      setFilterPiloto("");
      const params = new URLSearchParams();
      params.set("ano", String(currentYear));
      router.replace(`?${params.toString()}`, { scroll: false });
   }, [currentYear, router]);

   const removeAnoFilter = useCallback(
      () => updateParams({ ano: String(currentYear) }),
      [currentYear, updateParams]
   );

   const removePilotoFilter = useCallback(() => {
      setFilterPiloto("");
      updateParams({ piloto: undefined });
   }, [updateParams]);

   const duplaState = useSimuladorDuplas(anoRef);

   const filteredDuplas = useMemo(() => {
      // Ao limpar o campo (inclusive numa troca de ano), remove o filtro sem
      // esperar o debounce antigo expirar.
      const term = filterPiloto.trim()
         ? debouncedPiloto.trim().toLowerCase()
         : "";
      if (!term) {
         return { displayed: duplaState.duplas, matched: duplaState.duplas };
      }

      const matched = duplaState.duplas.filter((dupla) =>
         dupla.pilots.some(
            (pilot) =>
               pilot.nome_guerra.toLowerCase().includes(term) ||
               pilot.trig.toLowerCase().includes(term)
         )
      );

      return { displayed: matched, matched };
   }, [debouncedPiloto, duplaState.duplas, filterPiloto]);

   const { displayed: duplas, matched } = filteredDuplas;

   const yearOptions = useMemo(
      () =>
         Array.from(
            new Set([
               currentYear - 2,
               currentYear - 1,
               currentYear,
               currentYear + 1,
               anoRef,
            ])
         ).sort((a, b) => a - b),
      [anoRef, currentYear]
   );

   const anoActive = anoRef !== currentYear;
   const pilotoActive = urlPiloto.trim().length > 0;
   const activeFilterCount = (anoActive ? 1 : 0) + (pilotoActive ? 1 : 0);
   return {
      isLoading: duplaState.isLoading,
      isFetching: duplaState.isFetching,
      isError: duplaState.isError,
      duplas,
      anoRef,
      currentYear,
      yearOptions,
      urlPiloto,
      filterPiloto,
      setFilterPiloto,
      handleAnoChange,
      removeAnoFilter,
      removePilotoFilter,
      clearFilters,
      activeFilterCount,
      hasActiveFilters: activeFilterCount > 0,
      anoActive,
      pilotoActive,
      totalDuplas: matched.length,
      isRefetching: !duplaState.isLoading && duplaState.isFetching,
   };
}
