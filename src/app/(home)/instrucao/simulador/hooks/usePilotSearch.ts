import { useState, useEffect, useMemo, useRef } from "react";
import { useTrips } from "@/hooks/queries/useTrips";
import type { GetTripsParams } from "services/routes/trips";

/**
 * Busca de pilotos para os dropdowns do simulador. Encapsula o estado do
 * input, abertura, fechamento por clique externo e o filtro de já atribuídos.
 * Ativa a query apenas com 2+ caracteres.
 */
export function usePilotSearch(assignedIds: Set<number>) {
   const [tripSearch, setTripSearch] = useState("");
   const [searchOpen, setSearchOpen] = useState(false);
   const searchRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      function handleClickOutside(e: MouseEvent) {
         if (
            searchRef.current &&
            !searchRef.current.contains(e.target as Node)
         ) {
            setSearchOpen(false);
         }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
         document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   const searchParams: GetTripsParams | undefined = useMemo(
      () =>
         tripSearch.length >= 2
            ? { search: tripSearch, func: ["pil"], per_page: 10, active: true }
            : undefined,
      [tripSearch]
   );

   const { data: tripsData, isLoading: loadingTrips } = useTrips(
      searchParams,
      !!searchParams
   );

   const searchResults = useMemo(
      () => (tripsData?.items ?? []).filter((t) => !assignedIds.has(t.id!)),
      [tripsData, assignedIds]
   );

   return {
      tripSearch,
      setTripSearch,
      searchOpen,
      setSearchOpen,
      searchRef,
      searchResults,
      loadingTrips,
   };
}
