import { useState, useEffect } from "react";
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

export function useTripList({ uae, active }: UseTripListParams) {
   const [trips, setTrips] = useState<Trip[]>([]);
   const [filterTrips, setFilterTrips] = useState<Trip[]>([]);
   const [loading, setLoading] = useState(false);
   const [filters, setFilters] = useState<FilterParams>({
      name: "",
      p_g: [],
      func: [],
      oper: [],
   });

   async function fetchTrips() {
      setLoading(true);
      try {
         const data = await getTrips({ uae: uae, active: active });
         data.sort((a, b) => a.user.posto.ant - b.user.posto.ant);
         setTrips(data);

         // Verifica se há filtros ativos
         const hasActiveFilters =
            filters.name !== "" ||
            filters.p_g.length > 0 ||
            filters.func.length > 0 ||
            filters.oper.length > 0;

         // Se houver filtros ativos, reaplica os filtros nos novos dados
         if (hasActiveFilters) {
            const filtered = applyFiltersToData(data, filters);
            setFilterTrips(filtered);
         } else {
            setFilterTrips(data);
         }
      } catch (err: any) {
         console.error("Erro ao buscar tripulações:", err);
      } finally {
         setLoading(false);
      }
   }



   // Função auxiliar para aplicar filtros em um array de trips
   function applyFiltersToData(data: Trip[], filterParams: FilterParams): Trip[] {
      let filtered = [...data];

      // Filtro por nome/trigrama
      if (filterParams.name && filterParams.name.length > 0) {
         const inputFilter = filterParams.name.toLowerCase();
         filtered = filtered.filter((trip) => {
            const checkTrig = trip.trig.includes(inputFilter);
            const checkGuerra = trip.user.nome_guerra
               .toLowerCase()
               .includes(inputFilter);
            return checkTrig || checkGuerra;
         });
      }

      // Filtro por posto/graduação (OR logic)
      if (filterParams.p_g.length > 0) {
         filtered = filtered.filter((trip) =>
            filterParams.p_g.includes(trip.user.p_g)
         );
      }

      // Filtro por função (OR logic)
      if (filterParams.func.length > 0) {
         filtered = filtered.filter((trip) =>
            trip.funcs?.some((func) => filterParams.func.includes(func.func))
         );
      }

      // Filtro por operação (OR logic)
      if (filterParams.oper.length > 0) {
         filtered = filtered.filter((trip) =>
            trip.funcs?.some((func) => filterParams.oper.includes(func.oper))
         );
      }

      return filtered;
   }

   // Aplica todos os filtros
   function applyFilters(filterParams: FilterParams) {
      const filtered = applyFiltersToData(trips, filterParams);
      setFilterTrips(filtered);
   }

   function updateFilter(key: keyof FilterParams, value: string | string[]) {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);
      applyFilters(newFilters);
   }

   function toggleFilterValue<K extends keyof FilterParams>(
      key: K,
      value: FilterParams[K] extends (infer U)[] ? U : never
   ) {
      const currentArray = filters[key] as any[];
      const newArray = currentArray.includes(value)
         ? currentArray.filter((v) => v !== value)
         : [...currentArray, value];

      updateFilter(key, newArray);
   }

   function removeFilterValue<K extends keyof FilterParams>(
      key: K,
      value: FilterParams[K] extends (infer U)[] ? U : never
   ) {
      const currentArray = filters[key] as any[];
      const newArray = currentArray.filter((v) => v !== value);
      updateFilter(key, newArray);
   }

   function clearFilters() {
      const emptyFilters: FilterParams = { name: "", p_g: [], func: [], oper: [] };
      setFilters(emptyFilters);
      setFilterTrips(trips);
   }

   useEffect(() => {
      fetchTrips();
   }, [uae, active]);

   return {
      trips,
      filterTrips,
      loading,
      refetch: fetchTrips,
      filters,
      updateFilter,
      toggleFilterValue,
      removeFilterValue,
      clearFilters,
   };
}
