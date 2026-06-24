import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { HiPlus, HiSearch } from "react-icons/hi";
import { Spinner, TextInput } from "flowbite-react";
import { useQuery } from "@tanstack/react-query";
import type { FuncType } from "@/constants/tripulantes/funcoes";
import { tripKeys } from "@/hooks/queries/useTrips";
import { getTrips } from "services/routes/trips";
import useDebouncedValue from "@/hooks/useDebouncedValue";

import { usePortalDropdown } from "../../hooks/usePortalDropdown";
import { HighlightMatch } from "./HighlightMatch";

export interface SearchTrip {
   id?: number;
   trig: string;
   user: { nome_guerra: string; p_g: string };
}

// Busca de tripulante no padrão do TripulanteSelect (ops/om): botão
// "Adicionar" que vira campo de busca, com resultados em dropdown via
// portal — posição fixa fora do fluxo, sem expandir o card da função
export function InlineTripSearch({
   func,
   funcLabel,
   trigClass,
   assignedIds,
   onAdd,
}: {
   func: FuncType;
   funcLabel: string;
   trigClass: string;
   assignedIds: Set<number>;
   onAdd: (trip: SearchTrip) => void;
}) {
   const [query, setQuery] = useState("");
   const [isOpen, setIsOpen] = useState(false);
   const [showSearch, setShowSearch] = useState(false);
   const [activeIndex, setActiveIndex] = useState(-1);
   const containerRef = useRef<HTMLDivElement>(null);
   const inputRef = useRef<HTMLInputElement>(null);
   const inputWrapperRef = useRef<HTMLDivElement>(null);
   const dropdownRef = useRef<HTMLDivElement>(null);

   const debouncedQuery = useDebouncedValue(query, 300);
   const isQueryShort = debouncedQuery.trim().length < 2;

   const searchParams = {
      search: debouncedQuery.trim(),
      per_page: 5,
      active: true,
   };
   const searchQuery = useQuery({
      queryKey: tripKeys.list(searchParams),
      queryFn: ({ signal }) => getTrips(searchParams, signal),
      enabled: !isQueryShort,
   });
   const results = useMemo(
      () => searchQuery.data?.items ?? [],
      [searchQuery.data]
   );
   const isSearching = searchQuery.isFetching;

   // Índices selecionáveis (exclui quem já está atribuído na etapa)
   const selectableIndexes = useMemo(
      () =>
         results
            .map((trip, index) =>
               trip.id != null && !assignedIds.has(trip.id) ? index : -1
            )
            .filter((index) => index !== -1),
      [results, assignedIds]
   );

   // Reseta o destaque do teclado quando os resultados mudam
   useEffect(() => {
      setActiveIndex(selectableIndexes.length > 0 ? selectableIndexes[0] : -1);
   }, [selectableIndexes]);

   // Calcula a posição do dropdown baseado no input; o card da função é
   // estreito, então garante uma largura mínima legível sem sair da viewport
   const dropdownPosition = usePortalDropdown({
      open: isOpen,
      anchorRef: inputWrapperRef,
      compute: (rect) => {
         const width = Math.max(rect.width, 240);
         const left = Math.min(rect.left, window.innerWidth - width - 8);
         return { top: rect.bottom + 4, left, width };
      },
   });

   const closeSearch = useCallback(() => {
      setIsOpen(false);
      setShowSearch(false);
      setQuery("");
   }, []);

   // Fecha em click fora (considera container e dropdown do portal)
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

   // Foca o input ao abrir a busca
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
      (trip: SearchTrip) => {
         onAdd(trip);
         closeSearch();
      },
      [onAdd, closeSearch]
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

   const listboxId = `trip-search-${func}-listbox`;

   if (!showSearch) {
      return (
         <button
            type="button"
            onClick={() => setShowSearch(true)}
            className="flex w-full items-center justify-center gap-1 border border-dashed border-gray-300 bg-white/50 py-1 text-xs font-medium text-gray-400 transition-colors hover:border-gray-400 hover:bg-white hover:text-gray-600"
         >
            <HiPlus className="h-3.5 w-3.5" />
            Adicionar
         </button>
      );
   }

   return (
      <div ref={containerRef}>
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
               icon={HiSearch}
               sizing="sm"
               role="combobox"
               aria-expanded={isOpen}
               aria-controls={listboxId}
               aria-autocomplete="list"
            />

            {isSearching && (
               <div className="absolute top-1/2 right-3 -translate-y-1/2">
                  <Spinner size="sm" color="failure" />
               </div>
            )}
         </div>

         {/* Dropdown via portal — não participa do fluxo do card */}
         {isOpen &&
            dropdownPosition &&
            createPortal(
               <div
                  ref={dropdownRef}
                  id={listboxId}
                  role="listbox"
                  className="fixed z-9999 max-h-52 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg"
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
                        <Spinner size="sm" color="failure" />
                        Buscando...
                     </div>
                  ) : results.length === 0 ? (
                     <p className="p-3 text-center text-xs text-gray-500">
                        Nenhum tripulante encontrado
                     </p>
                  ) : (
                     results.map((trip, index) => {
                        const isAdded =
                           trip.id == null || assignedIds.has(trip.id);
                        const isActive = index === activeIndex;

                        return (
                           <button
                              key={trip.id ?? index}
                              type="button"
                              role="option"
                              aria-selected={isActive}
                              data-option-index={index}
                              onClick={() => !isAdded && handleSelect(trip)}
                              onMouseEnter={() =>
                                 !isAdded && setActiveIndex(index)
                              }
                              disabled={isAdded}
                              title={
                                 isAdded
                                    ? "Já atribuído nesta etapa"
                                    : `Adicionar ${trip.trig} como ${funcLabel}`
                              }
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
                                    trigClass
                                 )}
                              >
                                 <HighlightMatch
                                    text={trip.trig}
                                    term={debouncedQuery}
                                 />
                              </span>
                              <span className="flex-1 truncate text-xs text-gray-600 uppercase">
                                 {trip.user.p_g}{" "}
                                 <HighlightMatch
                                    text={trip.user.nome_guerra ?? ""}
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
   );
}
