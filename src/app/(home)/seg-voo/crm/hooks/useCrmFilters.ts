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
   const [sort, setSort] = useState<{
      field: SortField | null;
      direction: SortDirection;
   }>({ field: null, direction: "asc" });

   const debouncedSearch = useDebouncedValue(search, 400);

   const queryParams = useMemo<GetCrmParams>(
      () => ({
         p_g: filterPG.length > 0 ? filterPG.join(",") : undefined,
         funcao: filterFunc.length > 0 ? filterFunc.join(",") : undefined,
      }),
      [filterPG, filterFunc]
   );

   const handleSort = useCallback((field: SortField) => {
      setSort((prev) => {
         if (prev.field !== field) return { field, direction: "asc" };
         // mesmo campo: asc -> desc -> sem ordenação
         if (prev.direction === "asc") return { field, direction: "desc" };
         return { field: null, direction: "asc" };
      });
   }, []);

   const hasActiveFilters =
      !!search ||
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
      sortField: sort.field,
      sortDirection: sort.direction,
      handleSort,
      queryParams,
      hasActiveFilters,
      clearFilters,
   };
}

export type CrmFiltersApi = ReturnType<typeof useCrmFilters>;
