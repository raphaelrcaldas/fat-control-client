"use client";

import { useState } from "react";
import { Spinner } from "flowbite-react";
import { useCartoes } from "@/hooks/queries";
import { MdBadge } from "react-icons/md";
import type { TripCartoesOut } from "services/routes/instrucao/cartoes";
import PilotCard from "./components/PilotCard";
import EditCartoesDrawer from "./components/EditCartoesDrawer";

export default function CartoesPage() {
   const [editItem, setEditItem] = useState<TripCartoesOut | null>(null);

   const { data = [], isLoading } = useCartoes();

   return (
      <div className="flex flex-col gap-6 p-1">
         {/* Header */}
         <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
            <div className="flex items-center gap-4">
               <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 shadow-md">
                  <MdBadge className="h-6 w-6 text-white" />
               </div>
               <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                     Cartões
                  </h1>
                  <p className="text-sm text-gray-500">
                     Controle de PTAI, TAI, CVI e proficiência linguística dos
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
            ) : data.length === 0 ? (
               <div className="py-16 text-center text-sm text-gray-400">
                  Nenhum piloto encontrado.
               </div>
            ) : (
               data.map((p) => (
                  <PilotCard key={p.trip_id} pilot={p} onEdit={setEditItem} />
               ))
            )}
         </div>

         {editItem && (
            <EditCartoesDrawer
               show={!!editItem}
               onClose={() => setEditItem(null)}
               item={editItem}
            />
         )}
      </div>
   );
}
