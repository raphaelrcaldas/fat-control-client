"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import clsx from "clsx";
import { Badge, TextInput } from "flowbite-react";
import { IoSearchSharp, IoClose, IoAdd } from "react-icons/io5";
import { HiAcademicCap } from "react-icons/hi";
import {
   TripulanteSearchResult,
   FuncaoTripulante,
   FUNCAO_LABELS,
} from "../../types";
import { searchTrips } from "services/routes/trips";

interface TripulanteSelectProps {
   funcao: FuncaoTripulante;
   projeto: string;
   tripulantes: TripulanteSearchResult[];
   onAdd: (tripulante: TripulanteSearchResult) => void;
   onRemove: (tripulanteId: number) => void;
   disabled?: boolean;
   excludeIds?: number[];
}

export function TripulanteSelect({
   funcao,
   projeto,
   tripulantes,
   onAdd,
   onRemove,
   disabled = false,
   excludeIds = [],
}: TripulanteSelectProps) {
   const [query, setQuery] = useState("");
   const [results, setResults] = useState<TripulanteSearchResult[]>([]);
   const [isOpen, setIsOpen] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [showSearch, setShowSearch] = useState(false);
   const containerRef = useRef<HTMLDivElement>(null);
   const inputRef = useRef<HTMLInputElement>(null);
   const abortControllerRef = useRef<AbortController | null>(null);

   // Debounced search
   useEffect(() => {
      if (!query.trim()) {
         setResults([]);
         return;
      }

      const timeoutId = setTimeout(async () => {
         if (abortControllerRef.current) {
            abortControllerRef.current.abort();
         }
         abortControllerRef.current = new AbortController();

         setIsLoading(true);
         try {
            const data = await searchTrips(
               { func: funcao, q: query, proj: projeto },
               abortControllerRef.current.signal
            );
            setResults(data);
         } catch (error) {
            if ((error as Error).name !== "AbortError") {
               console.error("Erro ao buscar tripulantes:", error);
            }
         } finally {
            setIsLoading(false);
         }
      }, 300);

      return () => clearTimeout(timeoutId);
   }, [query, funcao, projeto]);

   // Close dropdown on click outside
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (
            containerRef.current &&
            !containerRef.current.contains(event.target as Node)
         ) {
            setIsOpen(false);
            setShowSearch(false);
            setQuery("");
         }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
         document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   // Focus input when search is shown
   useEffect(() => {
      if (showSearch && inputRef.current) {
         inputRef.current.focus();
      }
   }, [showSearch]);

   const handleSelect = (tripulante: TripulanteSearchResult) => {
      onAdd(tripulante);
      setQuery("");
      setResults([]);
      setIsOpen(false);
      setShowSearch(false);
   };

   // Ordena resultados: já adicionados primeiro (na ordem do excludeIds), depois os demais
   const sortedResults = useMemo(() => {
      return [...results].sort((a, b) => {
         const aIndex = excludeIds.indexOf(a.id);
         const bIndex = excludeIds.indexOf(b.id);
         const aIsAdded = aIndex !== -1;
         const bIsAdded = bIndex !== -1;

         if (aIsAdded && bIsAdded) return aIndex - bIndex;
         if (aIsAdded) return -1;
         if (bIsAdded) return 1;
         return 0;
      });
   }, [results, excludeIds]);

   const renderOperBadge = (oper: string) => {
      if (oper === "in") {
         return (
            <Badge color="purple" size="xs">
               <span className="flex items-center gap-1">
                  <HiAcademicCap className="h-3 w-3" />
                  IN
               </span>
            </Badge>
         );
      }
      if (oper === "al") {
         return (
            <Badge color="warning" size="xs">
               <span className="flex items-center gap-1">
                  <HiAcademicCap className="h-3 w-3" />
                  AL
               </span>
            </Badge>
         );
      }
      return null;
   };

   // Se não está em modo de edição e não há tripulantes, não renderiza nada
   if (disabled && tripulantes.length === 0) {
      return null;
   }

   return (
      <div
         ref={containerRef}
         className="rounded-lg border border-gray-200 bg-white p-4"
      >
         <label className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
            {FUNCAO_LABELS[funcao]}
            {tripulantes.length > 0 && (
               <Badge color="gray" size="xs">
                  {tripulantes.length}
               </Badge>
            )}
         </label>

         {tripulantes.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
               {tripulantes.map((trip) => (
                  <div
                     key={trip.id}
                     className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5"
                  >
                     <span className="font-mono text-sm font-bold text-green-700 uppercase">
                        {trip.trig}
                     </span>
                     <span className="text-xs text-gray-700 uppercase">
                        {trip.p_g} {trip.nome_guerra}
                     </span>
                     {!disabled && (
                        <button
                           type="button"
                           onClick={() => onRemove(trip.id)}
                           className="ml-1 text-gray-400 transition-colors hover:text-red-500"
                        >
                           <IoClose className="h-4 w-4" />
                        </button>
                     )}
                  </div>
               ))}
            </div>
         )}

         {/* Botão adicionar ou campo de busca */}
         {!disabled && (
            <>
               {!showSearch ? (
                  <button
                     type="button"
                     onClick={() => setShowSearch(true)}
                     className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                     <IoAdd className="h-4 w-4" />
                     Adicionar
                  </button>
               ) : (
                  <div className="relative">
                     <TextInput
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                           setQuery(e.target.value);
                           setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        placeholder="Buscar por trigrama ou nome..."
                        icon={IoSearchSharp}
                        sizing="sm"
                     />

                     {isLoading && (
                        <div className="absolute top-1/2 right-3 -translate-y-1/2">
                           <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                        </div>
                     )}

                     {isOpen && sortedResults.length > 0 && (
                        <div className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                           {sortedResults.map((tripulante) => {
                              const isAdded = excludeIds.includes(
                                 tripulante.id
                              );
                              return (
                                 <button
                                    key={tripulante.id}
                                    type="button"
                                    onClick={() =>
                                       !isAdded && handleSelect(tripulante)
                                    }
                                    disabled={isAdded}
                                    className={clsx(
                                       "flex w-full items-center gap-2 border-b border-gray-100 px-3 py-2 text-left last:border-b-0",
                                       isAdded
                                          ? "cursor-not-allowed bg-gray-50 opacity-60"
                                          : "cursor-pointer hover:bg-gray-50"
                                    )}
                                 >
                                    <span className="font-mono text-sm font-bold text-gray-700 uppercase">
                                       {tripulante.trig}
                                    </span>
                                    <span className="flex-1 truncate text-xs text-gray-600 uppercase">
                                       {tripulante.p_g} {tripulante.nome_guerra}
                                    </span>
                                    {isAdded && (
                                       <Badge color="gray" size="xs">
                                          Adicionado
                                       </Badge>
                                    )}
                                    {renderOperBadge(tripulante.oper)}
                                 </button>
                              );
                           })}
                        </div>
                     )}

                     {isOpen &&
                        query.length >= 2 &&
                        sortedResults.length === 0 &&
                        !isLoading && (
                           <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white p-3 text-center text-sm text-gray-500 shadow-lg">
                              Nenhum tripulante encontrado
                           </div>
                        )}
                  </div>
               )}
            </>
         )}
      </div>
   );
}
