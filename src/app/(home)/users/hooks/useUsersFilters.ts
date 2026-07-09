"use client";

/**
 * Estado dos filtros da listagem de usuários, espelhado na URL
 * (compartilhável). Encapsula leitura dos params, sincronização da busca
 * (debounced) e os handlers de atualização, deixando a página apenas com
 * a apresentação. Os params de query para o `useUsers` já saem prontos.
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import type { GetUsersParams } from "services/routes/users";

const DEFAULT_PER_PAGE = 25;
const DEFAULT_PAGE = 1;
const DEFAULT_ACTIVE = ["true"];

export const PER_PAGE_OPTIONS = [25, 50, 100];

// Converte o array de status (["true"]/["false"]/[]) em boolean | undefined.
function getActiveFilter(active: string[]): boolean | undefined {
   if (active.length === 0 || active.length === 2) return undefined;
   if (active.includes("true")) return true;
   if (active.includes("false")) return false;
   return undefined;
}

// Faz o parse de um param separado por vírgula (string vazia = array vazio).
function parseCommaSeparated(value: string | null): string[] {
   if (!value) return [];
   return value.split(",").filter(Boolean);
}

export interface UsersFilters {
   filterName: string;
   filterPG: string[];
   filterQuadro: string;
   filterEsp: string;
   filterActive: string[];
   currentPage: number;
   perPage: number;
   hasFilters: boolean;
   queryParams: GetUsersParams;
   setSearch: (value: string) => void;
   setPG: (values: string[]) => void;
   setQuadro: (value: string) => void;
   setEsp: (value: string) => void;
   setActive: (values: string[]) => void;
   setPage: (page: number) => void;
   setPerPage: (value: number) => void;
}

export function useUsersFilters(): UsersFilters {
   const searchParams = useSearchParams();
   const router = useRouter();

   // --- Leitura dos params da URL ---
   const urlSearch = searchParams.get("search") ?? "";
   const filterPG = parseCommaSeparated(searchParams.get("pg"));
   const filterQuadro = searchParams.get("quadro") ?? "";
   const filterEsp = searchParams.get("esp") ?? "";
   const filterActive =
      searchParams.get("active") !== null
         ? parseCommaSeparated(searchParams.get("active"))
         : DEFAULT_ACTIVE;
   const currentPage = Number(searchParams.get("page")) || DEFAULT_PAGE;
   const perPage = Number(searchParams.get("per_page")) || DEFAULT_PER_PAGE;

   // --- Estado local da busca (feedback imediato de digitação) ---
   const [filterName, setFilterName] = useState(urlSearch);
   const debouncedFilter = useDebouncedValue(filterName, 350);

   // --- Helper de atualização da URL ---
   const updateParams = useCallback(
      (updates: Record<string, string | undefined>, resetPage = true) => {
         const params = new URLSearchParams(searchParams.toString());

         for (const [key, value] of Object.entries(updates)) {
            if (value === undefined || value === "") {
               params.delete(key);
            } else {
               params.set(key, value);
            }
         }

         // Volta para a página 1 quando um filtro muda
         if (resetPage) {
            params.delete("page");
         }

         // Limpa os defaults da URL
         if (params.get("per_page") === String(DEFAULT_PER_PAGE)) {
            params.delete("per_page");
         }
         if (params.get("page") === String(DEFAULT_PAGE)) {
            params.delete("page");
         }
         // active=true é o padrão, então some da URL
         if (params.get("active") === "true") {
            params.delete("active");
         }

         const qs = params.toString();
         router.replace(qs ? `?${qs}` : "?", { scroll: false });
      },
      [searchParams, router]
   );

   // --- Sincroniza a busca (debounced) com a URL ---
   useEffect(() => {
      if (debouncedFilter !== urlSearch) {
         updateParams({ search: debouncedFilter || undefined });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [debouncedFilter]);

   // --- Sincroniza o param da URL de volta para o input (ex.: navegação) ---
   useEffect(() => {
      if (urlSearch !== filterName && urlSearch !== debouncedFilter) {
         setFilterName(urlSearch);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [urlSearch]);

   // --- Handlers ---
   const setSearch = useCallback((value: string) => {
      setFilterName(value);
      // A sincronia com a URL acontece via efeito do debounce acima
   }, []);

   const setPG = useCallback(
      (values: string[]) => {
         updateParams({ pg: values.length > 0 ? values.join(",") : undefined });
      },
      [updateParams]
   );

   const setQuadro = useCallback(
      (value: string) => {
         updateParams({ quadro: value || undefined });
      },
      [updateParams]
   );

   const setEsp = useCallback(
      (value: string) => {
         updateParams({ esp: value || undefined });
      },
      [updateParams]
   );

   const setActive = useCallback(
      (values: string[]) => {
         updateParams({ active: values.length === 0 ? "" : values.join(",") });
      },
      [updateParams]
   );

   const setPage = useCallback(
      (page: number) => {
         updateParams(
            { page: page > DEFAULT_PAGE ? String(page) : undefined },
            false
         );
      },
      [updateParams]
   );

   const setPerPage = useCallback(
      (value: number) => {
         updateParams({
            per_page: value !== DEFAULT_PER_PAGE ? String(value) : undefined,
         });
      },
      [updateParams]
   );

   const hasFilters = Boolean(
      debouncedFilter ||
      filterPG.length > 0 ||
      filterQuadro ||
      filterEsp ||
      filterActive.length > 0
   );

   const queryParams: GetUsersParams = {
      page: currentPage,
      per_page: perPage,
      search: debouncedFilter || undefined,
      p_g: filterPG.length > 0 ? filterPG.join(",") : undefined,
      quadro: filterQuadro || undefined,
      esp: filterEsp || undefined,
      active: getActiveFilter(filterActive),
   };

   return {
      filterName,
      filterPG,
      filterQuadro,
      filterEsp,
      filterActive,
      currentPage,
      perPage,
      hasFilters,
      queryParams,
      setSearch,
      setPG,
      setQuadro,
      setEsp,
      setActive,
      setPage,
      setPerPage,
   };
}
