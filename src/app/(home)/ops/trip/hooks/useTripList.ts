import { useState, useEffect, useCallback, useRef } from "react";
import { getTrips } from "services/routes/trips";
import type { Trip } from "../types/trip.types";
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
   const [trips, setTrips] = useState<Trip[]>([]);
   const [loading, setLoading] = useState(false);
   const [currentPage, setCurrentPage] = useState(1);
   const [perPage, setPerPage] = useState(10);
   const [totalPages, setTotalPages] = useState(1);
   const [totalTrips, setTotalTrips] = useState(0);
   
   const [filters, setFilters] = useState<FilterParams>({
      name: "",
      p_g: [],
      func: [],
      oper: [],
   });

   // Ref para controlar se é a primeira renderização
   const isFirstRender = useRef(true);

   const fetchTrips = useCallback(
      async (
         page: number,
         itemsPerPage: number,
         filterParams: FilterParams,
         signal?: AbortSignal
      ) => {
         setLoading(true);
         try {
            const response = await getTrips(
               {
                  uae,
                  active,
                  page,
                  per_page: itemsPerPage,
                  search: filterParams.name || undefined,
                  p_g: filterParams.p_g.length > 0 ? filterParams.p_g : undefined,
                  func: filterParams.func.length > 0 ? filterParams.func : undefined,
                  oper: filterParams.oper.length > 0 ? filterParams.oper : undefined,
               },
               signal
            );
            setTrips(response.items);
            setTotalPages(response.pages);
            setTotalTrips(response.total);
            setCurrentPage(response.page);
         } catch (err: any) {
            if (err?.name === "AbortError") return;
            console.error("Erro ao buscar tripulações:", err);
         } finally {
            setLoading(false);
         }
      },
      [uae, active]
   );

   // Busca inicial e quando uae/active mudam
   useEffect(() => {
      const ac = new AbortController();
      fetchTrips(1, perPage, filters, ac.signal);
      return () => ac.abort();
   }, [uae, active]);

   // Busca quando filtros mudam (exceto na primeira renderização)
   useEffect(() => {
      if (isFirstRender.current) {
         isFirstRender.current = false;
         return;
      }
      
      const ac = new AbortController();
      const timeoutId = setTimeout(() => {
         fetchTrips(1, perPage, filters, ac.signal);
      }, 50); // Pequeno delay para debounce
      
      return () => {
         clearTimeout(timeoutId);
         ac.abort();
      };
   }, [filters.name, filters.p_g, filters.func, filters.oper, perPage]);

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
      const ac = new AbortController();
      fetchTrips(page, perPage, filters, ac.signal);
   };

   const handlePerPageChange = (newPerPage: number) => {
      setPerPage(newPerPage);
      // O useEffect vai buscar automaticamente
   };

   const refetch = () => {
      const ac = new AbortController();
      fetchTrips(currentPage, perPage, filters, ac.signal);
   };

   return {
      trips,
      filterTrips: trips,
      loading,
      refetch,
      filters,
      updateFilter,
      clearFilters,
      // Paginação
      currentPage,
      perPage,
      totalPages,
      totalTrips,
      handlePageChange,
      handlePerPageChange,
      PER_PAGE_OPTIONS,
   };
}
