import { useMemo } from "react";
import { DndContext, DragOverlay, pointerWithin } from "@dnd-kit/core";
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
   getFuncColors,
   getFuncLabel,
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
            "w-fit cursor-grab items-center rounded px-3 py-1 text-center font-mono text-sm font-semibold uppercase transition-opacity",
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
   removeAllFromFunc: (func: FuncType) => void;
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
   removeAllFromFunc,
   removeFromGroup,
   addTripToGroup,
   sensors,
   activeTrip,
   handleDragStart,
   handleDragEnd,
}: TripulantesSectionProps) {
   const poolByFunc = useMemo(() => {
      const sorted = [...poolTrips].sort((a, b) => {
         const antDiff = (a.ant ?? 999) - (b.ant ?? 999);
         if (antDiff !== 0) return antDiff;
         const promoA = a.ult_promo ?? "";
         const promoB = b.ult_promo ?? "";
         if (promoA !== promoB) return promoA.localeCompare(promoB);
         return (a.ant_rel ?? 0) - (b.ant_rel ?? 0);
      });

      const groups = new Map<string, PoolTrip[]>();
      for (const trip of sorted) {
         const key = trip.lastFunc ?? "__sem_funcao__";
         if (!groups.has(key)) groups.set(key, []);
         groups.get(key)!.push(trip);
      }

      // Retorna na ordem de FUNC_ORDER, sem função no final
      const ordered: { funcKey: string; trips: PoolTrip[] }[] = [];
      for (const func of FUNC_ORDER) {
         if (groups.has(func)) {
            ordered.push({ funcKey: func, trips: groups.get(func)! });
         }
      }
      if (groups.has("__sem_funcao__")) {
         ordered.push({
            funcKey: "__sem_funcao__",
            trips: groups.get("__sem_funcao__")!,
         });
      }
      return ordered;
   }, [poolTrips]);

   return (
      <section>
         <h3 className="mb-3 border-b border-gray-200 pb-1.5 text-sm font-semibold tracking-wide text-gray-500 uppercase">
            Tripulantes
         </h3>

         <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
         >
            {poolByFunc.length > 0 && (
               <div className="mb-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-2.5">
                  <p className="mb-1.5 text-xs font-medium text-gray-400 uppercase">
                     Pool da Missão — arraste para atribuir função
                  </p>
                  <div className="flex flex-col gap-1.5">
                     {poolByFunc.map(({ funcKey, trips }) => {
                        return (
                           <div
                              key={funcKey}
                              className="flex items-center gap-1.5"
                           >
                              <span className="w-10 shrink-0 text-center text-sm font-medium text-gray-400 uppercase">
                                 {funcKey}
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                 {trips.map((trip) => (
                                    <DraggablePoolChip
                                       key={trip.tripId}
                                       trip={trip}
                                    />
                                 ))}
                              </div>
                           </div>
                        );
                     })}
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
                     onRemoveAll={() => removeAllFromFunc(func)}
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
