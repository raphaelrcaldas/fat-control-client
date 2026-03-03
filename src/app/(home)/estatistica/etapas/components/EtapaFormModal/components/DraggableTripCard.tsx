import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { MdDragIndicator } from "react-icons/md";
import type { PoolTrip } from "../types";

export function DraggableTripCard({
   trip,
   inGroup,
   isDragging: isBeingDragged,
}: {
   trip: PoolTrip;
   inGroup?: boolean;
   isDragging?: boolean;
}) {
   const { attributes, listeners, setNodeRef, transform, isDragging } =
      useDraggable({
         id: `drag-${trip.tripId}-${inGroup ? "group" : "pool"}`,
         data: { trip },
      });

   const style = {
      transform: CSS.Translate.toString(transform),
      opacity: isDragging || isBeingDragged ? 0.4 : 1,
   };

   return (
      <div
         ref={setNodeRef}
         style={style}
         className="flex items-center justify-center gap-1.5 rounded border border-gray-200 bg-white px-2 py-1.5 text-sm shadow-sm"
      >
         <button
            {...listeners}
            {...attributes}
            className="cursor-grab touch-none text-gray-400 hover:text-gray-600 active:cursor-grabbing"
            tabIndex={-1}
         >
            <MdDragIndicator className="h-4 w-4" />
         </button>
         <span className="font-mono font-semibold text-gray-700 uppercase">
            {trip.trig}
         </span>
         <span className="text-gray-500 uppercase">{trip.nomeGuerra}</span>
         <span className="ml-auto text-xs text-gray-400">
            {trip.pGraduacao}
         </span>
      </div>
   );
}
