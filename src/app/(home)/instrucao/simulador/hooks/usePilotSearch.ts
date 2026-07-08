import { useState, useEffect, useMemo, useRef } from "react";
import { useTrips } from "@/hooks/queries/useTrips";
import type { GetTripsParams } from "services/routes/trips";
import type { CrewSearchResult } from "../types";

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

   // Normaliza para CrewSearchResult e descarta itens sem id ou já atribuídos.
   const searchResults = useMemo<CrewSearchResult[]>(
      () =>
         (tripsData?.items ?? [])
            .filter((t) => t.id != null && !assignedIds.has(t.id))
            .map((t) => ({
               id: t.id!,
               trig: t.trig,
               nome_guerra: t.user.nome_guerra,
               p_g: t.user.p_g,
            })),
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
