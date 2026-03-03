import { DndContext, DragOverlay } from "@dnd-kit/core";
import type {
   DragStartEvent,
   DragEndEvent,
   SensorDescriptor,
} from "@dnd-kit/core";
import { TODAS_FUNCOES } from "@/constants/tripulantes/funcoes";
import type { FuncType } from "@/constants/tripulantes/funcoes";
import type { AssignedTrip } from "../types";
import { FuncGroupDropZone } from "./FuncGroupDropZone";

interface TripulantesSectionProps {
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
   activeTrip: { tripId: number; trig: string; nomeGuerra: string } | null;
   handleDragStart: (event: DragStartEvent) => void;
   handleDragEnd: (event: DragEndEvent) => void;
}

export function TripulantesSection({
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
            <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
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
                  <div className="flex rotate-2 cursor-grabbing items-center justify-center rounded border border-gray-300 bg-white px-3 py-2 text-sm shadow-lg">
                     <span className="font-mono font-semibold uppercase">
                        {activeTrip.trig}
                     </span>
                     <span className="ml-2 text-gray-500">
                        {activeTrip.nomeGuerra}
                     </span>
                  </div>
               ) : null}
            </DragOverlay>
         </DndContext>
      </section>
   );
}
