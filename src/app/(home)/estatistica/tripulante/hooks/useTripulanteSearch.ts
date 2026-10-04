import { useState } from "react";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useTrips } from "@/hooks/queries/useTrips";

export const SEARCH_PAGE_SIZE = 10;
export const MIN_SEARCH_CHARS = 2;

export function useTripulanteSearch(show: boolean) {
   const [search, setSearch] = useState("");
   const term = useDebouncedValue(search.trim(), 350);
   // A página só vale para o termo em que foi escolhida. Trocar o termo
   // debounced inicia a nova consulta na página 1, sem consulta intermediária.
   const [pageState, setPageState] = useState({ term: "", page: 1 });
   if (pageState.term !== term) setPageState({ term, page: 1 });
   const page = pageState.term === term ? pageState.page : 1;
   const query = useTrips(
      {
         search: term,
         page,
         per_page: SEARCH_PAGE_SIZE,
         include_inactive: true,
      },
      show && term.length >= MIN_SEARCH_CHARS
   );
   const hasQuery = search.trim().length >= MIN_SEARCH_CHARS;
   const loading = query.isFetching || term !== search.trim();
   const items = (query.data?.items ?? []).filter(
      (trip): trip is typeof trip & { id: number } => trip.id != null
   );

   function reset() {
      setSearch("");
      setPageState({ term: "", page: 1 });
   }

   return {
      search,
      setSearch,
      term,
      page,
      setPage: (next: number) => setPageState({ term, page: next }),
      query,
      hasQuery,
      loading,
      items,
      reset,
   };
}
