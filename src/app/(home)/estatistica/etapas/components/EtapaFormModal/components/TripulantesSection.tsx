import { useMemo } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import type {
   DragStartEvent,
   DragEndEvent,
   SensorDescriptor,
} from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import clsx from "clsx";
import {
   TODAS_FUNCOES,
   FUNC_ORDER,
   FUNC_BORDO_ORDER,
   getFuncColors,
} from "@/constants/tripulantes/funcoes";
import type { FuncType } from "@/constants/tripulantes/funcoes";
import type { AssignedTrip, PoolTrip } from "../types";
import { FuncGroupDropZone } from "./FuncGroupDropZone";

function DraggablePoolChip({ trip }: { trip: PoolTrip }) {
   const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
      id: `pool-${trip.tripId}`,
      data: { trip },
   });
   const colors = trip.lastFunc ? getFuncColors(trip.lastFunc) : null;

   return (
      <div
         ref={setNodeRef}
         className={clsx(
            "flex cursor-grab items-center rounded px-3 py-1 text-sm font-semibold uppercase transition-opacity",
            isDragging ? "opacity-30" : "",
            colors ? colors.badge : "bg-gray-100 text-gray-600"
         )}
         {...listeners}
         {...attributes}
      >
         {trip.trig}
      </div>
   );
}

interface TripulantesSectionProps {
   poolTrips: PoolTrip[];
   assignedTrips: AssignedTrip[];
   assignedIds: Set<number>;
   updateFuncBordo: (tripId: number, funcBordo: string) => void;
   removeFromGroup: (tripId: number) => void;
   addTripToGroup: (
      trip: {
         id?: number;
         trig: string;
         user: { nome_guerra: string; p_g: string };
      },
      func: FuncType
   ) => void;
   sensors: SensorDescriptor<object>[];
   activeTrip: PoolTrip | null;
   handleDragStart: (event: DragStartEvent) => void;
   handleDragEnd: (event: DragEndEvent) => void;
}

export function TripulantesSection({
   poolTrips,
   assignedTrips,
   assignedIds,
   updateFuncBordo,
   removeFromGroup,
   addTripToGroup,
   sensors,
   activeTrip,
   handleDragStart,
   handleDragEnd,
}: TripulantesSectionProps) {
   const sortedPool = useMemo(() => {
      const funcIdx = Object.fromEntries(FUNC_ORDER.map((f, i) => [f, i]));
      return [...poolTrips].sort((a, b) => {
         const fa = funcIdx[a.lastFunc ?? ""] ?? 99;
         const fb = funcIdx[b.lastFunc ?? ""] ?? 99;
         if (fa !== fb) return fa - fb;
         const ba = FUNC_BORDO_ORDER[a.lastFuncBordo ?? ""] ?? 50;
         const bb = FUNC_BORDO_ORDER[b.lastFuncBordo ?? ""] ?? 50;
         return ba - bb;
      });
   }, [poolTrips]);

   return (
      <section>
         <h3 className="mb-3 border-b border-gray-200 pb-1.5 text-sm font-semibold tracking-wide text-gray-500 uppercase">
            Tripulantes
         </h3>

         <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
         >
            {sortedPool.length > 0 && (
               <div className="mb-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-2.5">
                  <p className="mb-1.5 text-xs font-medium text-gray-400 uppercase">
                     Pool da Missão — arraste para atribuir função
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                     {sortedPool.map((trip) => (
                        <DraggablePoolChip key={trip.tripId} trip={trip} />
                     ))}
                  </div>
               </div>
            )}

            <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
               {TODAS_FUNCOES.map((func) => (
                  <FuncGroupDropZone
                     key={func}
                     func={func}
                     trips={assignedTrips.filter((t) => t.func === func)}
                     onFuncBordoChange={updateFuncBordo}
                     onRemove={removeFromGroup}
                     onAddTrip={addTripToGroup}
                     assignedIds={assignedIds}
                  />
               ))}
            </div>

            <DragOverlay>
               {activeTrip ? (
                  <div
                     className={clsx(
                        "flex cursor-grabbing items-center justify-center rounded px-3 py-2 text-sm font-semibold uppercase shadow-lg",
                        activeTrip.lastFunc
                           ? getFuncColors(activeTrip.lastFunc).badge
                           : "border border-gray-300 bg-white text-gray-600"
                     )}
                  >
                     {activeTrip.trig}
                  </div>
               ) : null}
            </DragOverlay>
         </DndContext>
      </section>
   );
}
