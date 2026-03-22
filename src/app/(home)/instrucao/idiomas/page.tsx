"use client";

import { useState, useMemo } from "react";
import { Spinner } from "flowbite-react";
import { useIdiomas } from "@/hooks/queries";
import { MdTranslate } from "react-icons/md";
import type { TripIdiomasOut } from "services/routes/instrucao/idiomas";
import PilotCard from "./components/PilotCard";
import EditIdiomasDrawer from "./components/EditIdiomasDrawer";

const LEVEL_RANK: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 4 };

function bestLevel(p: TripIdiomasOut): number {
   const esp = LEVEL_RANK[p.idiomas?.hab_espanhol ?? ""] ?? 0;
   const ing = LEVEL_RANK[p.idiomas?.hab_ingles ?? ""] ?? 0;
   return Math.max(esp, ing);
}

export default function IdiomasPage() {
   const [editItem, setEditItem] = useState<TripIdiomasOut | null>(null);

   const { data = [], isLoading } = useIdiomas();

   const sorted = useMemo(
      () => [...data].sort((a, b) => bestLevel(b) - bestLevel(a)),
      [data]
   );

   return (
      <div className="flex flex-col gap-6 p-1">
         {/* Header */}
         <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
            <div className="flex items-center gap-4">
               <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 shadow-md">
                  <MdTranslate className="h-6 w-6 text-white" />
               </div>
               <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                     Habilidades de Idioma
                  </h1>
                  <p className="text-sm text-gray-500">
                     Controle de PTAI, TAI e proficiência linguística dos
                     pilotos
                  </p>
               </div>
               {!isLoading && (
                  <div className="ml-auto flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5">
                     <span className="text-lg font-semibold text-red-800">
                        {data.length}
                     </span>
                     <span className="text-xs text-red-500">pilotos</span>
                  </div>
               )}
            </div>
         </div>

         {/* Grid de pilotos */}
         <div className="flex flex-col gap-1.5">
            {isLoading ? (
               <div className="flex justify-center py-16">
                  <Spinner color="failure" size="lg" />
               </div>
            ) : sorted.length === 0 ? (
               <div className="py-16 text-center text-sm text-gray-400">
                  Nenhum piloto encontrado.
               </div>
            ) : (
               sorted.map((p) => (
                  <PilotCard key={p.trip_id} pilot={p} onEdit={setEditItem} />
               ))
            )}
         </div>

         {editItem && (
            <EditIdiomasDrawer
               show={!!editItem}
               onClose={() => setEditItem(null)}
               item={editItem}
            />
         )}
      </div>
   );
}
