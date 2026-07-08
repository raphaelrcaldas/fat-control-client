"use client";

import { TextInput, Spinner } from "flowbite-react";
import { HiPlus, HiSearch } from "react-icons/hi";
import { usePilotSearch } from "../hooks/usePilotSearch";
import type { CrewSearchResult } from "../types";

interface PilotSearchInputProps {
   assignedIds: Set<number>;
   onSelect: (crew: CrewSearchResult) => void;
   placeholder?: string;
}

/**
 * Input de busca de piloto + dropdown de resultados. Reutilizado pela criação
 * de dupla e pela edição de tripulação da sessão.
 */
export default function PilotSearchInput({
   assignedIds,
   onSelect,
   placeholder = "Buscar piloto...",
}: PilotSearchInputProps) {
   const {
      tripSearch,
      setTripSearch,
      searchOpen,
      setSearchOpen,
      searchRef,
      searchResults,
      loadingTrips,
   } = usePilotSearch(assignedIds);

   function handleSelect(crew: CrewSearchResult) {
      onSelect(crew);
      setTripSearch("");
      setSearchOpen(false);
   }

   return (
      <div ref={searchRef} className="relative">
         <TextInput
            icon={HiSearch}
            placeholder={placeholder}
            value={tripSearch}
            onChange={(e) => {
               setTripSearch(e.target.value);
               setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            sizing="sm"
            className="uppercase"
         />

         {searchOpen && tripSearch.length >= 2 && (
            <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded border border-slate-200 bg-white shadow">
               {loadingTrips ? (
                  <div className="flex justify-center py-3">
                     <Spinner size="sm" color="failure" />
                  </div>
               ) : searchResults.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-gray-400 uppercase">
                     Nenhum piloto encontrado.
                  </p>
               ) : (
                  searchResults.map((crew) => (
                     <button
                        key={crew.id}
                        type="button"
                        onClick={() => handleSelect(crew)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm uppercase hover:bg-gray-100"
                     >
                        <HiPlus className="h-4 w-4 shrink-0 text-green-500" />
                        <span className="text-gray-500">{crew.p_g}</span>
                        <span className="font-medium text-gray-800">
                           {crew.nome_guerra}
                        </span>
                        <span className="font-mono text-xs text-gray-400">
                           ({crew.trig})
                        </span>
                     </button>
                  ))
               )}
            </div>
         )}
      </div>
   );
}
