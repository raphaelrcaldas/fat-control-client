import { useState, useRef, useEffect, useMemo } from "react";
import { useTrips } from "@/hooks/queries";
import type { FuncType, OperType } from "../types/trip.types";

type UseTripListParams = {
   uae: string;
   active: boolean;
};

type FilterParams = {
   name: string;
   p_g: string[];
   func: FuncType[];
   oper: OperType[];
};

const PER_PAGE_OPTIONS = [10, 15, 25, 50, 100];

export function useTripList({ uae, active }: UseTripListParams) {
   const [currentPage, setCurrentPage] = useState(1);
   const [perPage, setPerPage] = useState(10);

   const [filters, setFilters] = useState<FilterParams>({
      name: "",
      p_g: [],
      func: [],
      oper: [],
   });

   // Ref para controlar se e a primeira renderizacao
   const isFirstRender = useRef(true);

   // Resetar pagina quando filtros mudam (exceto primeira renderizacao)
   useEffect(() => {
      if (isFirstRender.current) {
         isFirstRender.current = false;
         return;
      }
      setCurrentPage(1);
   }, [filters.name, filters.p_g, filters.func, filters.oper, perPage]);

   // Resetar pagina quando uae/active mudam
   useEffect(() => {
      setCurrentPage(1);
   }, [uae, active]);

   // Montar parametros da query
   const queryParams = useMemo(
      () => ({
         uae,
         active,
         page: currentPage,
         per_page: perPage,
         search: filters.name || undefined,
         p_g: filters.p_g.length > 0 ? filters.p_g : undefined,
         func: filters.func.length > 0 ? filters.func : undefined,
         oper: filters.oper.length > 0 ? filters.oper : undefined,
      }),
      [uae, active, currentPage, perPage, filters]
   );

   const { data, isLoading, isFetching, refetch } = useTrips(queryParams);

   function updateFilter<K extends keyof FilterParams>(
      key: K,
      value: FilterParams[K]
   ) {
      setFilters((prev) => ({ ...prev, [key]: value }));
   }

   function clearFilters() {
      setFilters({ name: "", p_g: [], func: [], oper: [] });
   }

   const handlePageChange = (page: number) => {
      setCurrentPage(page);
   };

   const handlePerPageChange = (newPerPage: number) => {
      setPerPage(newPerPage);
   };

   return {
      trips: data?.items ?? [],
      loading: isLoading,
      isFetching,
      refetch,
      filters,
      updateFilter,
      clearFilters,
      // Paginacao
      currentPage: data?.page ?? currentPage,
      perPage,
      totalPages: data?.pages ?? 1,
      totalTrips: data?.total ?? 0,
      handlePageChange,
      handlePerPageChange,
      PER_PAGE_OPTIONS,
   };
}
