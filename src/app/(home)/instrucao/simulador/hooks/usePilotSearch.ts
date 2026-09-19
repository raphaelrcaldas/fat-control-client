import { useState, useEffect, useMemo, useRef } from "react";
import useDebouncedValue from "@/hooks/useDebouncedValue";
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
      // `touchstart` junto: num scroll no celular o navegador nao sintetiza
      // `mousedown`, e o dropdown ficava aberto.
      document.addEventListener("touchstart", handleClickOutside);
      return () => {
         document.removeEventListener("mousedown", handleClickOutside);
         document.removeEventListener("touchstart", handleClickOutside);
      };
   }, []);

   // Sem debounce era uma requisicao por tecla: digitar "SILVA" disparava 4
   // queries, nenhuma servida de cache (`useTrips` tem staleTime 0). Mesmos
   // 300ms do `InlineTripSearch` de estatistica/etapas.
   const debouncedSearch = useDebouncedValue(tripSearch, 300);

   const searchParams: GetTripsParams | undefined = useMemo(() => {
      const termo = debouncedSearch.trim();
      return termo.length >= 2
         ? { search: termo, func: ["pil"], per_page: 10, active: true }
         : undefined;
   }, [debouncedSearch]);

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

   // Entre a tecla e o fim do debounce a query ainda nao foi habilitada,
   // entao `loadingTrips` e false: sem isto o painel piscaria "Nenhum piloto
   // encontrado" por 300ms antes de buscar.
   const aguardandoDebounce = tripSearch.trim() !== debouncedSearch.trim();

   return {
      tripSearch,
      setTripSearch,
      searchOpen,
      setSearchOpen,
      searchRef,
      searchResults,
      loadingTrips: loadingTrips || aguardandoDebounce,
   };
}
