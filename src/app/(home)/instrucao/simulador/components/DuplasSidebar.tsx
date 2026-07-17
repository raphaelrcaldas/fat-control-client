"use client";

import { Button, TextInput } from "flowbite-react";
import clsx from "clsx";
import { HiPlus } from "react-icons/hi";
import { minutesToTime, isoDateToString } from "@/../utils/dateHandler";
import type { Dupla } from "../types";

interface DuplasSidebarProps {
   duplas: Dupla[];
   selectedKey: string | null;
   search: string;
   onSearchChange: (v: string) => void;
   onSelect: (key: string) => void;
   onCreateDupla: () => void;
}

export default function DuplasSidebar({
   duplas,
   selectedKey,
   search,
   onSearchChange,
   onSelect,
   onCreateDupla,
}: DuplasSidebarProps) {
   const filtered = duplas.filter((d) => {
      if (!search) return true;
      if (d.pilots.length === 0) return true;
      const term = search.toLowerCase();
      return d.pilots.some(
         (p) =>
            p.nome_guerra.toLowerCase().includes(term) ||
            p.trig.toLowerCase().includes(term)
      );
   });

   return (
      <div className="flex w-70 shrink-0 flex-col border-r border-slate-200 bg-white">
         <div className="border-b border-slate-200 px-4 py-3">
            <div className="mb-2 flex items-center justify-between">
               <p className="font-mono text-xs font-semibold tracking-widest text-gray-500 uppercase">
                  Duplas
               </p>
               <Button
                  color="light"
                  size="xs"
                  onClick={onCreateDupla}
                  aria-label="Nova dupla"
               >
                  <HiPlus className="h-3.5 w-3.5" />
               </Button>
            </div>
            <TextInput
               sizing="sm"
               placeholder="Buscar piloto..."
               value={search}
               onChange={(e) => onSearchChange(e.target.value)}
            />
         </div>

         <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && (
               <p className="px-4 py-8 text-center text-sm text-gray-500">
                  Nenhuma dupla encontrada.
               </p>
            )}
            {filtered.map((dupla) => {
               const totalMin = dupla.etapas.reduce(
                  (sum, e) => sum + e.tvoo,
                  0
               );
               const firstDate = dupla.etapas.map((e) => e.data).sort()[0];
               const isSelected = selectedKey === dupla.key;
               const isEmpty = dupla.etapas.length === 0;

               return (
                  <button
                     key={dupla.key}
                     type="button"
                     onClick={() => onSelect(dupla.key)}
                     className={clsx(
                        "hover:bg-primary-50 border-primary-100 flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors",
                        isSelected &&
                           "border-l-primary-600 bg-primary-50 border-l-4"
                     )}
                  >
                     <div className="min-w-0 flex-1">
                        {dupla.pilots.length > 0 ? (
                           dupla.pilots.map((p) => (
                              <p
                                 key={p.trip_id}
                                 className="truncate text-xs font-medium text-gray-800 uppercase"
                              >
                                 {p.p_g} {p.nome_guerra}
                              </p>
                           ))
                        ) : (
                           <p className="truncate text-xs font-medium text-gray-400 italic">
                              Sem pilotos
                           </p>
                        )}
                     </div>

                     <div className="flex shrink-0 flex-col items-end gap-1">
                        {isEmpty ? (
                           <span className="text-[10px] font-medium text-amber-600">
                              SEM SESSÕES
                           </span>
                        ) : (
                           <>
                              <span className="text-primary-600 font-mono text-xs">
                                 {minutesToTime(totalMin)}h
                              </span>
                              {firstDate && (
                                 <span className="font-mono text-xs text-gray-600">
                                    {isoDateToString(firstDate)}
                                 </span>
                              )}
                           </>
                        )}
                     </div>
                  </button>
               );
            })}
         </div>
      </div>
   );
}
