"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { TextInput, Spinner } from "flowbite-react";
import { HiPlus, HiX, HiSearch } from "react-icons/hi";
import { useTrips } from "@/hooks/queries/useTrips";
import type { GetTripsParams } from "services/routes/trips";
import { MAX_PILOTOS } from "../types";

interface SessionPilot {
   trip_id: number;
   trig: string;
   nome_guerra: string;
   p_g: string;
   func: string;
   func_bordo: string;
}

interface PilotSearchDropdownProps {
   pilots: SessionPilot[];
   onAdd: (crew: {
      id: number;
      trig: string;
      nome_guerra: string;
      p_g: string;
   }) => void;
   onRemove: (tripId: number) => void;
   onUpdateFuncBordo: (tripId: number, fb: string) => void;
   showSearch: boolean;
}

export default function PilotSearchDropdown({
   pilots,
   onAdd,
   onRemove,
   onUpdateFuncBordo,
   showSearch,
}: PilotSearchDropdownProps) {
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

   const { data: tripsData, isLoading: loadingTrips } = useTrips(searchParams);

   const assignedIds = useMemo(
      () => new Set(pilots.map((p) => p.trip_id)),
      [pilots]
   );

   const searchResults = useMemo(
      () => (tripsData?.items ?? []).filter((t) => !assignedIds.has(t.id!)),
      [tripsData, assignedIds]
   );

   const handleAdd = useCallback(
      (crew: {
         id: number;
         trig: string;
         nome_guerra: string;
         p_g: string;
      }) => {
         onAdd(crew);
         setTripSearch("");
         setSearchOpen(false);
      },
      [onAdd]
   );

   return (
      <>
         {showSearch && pilots.length < MAX_PILOTOS && (
            <div ref={searchRef} className="relative mb-3">
               <TextInput
                  icon={HiSearch}
                  placeholder="Buscar piloto..."
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
                  <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
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
                              onClick={() =>
                                 handleAdd({
                                    id: crew.id!,
                                    trig: crew.trig,
                                    nome_guerra: crew.user.nome_guerra,
                                    p_g: crew.user.p_g,
                                 })
                              }
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm uppercase hover:bg-gray-100"
                           >
                              <HiPlus className="h-4 w-4 shrink-0 text-green-500" />
                              <span className="text-gray-500">
                                 {crew.user.p_g}
                              </span>
                              <span className="font-medium text-gray-800">
                                 {crew.user.nome_guerra}
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
         )}

         <div className="space-y-2">
            {pilots.length === 0 && (
               <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-200 px-4 py-4 text-xs text-gray-400">
                  Busque e adicione pelo menos um piloto
               </div>
            )}
            {pilots.map((p) => (
               <div
                  key={p.trip_id}
                  className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50/60 px-4 py-2.5"
               >
                  <div className="min-w-0 flex-1">
                     <p className="text-sm font-semibold text-gray-900 uppercase">
                        {p.p_g} {p.nome_guerra}
                     </p>
                  </div>
                  <select
                     value={p.func_bordo}
                     onChange={(e) =>
                        onUpdateFuncBordo(p.trip_id, e.target.value)
                     }
                     className="rounded-lg border border-gray-300 bg-gray-50 px-2 py-1 text-sm w-16"
                  >
                     <option value="1P">1P</option>
                     <option value="2P">2P</option>
                     <option value="IN">IN</option>
                     <option value="AL">AL</option>
                  </select>
                  {showSearch && (
                     <button
                        type="button"
                        onClick={() => onRemove(p.trip_id)}
                        className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-500"
                     >
                        <HiX className="h-4 w-4" />
                     </button>
                  )}
               </div>
            ))}
         </div>
      </>
   );
}
