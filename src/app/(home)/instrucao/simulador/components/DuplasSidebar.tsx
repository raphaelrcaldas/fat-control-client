"use client";

import { TextInput } from "flowbite-react";
import clsx from "clsx";
import type {
   EtapaItem,
   TripEtapaItem,
} from "services/routes/estatistica/etapas";
import { minutesToTime, isoDateToString } from "@/../utils/dateHandler";

export interface Dupla {
   key: string;
   pilots: TripEtapaItem[];
   etapas: EtapaItem[];
}

interface DuplasSidebarProps {
   duplas: Dupla[];
   selectedKey: string | null;
   search: string;
   onSearchChange: (v: string) => void;
   onSelect: (key: string) => void;
}

export default function DuplasSidebar({
   duplas,
   selectedKey,
   search,
   onSearchChange,
   onSelect,
}: DuplasSidebarProps) {
   const filtered = duplas.filter((d) =>
      d.pilots.some((p) =>
         p.nome_guerra.toLowerCase().includes(search.toLowerCase())
      )
   );

   return (
      <div className="flex w-70 shrink-0 flex-col border-r border-gray-200 bg-white">
         <div className="border-b border-gray-200 px-4 py-3">
            <p className="mb-2 font-mono text-xs font-semibold tracking-widest text-gray-400 uppercase">
               Duplas
            </p>
            <TextInput
               sizing="sm"
               placeholder="Buscar piloto..."
               value={search}
               onChange={(e) => onSearchChange(e.target.value)}
            />
         </div>

         <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && (
               <p className="px-4 py-8 text-center text-sm text-gray-400">
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

               return (
                  <button
                     key={dupla.key}
                     type="button"
                     onClick={() => onSelect(dupla.key)}
                     className={clsx(
                        "flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50",
                        isSelected && "border-l-4 border-l-blue-500 bg-blue-50"
                     )}
                  >
                     <div className="min-w-0 flex-1">
                        {dupla.pilots.map((p) => (
                           <p
                              key={p.trip_id}
                              className="truncate text-xs font-medium text-gray-800 uppercase"
                           >
                              {p.p_g} {p.nome_guerra}
                           </p>
                        ))}
                     </div>

                     <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="font-mono text-xs text-blue-600">
                           {minutesToTime(totalMin)}h
                        </span>
                        {firstDate && (
                           <span className="font-mono text-xs text-gray-400">
                              {isoDateToString(firstDate)}
                           </span>
                        )}
                     </div>
                  </button>
               );
            })}
         </div>
      </div>
   );
}
