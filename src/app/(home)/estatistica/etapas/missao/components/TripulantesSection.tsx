import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { DndContext, DragOverlay, pointerWithin } from "@dnd-kit/core";
import type {
   Announcements,
   DragStartEvent,
   DragEndEvent,
   SensorDescriptor,
} from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import clsx from "clsx";
import { useFuncoes } from "@/hooks/queries";
import type { FuncType } from "@/constants/tripulantes/funcoes";
import type { DraftPoolTrip } from "../context/types";
import type { EtapaTripsGroup } from "../hooks/useEtapaEditor";
import { FuncGroupDropZone } from "./funcGroup/FuncGroupDropZone";

function DraggablePoolChip({ trip }: { trip: DraftPoolTrip }) {
   const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
      id: `pool-${trip.tripId}`,
      data: { trip },
   });
   const { colors: funcColors } = useFuncoes();
   const colors = trip.lastFunc ? funcColors(trip.lastFunc) : null;

   return (
      <div
         ref={setNodeRef}
         className={clsx(
            // touch-none: sem isso o navegador reivindica o gesto para rolagem e
            // cancela o arrasto no dedo (pointercancel) antes de ele comecar
            "grid cursor-grab touch-none items-center rounded border px-2.5 py-1 text-center font-mono text-sm font-semibold uppercase",
            isDragging ? "opacity-30" : "",
            colors
               ? colors.badge
               : "border-gray-500/20 bg-gray-100 text-gray-600"
         )}
         {...listeners}
         {...attributes}
         title={`${trip.pGraduacao} ${trip.nomeGuerra}`.trim()}
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
   const { codigos, colors: funcColors, label } = useFuncoes();
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

      // Ordem do catálogo da unidade; depois, funções que ela não opera
      // mais (missão antiga) e, por último, sem função. Sem esse resto o
      // tripulante sumia do pool em vez de aparecer fora de ordem.
      const ordered: { funcKey: string; trips: DraftPoolTrip[] }[] = [];
      for (const func of codigos) {
         if (groups.has(func)) {
            ordered.push({ funcKey: func, trips: groups.get(func)! });
            groups.delete(func);
         }
      }
      const semFuncao = groups.get("__sem_funcao__");
      groups.delete("__sem_funcao__");
      for (const [funcKey, trips] of groups) {
         ordered.push({ funcKey, trips });
      }
      if (semFuncao) {
         ordered.push({ funcKey: "__sem_funcao__", trips: semFuncao });
      }
      return ordered;
   }, [poolTrips, codigos]);

   // Função que a unidade não opera mais, mas está na etapa (missão antiga):
   // ganha um card próprio. Sem ele o tripulante some da tela e continua
   // indo no payload, sem como ver ou remover.
   const funcsForaDoCatalogo = useMemo(() => {
      const operadas = new Set(codigos);
      return [
         ...new Set(
            assignedTrips.map((t) => t.func).filter((f) => !operadas.has(f))
         ),
      ];
   }, [assignedTrips, codigos]);

   // Anúncios do leitor de tela em português (o padrão do dnd-kit é inglês
   // e cita o id interno, "pool-12")
   const announcements = useMemo<Announcements>(() => {
      const nome = (data: unknown) => {
         const trip = (data as { trip?: DraftPoolTrip } | undefined)?.trip;
         return trip ? `${trip.pGraduacao} ${trip.nomeGuerra}`.trim() : "";
      };
      const destino = (data: unknown) => {
         const func = (data as { targetFunc?: FuncType } | undefined)
            ?.targetFunc;
         return func ? label(func) : "";
      };
      return {
         onDragStart: ({ active }) => `${nome(active.data.current)} pego.`,
         onDragOver: ({ active, over }) =>
            over
               ? `${nome(active.data.current)} sobre ${destino(over.data.current)}.`
               : `${nome(active.data.current)} fora das funções.`,
         onDragEnd: ({ active, over }) =>
            over
               ? `${nome(active.data.current)} atribuído a ${destino(over.data.current)}.`
               : `${nome(active.data.current)} solto fora das funções.`,
         onDragCancel: ({ active }) =>
            `Arrasto de ${nome(active.data.current)} cancelado.`,
      };
   }, [label]);

   return (
      <section className="space-y-3">
         <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            accessibility={{
               announcements,
               screenReaderInstructions: {
                  draggable:
                     "Para arrastar, pressione espaço ou Enter. Use as setas para mover até a função e espaço ou Enter para soltar. Esc cancela.",
               },
            }}
         >
            {poolByFunc.length > 0 && (
               <div className="rounded border border-dashed border-slate-400 bg-slate-50 px-2 pt-2 pb-1 shadow-sm">
                  <p className="mb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                     Pool da Missão
                     {/* No dedo o arrasto exige toque longo — instruir o gesto
                         certo em vez de prometer o do mouse */}
                     <span className="pointer-coarse:hidden">
                        {" "}
                        — arraste para atribuir função
                     </span>
                     <span className="hidden pointer-coarse:inline">
                        {" "}
                        — toque e segure para arrastar
                     </span>
                  </p>
                  <div className="flex flex-col divide-y divide-slate-300">
                     {poolByFunc.map(({ funcKey, trips }) => {
                        return (
                           <div
                              key={funcKey}
                              className="flex items-center gap-1.5 py-1"
                           >
                              <span className="w-8 shrink-0 text-center text-sm font-semibold text-gray-500 uppercase">
                                 {funcKey === "__sem_funcao__" ? "—" : funcKey}
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

            {/* 1 coluna abaixo de 640px: em 2 colunas o card fica com 145px e
                trunca o nome do tripulante em 3-4 letras */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
               {codigos.map((func) => (
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
               {funcsForaDoCatalogo.map((func) => (
                  <FuncGroupDropZone
                     key={func}
                     func={func}
                     foraDoCatalogo
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
                                 ? funcColors(activeTrip.lastFunc).badge
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
