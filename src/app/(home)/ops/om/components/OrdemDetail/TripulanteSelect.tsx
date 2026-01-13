"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { Badge, TextInput } from "flowbite-react";
import { IoSearchSharp, IoClose, IoAdd } from "react-icons/io5";
import { getTrips, type CrewMember } from "services/routes/trips";
import {
   FUNCOES_PRINCIPAIS as TODAS_FUNCOES,
   FUNC_LABELS_SHORT as FUNCAO_LABELS,
   type FuncaoTripulante,
} from "@/constants/tripulantes";

// Re-export CrewMember as TripulanteSearchResult for compatibility
type TripulanteSearchResult = CrewMember;

interface TripulanteSelectProps {
   funcao: FuncaoTripulante;
   projeto: string;
   tripulantes: TripulanteSearchResult[];
   onAdd: (tripulante: TripulanteSearchResult) => void;
   onRemove: (tripulanteId: number) => void;
   disabled?: boolean;
   excludeIds?: number[];
   required?: boolean;
   hasError?: boolean;
}

export function TripulanteSelect({
   funcao,
   projeto,
   tripulantes,
   onAdd,
   onRemove,
   disabled = false,
   excludeIds = [],
   required = false,
   hasError = false,
}: TripulanteSelectProps) {
   const [query, setQuery] = useState("");
   const [results, setResults] = useState<TripulanteSearchResult[]>([]);
   const [isOpen, setIsOpen] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [showSearch, setShowSearch] = useState(false);
   const [dropdownPosition, setDropdownPosition] = useState<{
      top: number;
      left: number;
      width: number;
   } | null>(null);
   const containerRef = useRef<HTMLDivElement>(null);
   const inputRef = useRef<HTMLInputElement>(null);
   const inputWrapperRef = useRef<HTMLDivElement>(null);
   const dropdownRef = useRef<HTMLDivElement>(null);
   const abortControllerRef = useRef<AbortController | null>(null);

   // Calcula a posicao do dropdown baseado no input
   const updateDropdownPosition = useCallback(() => {
      if (inputWrapperRef.current) {
         const rect = inputWrapperRef.current.getBoundingClientRect();
         setDropdownPosition({
            top: rect.bottom + window.scrollY + 4,
            left: rect.left + window.scrollX,
            width: rect.width,
         });
      }
   }, []);

   // Atualiza a posicao quando o dropdown abre ou quando ha scroll/resize
   useEffect(() => {
      if (isOpen) {
         updateDropdownPosition();
         window.addEventListener("scroll", updateDropdownPosition, true);
         window.addEventListener("resize", updateDropdownPosition);
         return () => {
            window.removeEventListener("scroll", updateDropdownPosition, true);
            window.removeEventListener("resize", updateDropdownPosition);
         };
      }
   }, [isOpen, updateDropdownPosition]);

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
            const data = await getTrips(
               { func: [funcao], search: query, proj: projeto },
               abortControllerRef.current.signal
            );
            setResults(data.items);
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

   // Close dropdown on click outside (considera container e dropdown do portal)
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         const target = event.target as Node;
         const isInsideContainer =
            containerRef.current && containerRef.current.contains(target);
         const isInsideDropdown =
            dropdownRef.current && dropdownRef.current.contains(target);

         if (!isInsideContainer && !isInsideDropdown) {
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
         const aIndex = excludeIds.indexOf(a.id!);
         const bIndex = excludeIds.indexOf(b.id!);
         const aIsAdded = aIndex !== -1;
         const bIsAdded = bIndex !== -1;

         if (aIsAdded && bIsAdded) return aIndex - bIndex;
         if (aIsAdded) return -1;
         if (bIsAdded) return 1;
         return 0;
      });
   }, [results, excludeIds]);

   // Se não está em modo de edição e não há tripulantes, não renderiza nada
   if (disabled && tripulantes.length === 0) {
      return null;
   }

   return (
      <div
         ref={containerRef}
         className={clsx(
            "rounded-lg border bg-white p-3 transition-colors",
            hasError ? "border-red-300" : "border-gray-300"
         )}
      >
         <label className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
            {FUNCAO_LABELS[funcao]}
            {required && <span className="text-red-500">*</span>}
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
                     <span className="hidden items-center font-mono text-xs leading-none font-bold text-green-700 uppercase lg:flex">
                        {trip.trig}
                     </span>
                     <span className="flex items-center text-xs leading-none text-gray-700 uppercase">
                        {trip.user.p_g} {trip.user.nome_guerra}
                     </span>
                     {!disabled && (
                        <button
                           type="button"
                           onClick={() => onRemove(trip.id!)}
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
                  <div ref={inputWrapperRef} className="relative">
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

                     {/* Dropdown renderizado via Portal para evitar corte por overflow do container pai */}
                     {isOpen &&
                        sortedResults.length > 0 &&
                        dropdownPosition &&
                        createPortal(
                           <div
                              ref={dropdownRef}
                              className="fixed z-9999 max-h-48 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg"
                              style={{
                                 top: dropdownPosition.top,
                                 left: dropdownPosition.left,
                                 width: dropdownPosition.width,
                              }}
                           >
                              {sortedResults.map((tripulante) => {
                                 const isAdded = excludeIds.includes(
                                    tripulante.id!
                                 );
                                 return (
                                    <button
                                       key={tripulante.id!}
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
                                       <span className="flex-1 truncate text-xs text-gray-600 uppercase">
                                          {tripulante.user.p_g}{" "}
                                          {tripulante.user.nome_guerra}
                                       </span>
                                       {isAdded && (
                                          <Badge color="gray" size="xs">
                                             Adicionado
                                          </Badge>
                                       )}
                                    </button>
                                 );
                              })}
                           </div>,
                           document.body
                        )}

                     {/* Mensagem de nenhum resultado via Portal */}
                     {isOpen &&
                        query.length >= 2 &&
                        sortedResults.length === 0 &&
                        !isLoading &&
                        dropdownPosition &&
                        createPortal(
                           <div
                              className="fixed z-9999 rounded-lg border border-gray-200 bg-white p-3 text-center text-sm text-gray-500 shadow-lg"
                              style={{
                                 top: dropdownPosition.top,
                                 left: dropdownPosition.left,
                                 width: dropdownPosition.width,
                              }}
                           >
                              Nenhum tripulante encontrado
                           </div>,
                           document.body
                        )}
                  </div>
               )}
            </>
         )}
      </div>
   );
}
