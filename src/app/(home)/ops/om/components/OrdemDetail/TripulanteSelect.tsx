"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { Spinner, TextInput } from "flowbite-react";
import { IoSearchSharp, IoClose, IoAdd } from "react-icons/io5";
import { type CrewMember } from "services/routes/trips";
import { useTripSearch } from "@/hooks/queries";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { FUNCOES_CONFIG, type FuncaoTripulante } from "@/constants/tripulantes";

interface TripulanteSelectProps {
   funcao: FuncaoTripulante;
   tripulantes: CrewMember[];
   onAdd: (tripulante: CrewMember) => void;
   onRemove: (tripulanteId: number) => void;
   disabled?: boolean;
   excludeIds?: number[];
   required?: boolean;
   hasError?: boolean;
}

// Classes estáticas por cor de tema (Tailwind exige classes analisáveis,
// então o tema de FUNCOES_CONFIG é mapeado aqui em vez de interpolado)
interface AccentClasses {
   bar: string;
   headerText: string;
   chipBg: string;
   chipBorder: string;
   chipText: string;
   addHover: string;
}

const ACCENT_CLASSES: Record<string, AccentClasses> = {
   blue: {
      bar: "bg-blue-500",
      headerText: "text-blue-700",
      chipBg: "bg-blue-50",
      chipBorder: "border-blue-200",
      chipText: "text-blue-700",
      addHover: "hover:border-blue-400 hover:text-blue-600",
   },
   amber: {
      bar: "bg-amber-500",
      headerText: "text-amber-700",
      chipBg: "bg-amber-50",
      chipBorder: "border-amber-200",
      chipText: "text-amber-700",
      addHover: "hover:border-amber-400 hover:text-amber-600",
   },
   emerald: {
      bar: "bg-emerald-500",
      headerText: "text-emerald-700",
      chipBg: "bg-emerald-50",
      chipBorder: "border-emerald-200",
      chipText: "text-emerald-700",
      addHover: "hover:border-emerald-400 hover:text-emerald-600",
   },
   purple: {
      bar: "bg-purple-500",
      headerText: "text-purple-700",
      chipBg: "bg-purple-50",
      chipBorder: "border-purple-200",
      chipText: "text-purple-700",
      addHover: "hover:border-purple-400 hover:text-purple-600",
   },
   cyan: {
      bar: "bg-cyan-500",
      headerText: "text-cyan-700",
      chipBg: "bg-cyan-50",
      chipBorder: "border-cyan-200",
      chipText: "text-cyan-700",
      addHover: "hover:border-cyan-400 hover:text-cyan-600",
   },
   red: {
      bar: "bg-red-500",
      headerText: "text-red-700",
      chipBg: "bg-red-50",
      chipBorder: "border-red-200",
      chipText: "text-red-700",
      addHover: "hover:border-red-400 hover:text-red-600",
   },
};

const DEFAULT_ACCENT = ACCENT_CLASSES.blue;

// Destaca o trecho do texto que casa com o termo buscado
function HighlightMatch({ text, term }: { text: string; term: string }) {
   const trimmed = term.trim();
   if (!trimmed) return <>{text}</>;

   const idx = text.toLowerCase().indexOf(trimmed.toLowerCase());
   if (idx === -1) return <>{text}</>;

   return (
      <>
         {text.slice(0, idx)}
         <span className="font-bold text-gray-900">
            {text.slice(idx, idx + trimmed.length)}
         </span>
         {text.slice(idx + trimmed.length)}
      </>
   );
}

