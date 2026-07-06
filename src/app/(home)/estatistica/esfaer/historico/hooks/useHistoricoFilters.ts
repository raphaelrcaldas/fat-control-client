"use client";

/**
 * Estado dos filtros da view de histórico espelhado na URL (compartilhável):
 * `ano` (ano de referência, SEMPRE explícito — gravado até no primeiro acesso)
 * e `search` (busca do rail de programas, debounced). Segue o padrão de
 * `users/hooks/useUsersFilters.ts`.
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { YEAR_OPTIONS } from "../../constants";

export interface HistoricoFilters {
   anoRef: number;
   /** Valor do input de busca (feedback imediato de digitação). */
   query: string;
   setAnoRef: (ano: number) => void;
   setQuery: (value: string) => void;
}

export function useHistoricoFilters(): HistoricoFilters {
   const searchParams = useSearchParams();
   const router = useRouter();

   const currentYear = new Date().getFullYear();

   // --- Leitura dos params da URL (ano validado contra as opções do select) ---
   const anoParam = Number(searchParams.get("ano"));
   const anoRef = YEAR_OPTIONS.includes(anoParam) ? anoParam : currentYear;
   const urlSearch = searchParams.get("search") ?? "";

   // --- Estado local da busca (feedback imediato de digitação) ---
   const [query, setQueryState] = useState(urlSearch);
   const debouncedQuery = useDebouncedValue(query, 350);

   // --- Helper de atualização da URL ---
   const updateParams = useCallback(
      (updates: Record<string, string | undefined>) => {
         // Lê a URL corrente (não o snapshot `searchParams` do render): dois
         // updates no mesmo tick não sobrescrevem um ao outro.
         const params = new URLSearchParams(window.location.search);

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
      [router]
   );

   // --- Ano sempre explícito e VÁLIDO na URL (normaliza ausente/inválido) ---
   useEffect(() => {
      if (searchParams.get("ano") !== String(anoRef)) {
         updateParams({ ano: String(anoRef) });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [searchParams]);

   // --- Sincroniza a busca (debounced) com a URL ---
   useEffect(() => {
      if (debouncedQuery !== urlSearch) {
         updateParams({ search: debouncedQuery || undefined });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [debouncedQuery]);

   // --- Sincroniza o param da URL de volta para o input (ex.: navegação) ---
   useEffect(() => {
      if (urlSearch !== query && urlSearch !== debouncedQuery) {
         setQueryState(urlSearch);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [urlSearch]);

   // --- Handlers ---
   const setQuery = useCallback((value: string) => {
      setQueryState(value);
      // A sincronia com a URL acontece via efeito do debounce acima
   }, []);

   const setAnoRef = useCallback(
      (ano: number) => {
         updateParams({ ano: String(ano) });
      },
      [updateParams]
   );

   return { anoRef, query, setAnoRef, setQuery };
}
