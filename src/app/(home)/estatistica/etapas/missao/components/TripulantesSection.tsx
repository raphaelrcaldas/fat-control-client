import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
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
import type { DraftPoolTrip } from "../context/types";
import type { EtapaTripsGroup } from "../hooks/useEtapaEditor";
import { FuncGroupDropZone } from "./funcGroup/FuncGroupDropZone";

function DraggablePoolChip({ trip }: { trip: DraftPoolTrip }) {
   const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
      id: `pool-${trip.tripId}`,
      data: { trip },
   });
   const colors = trip.lastFunc ? getFuncColors(trip.lastFunc) : null;

   return (
      <div
         ref={setNodeRef}
         className={clsx(
            "cursor-grab items-center rounded border px-2.5 py-1 text-center font-mono text-sm font-semibold uppercase",
            isDragging ? "opacity-30" : "",
            colors
               ? colors.badge
               : "border-gray-500/20 bg-gray-100 text-gray-600"
         )}
         {...listeners}
         {...attributes}
      >
         {trip.trig}
      </div>
   );
}

interface TripulantesSectionProps {
   trips: EtapaTripsGroup;
   sensors: SensorDescriptor<object>[];
   activeTrip: DraftPoolTrip | null;
   handleDragStart: (event: DragStartEvent) => void;
   handleDragEnd: (event: DragEndEvent) => void;
}

export function TripulantesSection({
   trips,
   sensors,
   activeTrip,
   handleDragStart,
   handleDragEnd,
}: TripulantesSectionProps) {
   const {
      poolTrips,
      assignedTrips,
      assignedIds,
      updateFuncBordo,
      removeAllFromFunc,
      removeFromGroup,
      addTripToGroup,
   } = trips;
   // Portal o DragOverlay para document.body — o PageTransition wrapper
   // usa `transform` (CSS), o que faz `position: fixed` (usado pelo
   // overlay do dnd-kit) virar relativo a ele em vez da viewport, e
   // o chip aparece deslocado em relacao ao cursor.
   const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
   useEffect(() => {
      setPortalTarget(document.body);
   }, []);

   const poolByFunc = useMemo(() => {
      const sorted = [...poolTrips].sort((a, b) => {
         const antDiff = (a.ant ?? 999) - (b.ant ?? 999);
         if (antDiff !== 0) return antDiff;
         const promoA = a.ult_promo ?? "";
         const promoB = b.ult_promo ?? "";
         if (promoA !== promoB) return promoA.localeCompare(promoB);
         return (a.ant_rel ?? 0) - (b.ant_rel ?? 0);
      });

      const groups = new Map<string, DraftPoolTrip[]>();
      for (const trip of sorted) {
         const key = trip.lastFunc ?? "__sem_funcao__";
         if (!groups.has(key)) groups.set(key, []);
         groups.get(key)!.push(trip);
      }

      // Retorna na ordem de FUNC_ORDER, sem função no final
      const ordered: { funcKey: string; trips: DraftPoolTrip[] }[] = [];
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
      <section className="space-y-3">
         <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
         >
            {poolByFunc.length > 0 && (
               <div className="rounded border border-dashed border-slate-400 bg-slate-50 px-2 pt-2 pb-1 shadow-sm">
                  <p className="mb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                     Pool da Missão — arraste para atribuir função
                  </p>
                  <div className="flex flex-col divide-y divide-slate-300">
                     {poolByFunc.map(({ funcKey, trips }) => {
                        return (
                           <div
                              key={funcKey}
                              className="flex items-center gap-1.5 py-1"
                           >
                              <span className="w-8 shrink-0 text-center text-sm font-semibold text-gray-500 uppercase">
                                 {funcKey}
                              </span>
                              <div className="flex flex-wrap gap-1">
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

            {portalTarget &&
               createPortal(
                  <DragOverlay>
                     {activeTrip ? (
                        <div
                           className={clsx(
                              "w-fit cursor-grabbing items-center rounded px-3 py-1 text-center font-mono text-sm font-semibold uppercase shadow-lg",
                              activeTrip.lastFunc
                                 ? getFuncColors(activeTrip.lastFunc).badge
                                 : "bg-gray-100 text-gray-600"
                           )}
                        >
                           {activeTrip.trig}
                        </div>
                     ) : null}
                  </DragOverlay>,
                  portalTarget
               )}
         </DndContext>
      </section>
   );
}
