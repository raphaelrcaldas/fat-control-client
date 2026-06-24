import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getCities, type Cidade } from "services/routes/cities";

/** Cidade com métricas de uso opcionais (presentes só na busca ranqueada). */
export interface RankedCidade extends Cidade {
   usos?: number;
   mais_usada?: boolean;
}

export type CityFetcher = (
   search: string,
   signal?: AbortSignal
) => Promise<RankedCidade[]>;

interface UseCitySearchOptions {
   /** Fonte de dados; default = busca genérica de cidades. */
   fetcher?: CityFetcher;
   queryKey?: (term: string) => readonly unknown[];
   /** Permite buscar com termo vazio (ex.: mostrar mais usadas ao abrir). */
   allowEmpty?: boolean;
   enabled?: boolean;
}

function useDebounced<T>(value: T, delay = 300): T {
   const [debounced, setDebounced] = useState(value);
   useEffect(() => {
      const id = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(id);
   }, [value, delay]);
   return debounced;
}

export function useCitySearch(
   search: string,
   {
      fetcher = getCities,
      queryKey = (term) => ["cities", term],
      allowEmpty = false,
      enabled = true,
   }: UseCitySearchOptions = {}
) {
   const term = useDebounced(search.trim(), 300);
   const canSearch = enabled && (allowEmpty || term.length > 0);

   const query = useQuery({
      queryKey: queryKey(term),
      queryFn: ({ signal }) => fetcher(term, signal),
      placeholderData: keepPreviousData,
      enabled: canSearch,
   });

   const cities = canSearch ? (query.data ?? []) : [];
   const maisUsadas = cities.filter((c) => c.mais_usada);
   const demais = cities.filter((c) => !c.mais_usada);

   return {
      maisUsadas,
      demais,
      total: cities.length,
      hasRanking: maisUsadas.length > 0,
      isFetching: query.isFetching && canSearch,
      canSearch,
   };
}
