import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { useDroppable } from "@dnd-kit/core";
import { HiPlus, HiX } from "react-icons/hi";
import { HiChevronDown } from "react-icons/hi2";
import { Spinner } from "flowbite-react";
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
import type { AssignedTrip } from "../types";

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
   const rootRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      if (!open) return;
      function handleOutside(e: MouseEvent) {
         if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
      }
      function handleEscape(e: KeyboardEvent) {
         if (e.key === "Escape") setOpen(false);
      }
      document.addEventListener("mousedown", handleOutside);
      document.addEventListener("keydown", handleEscape);
      return () => {
         document.removeEventListener("mousedown", handleOutside);
         document.removeEventListener("keydown", handleEscape);
      };
   }, [open]);

   return (
      <div ref={rootRef} className="relative shrink-0">
         <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex w-12 items-center justify-between rounded border border-gray-300 bg-gray-50 px-1 py-0.5 text-[10px] font-bold text-gray-700 focus:border-red-400 focus:ring-1 focus:ring-red-400 focus:outline-none"
         >
            <span>{value}</span>
            <HiChevronDown className="h-2.5 w-2.5 text-gray-400" />
         </button>
         {open && (
            <ul
               role="listbox"
               className="absolute right-0 z-20 mt-0.5 min-w-12 overflow-hidden rounded border border-gray-200 bg-white shadow-lg"
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
            </ul>
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
   trips: AssignedTrip[];
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

   // Inline search state
   const [searchQuery, setSearchQuery] = useState("");
   const debouncedSearch = useDebouncedValue(searchQuery, 400);

   const searchParams = debouncedSearch
      ? { search: debouncedSearch, per_page: 5, active: true }
      : undefined;
   const { data: tripsData, isFetching: searchingTrips } = useQuery({
      queryKey: tripKeys.list(searchParams),
      queryFn: ({ signal }) => getTrips(searchParams!, signal),
      enabled: !!debouncedSearch,
   });

   const zoneClass = isOver
      ? "border-blue-400 bg-blue-100 ring-2 ring-blue-300"
      : (colorMap[color] ?? "border-gray-200 bg-gray-50");

   return (
      <div
         ref={setNodeRef}
         className={clsx("flex min-h-20 flex-col rounded-lg border", zoneClass)}
      >
         <div
            className={clsx(
               "flex items-center justify-between rounded-t-lg px-2 py-1 text-xs font-semibold",
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
            {/* Inline search */}
            <div className="relative">
               <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-xs focus:ring-1 focus:ring-red-300 focus:outline-none"
               />
               {searchingTrips && (
                  <div className="absolute top-1 right-1.5">
                     <Spinner size="xs" color="failure" />
                  </div>
               )}
            </div>

            {/* Search results */}
            {debouncedSearch && tripsData && tripsData.items.length > 0 && (
               <div className="max-h-28 overflow-y-auto rounded border border-gray-200 bg-white shadow-sm">
                  {tripsData.items.map((trip) => {
                     const isAdded = assignedIds.has(trip.id!);
                     return (
                        <div
                           key={trip.id}
                           className="flex items-center gap-1 border-b border-gray-100 px-1.5 py-1 last:border-0"
                        >
                           <span className="font-mono text-xs font-semibold text-gray-700 uppercase">
                              {trip.trig}
                           </span>
                           <span className="flex-1 truncate text-xs text-gray-700 uppercase">
                              {trip.user.p_g} {trip.user.nome_guerra}
                           </span>
                           <button
                              type="button"
                              onClick={() => {
                                 if (isAdded) return;
                                 onAddTrip(trip, func);
                                 setSearchQuery("");
                              }}
                              disabled={isAdded}
                              className={clsx(
                                 "rounded p-0.5",
                                 isAdded
                                    ? "cursor-default text-gray-300"
                                    : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                              )}
                           >
                              {isAdded ? (
                                 <span className="text-xs text-green-500">
                                    ✓
                                 </span>
                              ) : (
                                 <HiPlus className="h-3 w-3" />
                              )}
                           </button>
                        </div>
                     );
                  })}
               </div>
            )}

            {/* Assigned trips */}
            {trips.map((t) => (
               <div
                  key={t.tripId}
                  className="flex items-center gap-1 rounded border border-white bg-white px-1.5 py-1 text-xs uppercase shadow-sm"
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
                     onClick={() => onRemove(t.tripId)}
                     className="ml-0.5 shrink-0 text-gray-300 hover:text-red-500"
                  >
                     <HiX className="h-3 w-3" />
                  </button>
               </div>
            ))}

            {trips.length === 0 && !debouncedSearch && (
               <p className="py-1 text-center text-xs text-gray-400">
                  Arraste ou busque aqui
               </p>
            )}
         </div>
      </div>
   );
}
