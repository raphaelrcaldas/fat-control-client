"use client";

import clsx from "clsx";
import { useState } from "react";
import { Button } from "flowbite-react";
import { useCartoes } from "@/hooks/queries";
import type { TripCartoesOut } from "services/routes/instrucao/cartoes";
import CartoesMasthead from "./components/CartoesMasthead";
import PilotCard from "./components/PilotCard";
import PilotCardSkeleton from "./components/PilotCardSkeleton";
import EditCartoesModal from "./components/EditCartoesModal";

const SKELETON_ROWS = 8;

export default function CartoesPage() {
   const [editItem, setEditItem] = useState<TripCartoesOut | null>(null);

   const {
      data = [],
      isLoading,
      isError,
      error,
      refetch,
      isFetching,
   } = useCartoes();

   return (
      <div className="flex flex-col space-y-2">
         <CartoesMasthead count={isLoading ? null : data.length} />

         {isLoading ? (
            <div className="flex flex-col gap-1.5">
               {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <PilotCardSkeleton key={i} />
               ))}
            </div>
         ) : isError ? (
            <div className="rounded border border-rose-200 bg-rose-50 px-4 py-12 text-center">
               <p className="text-sm font-semibold text-rose-800">
                  Não foi possível carregar os cartões
               </p>
               <p className="mt-1 text-xs text-rose-600">
                  {(error as Error)?.message ?? "Tente novamente."}
               </p>
               <div className="mt-4 flex justify-center">
                  <Button color="red" size="sm" onClick={() => refetch()}>
                     Tentar novamente
                  </Button>
               </div>
            </div>
         ) : data.length === 0 ? (
            <div className="rounded border border-dashed border-slate-300 bg-slate-50 px-4 py-16 text-center">
               <p className="text-sm font-semibold text-slate-600">
                  Nenhum piloto encontrado
               </p>
            </div>
         ) : (
            <div
               className={clsx(
                  "flex flex-col gap-1.5 transition-opacity",
                  isFetching && "opacity-50"
               )}
            >
               {data.map((p) => (
                  <PilotCard key={p.trip_id} pilot={p} onEdit={setEditItem} />
               ))}
            </div>
         )}

         {editItem && (
            <EditCartoesModal
               show={!!editItem}
               onClose={() => setEditItem(null)}
               item={editItem}
            />
         )}
      </div>
   );
}
