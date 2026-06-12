import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { useDroppable } from "@dnd-kit/core";
import { HiPlus, HiSearch, HiX } from "react-icons/hi";
import { HiChevronDown } from "react-icons/hi2";
import { Spinner, TextInput } from "flowbite-react";
import { useQuery } from "@tanstack/react-query";
import { MdDragIndicator } from "react-icons/md";
import {
   FUNCOES_CONFIG,
   getPosicoesByFunc,
} from "@/constants/tripulantes/funcoes";
import type { FuncType, PosicaoABordo } from "@/constants/tripulantes/funcoes";
import { tripKeys } from "@/hooks/queries/useTrips";
import { getTrips } from "services/routes/trips";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import type { DraftAssignedTrip } from "../_state/types";

function FuncBordoSelect({
   value,
   options,
   onChange,
}: {
   value: string;
   options: PosicaoABordo[];
   onChange: (codigo: string) => void;
}) {
   const [open, setOpen] = useState(false);
   const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
   const buttonRef = useRef<HTMLButtonElement>(null);
   const dropdownRef = useRef<HTMLUListElement>(null);

   useEffect(() => {
      if (!open) return;
      const btn = buttonRef.current;
      if (!btn) return;

      function reposition() {
         if (!btn) return;
         const rect = btn.getBoundingClientRect();
         setPos({
            top: rect.bottom + 2,
            right: window.innerWidth - rect.right,
         });
      }
      reposition();

      function handleOutside(e: MouseEvent) {
         const target = e.target as Node;
         if (btn?.contains(target)) return;
         if (dropdownRef.current?.contains(target)) return;
         setOpen(false);
      }
      function handleEscape(e: KeyboardEvent) {
         if (e.key === "Escape") setOpen(false);
      }
      function handleClose() {
         setOpen(false);
      }
      document.addEventListener("mousedown", handleOutside);
      document.addEventListener("keydown", handleEscape);
      window.addEventListener("scroll", handleClose, true);
      window.addEventListener("resize", handleClose);
      return () => {
         document.removeEventListener("mousedown", handleOutside);
         document.removeEventListener("keydown", handleEscape);
         window.removeEventListener("scroll", handleClose, true);
         window.removeEventListener("resize", handleClose);
      };
   }, [open]);

   return (
      <div className="relative shrink-0">
         <button
            ref={buttonRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex w-12 items-center justify-between border border-gray-300 bg-gray-50 px-1 py-0.5 text-[10px] font-bold text-gray-700 focus:border-red-400 focus:ring-1 focus:ring-red-400 focus:outline-none"
         >
            <span>{value}</span>
            <HiChevronDown className="h-2.5 w-2.5 text-gray-400" />
         </button>
         {open &&
            pos &&
            createPortal(
               <ul
                  ref={dropdownRef}
                  role="listbox"
                  style={{
                     position: "fixed",
                     top: pos.top,
                     right: pos.right,
                  }}
                  className="z-50 min-w-12 overflow-hidden rounded border border-gray-200 bg-white shadow-lg"
               >
                  {options.map((p) => {
                     const selected = p.codigo === value;
                     return (
                        <li key={p.codigo}>
                           <button
                              type="button"
                              role="option"
                              aria-selected={selected}
                              onClick={() => {
                                 onChange(p.codigo);
                                 setOpen(false);
                              }}
                              title={p.label}
                              className={clsx(
                                 "block w-full px-2 py-1 text-left text-[10px] font-bold uppercase",
                                 selected
                                    ? "bg-red-50 text-red-700"
                                    : "text-gray-700 hover:bg-gray-100"
                              )}
                           >
                              {p.codigo}
                           </button>
                        </li>
                     );
                  })}
               </ul>,
               document.body
            )}
      </div>
   );
}

const colorMap: Record<string, string> = {
   blue: "border-blue-200 bg-blue-50",
   amber: "border-amber-200 bg-amber-50",
   emerald: "border-emerald-200 bg-emerald-50",
   cyan: "border-cyan-200 bg-cyan-50",
   red: "border-red-200 bg-red-50",
   purple: "border-purple-200 bg-purple-50",
   pink: "border-pink-200 bg-pink-50",
   gray: "border-gray-200 bg-gray-50",
};

const headerColorMap: Record<string, string> = {
   blue: "bg-blue-100 text-blue-700",
   amber: "bg-amber-100 text-amber-700",
   emerald: "bg-emerald-100 text-emerald-700",
   cyan: "bg-cyan-100 text-cyan-700",
   red: "bg-red-100 text-red-700",
   purple: "bg-purple-100 text-purple-700",
   pink: "bg-pink-100 text-pink-700",
   gray: "bg-gray-100 text-gray-600",
};

const trigColorMap: Record<string, string> = {
   blue: "text-blue-700",
   amber: "text-amber-700",
   emerald: "text-emerald-700",
   cyan: "text-cyan-700",
   red: "text-red-700",
   purple: "text-purple-700",
   pink: "text-pink-700",
   gray: "text-gray-600",
};

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

interface SearchTrip {
   id?: number;
   trig: string;
   user: { nome_guerra: string; p_g: string };
}

// Busca de tripulante no padrão do TripulanteSelect (ops/om): botão
// "Adicionar" que vira campo de busca, com resultados em dropdown via
// portal — posição fixa fora do fluxo, sem expandir o card da função
function InlineTripSearch({
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
   const [dropdownPosition, setDropdownPosition] = useState<{
      top: number;
      left: number;
      width: number;
   } | null>(null);
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
   const updateDropdownPosition = useCallback(() => {
      if (inputWrapperRef.current) {
         const rect = inputWrapperRef.current.getBoundingClientRect();
         const width = Math.max(rect.width, 240);
         const left = Math.min(rect.left, window.innerWidth - width - 8);
         setDropdownPosition({ top: rect.bottom + 4, left, width });
      }
   }, []);

   // Atualiza a posição quando o dropdown abre ou quando há scroll/resize
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

export function FuncGroupDropZone({
   func,
   trips,
   onFuncBordoChange,
   onRemoveAll,
   onRemove,
   onAddTrip,
   assignedIds,
}: {
   func: FuncType;
   trips: DraftAssignedTrip[];
   onFuncBordoChange: (tripId: number, funcBordo: string) => void;
   onRemoveAll: () => void;
   onRemove: (tripId: number) => void;
   onAddTrip: (
      trip: {
         id?: number;
         trig: string;
         user: { nome_guerra: string; p_g: string };
      },
      func: FuncType
   ) => void;
   assignedIds: Set<number>;
}) {
   const { isOver, setNodeRef } = useDroppable({
      id: `group-${func}`,
      data: { targetFunc: func },
   });

   const config = FUNCOES_CONFIG[func];
   const posicoes = getPosicoesByFunc(func);
   const color = config.theme.color;

   const zoneClass = isOver
      ? "border-blue-400 bg-blue-100 ring-2 ring-blue-300"
      : (colorMap[color] ?? "border-gray-200 bg-gray-50");

   return (
      <div
         ref={setNodeRef}
         className={clsx("flex min-h-20 flex-col border shadow-sm", zoneClass)}
      >
         <div
            className={clsx(
               "flex items-center justify-between px-2 py-1 text-xs font-semibold",
               headerColorMap[color] ?? "bg-gray-100 text-gray-600"
            )}
         >
            <span>
               {config.label}
               {trips.length > 0 && (
                  <span className="ml-1 font-normal opacity-70">
                     ({trips.length})
                  </span>
               )}
            </span>
            {trips.length > 0 && (
               <button
                  type="button"
                  onClick={onRemoveAll}
                  className="rounded p-0.5 opacity-60 hover:opacity-100"
                  title="Limpar todos"
               >
                  <HiX className="h-3 w-3" />
               </button>
            )}
         </div>

         <div className="flex flex-col gap-1 p-1.5">
            {/* Assigned trips */}
            {trips.map((t) => (
               <div
                  key={t.tripId}
                  className="flex items-center gap-1 border border-slate-200 bg-white px-1.5 py-1 text-xs uppercase shadow"
               >
                  <MdDragIndicator className="h-3.5 w-3.5 shrink-0 text-gray-300" />
                  <span className="min-w-0 flex-1 truncate font-medium text-gray-700">
                     {t.pGraduacao} {t.nomeGuerra}
                  </span>
                  {posicoes.length > 0 ? (
                     <FuncBordoSelect
                        value={t.funcBordo}
                        options={posicoes}
                        onChange={(codigo) =>
                           onFuncBordoChange(t.tripId, codigo)
                        }
                     />
                  ) : (
                     <span className="shrink-0 text-xs text-gray-400">--</span>
                  )}
                  <button
                     type="button"
                     onClick={() => onRemove(t.tripId)}
                     title={`Remover ${t.nomeGuerra}`}
                     aria-label={`Remover ${t.nomeGuerra} da função ${config.label}`}
                     className="ml-0.5 shrink-0 text-gray-300 hover:text-red-500"
                  >
                     <HiX className="h-3 w-3" />
                  </button>
               </div>
            ))}

            {trips.length === 0 && (
               <p className="py-1 text-center text-xs text-gray-400">
                  Arraste tripulantes para cá
               </p>
            )}

            <InlineTripSearch
               func={func}
               funcLabel={config.label}
               trigClass={trigColorMap[color] ?? "text-gray-600"}
               assignedIds={assignedIds}
               onAdd={(trip) => onAddTrip(trip, func)}
            />
         </div>
      </div>
   );
}
