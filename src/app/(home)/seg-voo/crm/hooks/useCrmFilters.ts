import { useCallback, useMemo, useState } from "react";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import type { GetCrmParams } from "services/routes/seg-voo/crm";
import type { SortField, SortDirection, StatusFilter } from "../types";

/**
 * Estado de filtros e ordenação da listagem de CRM.
 *
 * `p_g`/`funcao` vão para a API (server-side); busca textual e status são
 * aplicados no cliente (ver useCrmView).
 */
export function useCrmFilters() {
   const [search, setSearch] = useState("");
   const [filterPG, setFilterPG] = useState<string[]>([]);
   const [filterFunc, setFilterFunc] = useState<string[]>([]);
   const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
   const [sortField, setSortField] = useState<SortField | null>(null);
   const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

   const debouncedSearch = useDebouncedValue(search, 400);

   const queryParams = useMemo<GetCrmParams>(
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

export type CrmFiltersApi = ReturnType<typeof useCrmFilters>;