export function TripulanteSelect({
   funcao,
   tripulantes,
   onAdd,
   onRemove,
   disabled = false,
   excludeIds = [],
   required = false,
   hasError = false,
}: TripulanteSelectProps) {
   const [query, setQuery] = useState("");
   const [isOpen, setIsOpen] = useState(false);
   const [showSearch, setShowSearch] = useState(false);
   const [activeIndex, setActiveIndex] = useState(-1);
   const [dropdownPosition, setDropdownPosition] = useState<{
      top: number;
      left: number;
      width: number;
   } | null>(null);
   const containerRef = useRef<HTMLDivElement>(null);
   const inputRef = useRef<HTMLInputElement>(null);
   const inputWrapperRef = useRef<HTMLDivElement>(null);
   const dropdownRef = useRef<HTMLDivElement>(null);

   const funcConfig = FUNCOES_CONFIG[funcao];
   const accent = ACCENT_CLASSES[funcConfig.theme.color] ?? DEFAULT_ACCENT;

   const debouncedQuery = useDebouncedValue(query, 300);
   const searchQuery = useTripSearch(funcao, debouncedQuery);
   const results = useMemo(
      () => searchQuery.data?.items ?? [],
      [searchQuery.data]
   );
   const isSearching = searchQuery.isFetching;
   const isQueryShort = debouncedQuery.trim().length < 2;

   // Índices selecionáveis (exclui quem já está em alguma função da ordem)
   const selectableIndexes = useMemo(
      () =>
         results
            .map((trip, index) =>
               trip.id != null && !excludeIds.includes(trip.id) ? index : -1
            )
            .filter((index) => index !== -1),
      [results, excludeIds]
   );

   // Reseta o destaque do teclado quando os resultados mudam
   useEffect(() => {
      setActiveIndex(selectableIndexes.length > 0 ? selectableIndexes[0] : -1);
   }, [selectableIndexes]);

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

   const closeSearch = useCallback(() => {
      setIsOpen(false);
      setShowSearch(false);
      setQuery("");
   }, []);

   // Close dropdown on click outside (considera container e dropdown do portal)
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         const target = event.target as Node;
         const isInsideContainer =
            containerRef.current && containerRef.current.contains(target);
         const isInsideDropdown =
            dropdownRef.current && dropdownRef.current.contains(target);

         if (!isInsideContainer && !isInsideDropdown) {
            closeSearch();
         }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
         document.removeEventListener("mousedown", handleClickOutside);
   }, [closeSearch]);

   // Focus input when search is shown
   useEffect(() => {
      if (showSearch && inputRef.current) {
         inputRef.current.focus();
      }
   }, [showSearch]);

   // Mantém a opção ativa visível durante a navegação por teclado
   useEffect(() => {
      if (activeIndex < 0 || !dropdownRef.current) return;
      const option = dropdownRef.current.querySelector(
         `[data-option-index="${activeIndex}"]`
      );
      option?.scrollIntoView({ block: "nearest" });
   }, [activeIndex]);

   const handleSelect = useCallback(
      (tripulante: CrewMember) => {
         onAdd(tripulante);
         setQuery("");
         setIsOpen(false);
         setShowSearch(false);
      },
      [onAdd]
   );

   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
         e.preventDefault();
         closeSearch();
         return;
      }

      if (!isOpen) {
         if (e.key === "ArrowDown") setIsOpen(true);
         return;
      }

      if (selectableIndexes.length === 0) return;

      const currentPos = selectableIndexes.indexOf(activeIndex);

      if (e.key === "ArrowDown") {
         e.preventDefault();
         const nextPos = (currentPos + 1) % selectableIndexes.length;
         setActiveIndex(selectableIndexes[nextPos]);
      } else if (e.key === "ArrowUp") {
         e.preventDefault();
         const prevPos =
            currentPos <= 0 ? selectableIndexes.length - 1 : currentPos - 1;
         setActiveIndex(selectableIndexes[prevPos]);
      } else if (e.key === "Enter") {
         e.preventDefault();
         const active = results[activeIndex];
         if (active) handleSelect(active);
      }
   };

   // Se não está em modo de edição e não há tripulantes, não renderiza nada
   if (disabled && tripulantes.length === 0) {
      return null;
   }

   const listboxId = `tripulantes-${funcao}-listbox`;

   return (
      <div
         ref={containerRef}
         className={clsx(
            "overflow-visible border bg-white shadow-sm transition-colors",
            hasError ? "border-red-300" : "border-gray-200"
         )}
      >
         {/* Faixa de função (manifesto) */}
         <div className="flex items-center justify-between gap-1 border-b border-gray-100 px-3 py-2">
            <span
               className={clsx(
                  "flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase",
                  accent.headerText
               )}
            >
               <span
                  className={clsx("h-3.5 w-1 rounded-full", accent.bar)}
                  aria-hidden="true"
               />
               {funcConfig.labelShort}
               {required && <span className="text-red-500">*</span>}
            </span>
            {tripulantes.length > 0 && (
               <span className="font-mono text-[11px] font-semibold text-gray-400">
                  {tripulantes.length}
               </span>
            )}
         </div>

         <div className="flex flex-col gap-1.5 p-2">
            {/* Tripulantes selecionados */}
            {tripulantes.map((trip) => (
               <div
                  key={trip.id}
                  className={clsx(
                     "flex items-center gap-2 rounded border px-2 py-1.5",
                     accent.chipBg,
                     accent.chipBorder
                  )}
               >
                  <span
                     className={clsx(
                        "hidden font-mono text-xs leading-none font-bold uppercase lg:inline",
                        accent.chipText
                     )}
                  >
                     {trip.trig}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-xs leading-none font-medium text-gray-700 uppercase">
                     {trip.user.p_g} {trip.user.nome_guerra}
                  </span>
                  {!disabled && (
                     <button
                        type="button"
                        onClick={() => onRemove(trip.id!)}
                        aria-label={`Remover ${trip.user.nome_guerra}`}
                        className="shrink-0 text-gray-400 transition-colors hover:text-red-500"
                     >
                        <IoClose className="h-4 w-4" />
                     </button>
                  )}
               </div>
            ))}

            {/* Botão adicionar ou campo de busca */}
            {!disabled &&
               (!showSearch ? (
                  <button
                     type="button"
                     onClick={() => setShowSearch(true)}
                     className={clsx(
                        "flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-gray-300 py-1.5 text-xs font-medium text-gray-400 transition-colors",
                        accent.addHover
                     )}
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
                        onKeyDown={handleKeyDown}
                        placeholder="Trigrama ou nome..."
                        icon={IoSearchSharp}
                        sizing="sm"
                        role="combobox"
                        aria-expanded={isOpen}
                        aria-controls={listboxId}
                        aria-autocomplete="list"
                     />

                     {isSearching && (
                        <div className="absolute top-1/2 right-3 -translate-y-1/2">
                           <Spinner size="sm" color="primary" />
                        </div>
                     )}

                     {/* Dropdown via Portal para evitar corte por overflow do container pai */}
                     {isOpen &&
                        dropdownPosition &&
                        createPortal(
                           <div
                              ref={dropdownRef}
                              id={listboxId}
                              role="listbox"
                              className="fixed z-9999 max-h-52 overflow-auto rounded border border-gray-200 bg-white shadow-lg"
                              style={{
                                 top: dropdownPosition.top,
                                 left: dropdownPosition.left,
                                 width: dropdownPosition.width,
                              }}
                           >
                              {isQueryShort ? (
                                 <p className="p-3 text-center text-xs text-gray-400">
                                    Digite pelo menos 2 letras para buscar
                                 </p>
                              ) : isSearching && results.length === 0 ? (
                                 <div className="flex items-center justify-center gap-2 p-3 text-xs text-gray-400">
                                    <Spinner size="sm" color="primary" />
                                    Buscando...
                                 </div>
                              ) : results.length === 0 ? (
                                 <p className="p-3 text-center text-xs text-gray-500">
                                    Nenhum tripulante encontrado
                                 </p>
                              ) : (
                                 results.map((tripulante, index) => {
                                    const isAdded =
                                       tripulante.id == null ||
                                       excludeIds.includes(tripulante.id);
                                    const isActive = index === activeIndex;

                                    return (
                                       <button
                                          key={tripulante.id ?? index}
                                          type="button"
                                          role="option"
                                          aria-selected={isActive}
                                          data-option-index={index}
                                          onClick={() =>
                                             !isAdded &&
                                             handleSelect(tripulante)
                                          }
                                          onMouseEnter={() =>
                                             !isAdded && setActiveIndex(index)
                                          }
                                          disabled={isAdded}
                                          className={clsx(
                                             "flex w-full items-center gap-2 border-b border-gray-100 px-3 py-2 text-left last:border-b-0",
                                             isAdded
                                                ? "cursor-not-allowed bg-gray-50 opacity-60"
                                                : isActive
                                                  ? "cursor-pointer bg-gray-100"
                                                  : "cursor-pointer"
                                          )}
                                       >
                                          <span
                                             className={clsx(
                                                "w-9 shrink-0 font-mono text-xs font-bold uppercase",
                                                accent.chipText
                                             )}
                                          >
                                             <HighlightMatch
                                                text={tripulante.trig}
                                                term={debouncedQuery}
                                             />
                                          </span>
                                          <span className="flex-1 truncate text-xs text-gray-600 uppercase">
                                             {tripulante.user.p_g}{" "}
                                             <HighlightMatch
                                                text={
                                                   tripulante.user
                                                      .nome_guerra ?? ""
                                                }
                                                term={debouncedQuery}
                                             />
                                          </span>
                                          {isAdded && (
                                             <span className="shrink-0 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                                                Adicionado
                                             </span>
                                          )}
                                       </button>
                                    );
                                 })
                              )}
                           </div>,
                           document.body
                        )}
                  </div>
               ))}
         </div>
      </div>
   );
}
