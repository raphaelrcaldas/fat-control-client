import { useCallback, useMemo, useState } from "react";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import type { GetPassaportesParams } from "services/routes/inteligencia/passaportes";
import type { SortField, SortDirection, StatusFilter } from "../types";

/**
 * Estado de filtros e ordenação da listagem de passaportes.
 *
 * `p_g`/`funcao` vão para a API (server-side) porque `funcao` não trafega no
 * payload de cada linha; já busca textual e status são aplicados no cliente
 * (ver usePassaportesView).
 */
export function usePassaportesFilters() {
   const [search, setSearch] = useState("");
   const [filterPG, setFilterPG] = useState<string[]>([]);
   const [filterFunc, setFilterFunc] = useState<string[]>([]);
   const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
   const [sortField, setSortField] = useState<SortField | null>(null);
   const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

   const debouncedSearch = useDebouncedValue(search, 400);

   const queryParams = useMemo<GetPassaportesParams>(
      () => ({
         p_g: filterPG.length > 0 ? filterPG.join(",") : undefined,
         funcao: filterFunc.length > 0 ? filterFunc.join(",") : undefined,
      }),
      [filterPG, filterFunc]
   );

   const handleSort = useCallback((field: SortField) => {
      setSortField((prevField) => {
         if (prevField !== field) {
            setSortDirection("asc");
            return field;
         }
         // mesmo campo: asc -> desc -> sem ordenação
         let reset = false;
         setSortDirection((prevDir) => {
            if (prevDir === "asc") return "desc";
            reset = true;
            return "asc";
         });
         return reset ? null : field;
      });
   }, []);

   const hasActiveFilters =
      !!debouncedSearch ||
      filterPG.length > 0 ||
      filterFunc.length > 0 ||
      statusFilter !== "all";

   const clearFilters = useCallback(() => {
      setSearch("");
      setFilterPG([]);
      setFilterFunc([]);
      setStatusFilter("all");
   }, []);

   return {
      search,
      setSearch,
      debouncedSearch,
      filterPG,
      setFilterPG,
      filterFunc,
      setFilterFunc,
      statusFilter,
      setStatusFilter,
      sortField,
      sortDirection,
      handleSort,
      queryParams,
      hasActiveFilters,
      clearFilters,
   };
}

export type PassaportesFiltersApi = ReturnType<typeof usePassaportesFilters>;
