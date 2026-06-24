import clsx from "clsx";
import { useDroppable } from "@dnd-kit/core";
import { HiX } from "react-icons/hi";
import { MdDragIndicator } from "react-icons/md";
import {
   FUNCOES_CONFIG,
   getPosicoesByFunc,
} from "@/constants/tripulantes/funcoes";
import type { FuncType } from "@/constants/tripulantes/funcoes";

import type { DraftAssignedTrip } from "../../context/types";
import { FuncBordoSelect } from "./FuncBordoSelect";
import { colorMap, headerColorMap, trigColorMap } from "./funcGroupColors";
import { InlineTripSearch } from "./InlineTripSearch";

export function FuncGroupDropZone({
   func,
   trips,
   onFuncBordoChange,
   onRemoveAll,
   onRemove,
   onAddTrip,
   assignedIds,
}: {
   func: FuncType;
   trips: DraftAssignedTrip[];
   onFuncBordoChange: (tripId: number, funcBordo: string) => void;
   onRemoveAll: () => void;
   onRemove: (tripId: number) => void;
   onAddTrip: (
      trip: {
         id?: number;
         trig: string;
         user: { nome_guerra: string; p_g: string };
      },
      func: FuncType
   ) => void;
   assignedIds: Set<number>;
}) {
   const { isOver, setNodeRef } = useDroppable({
      id: `group-${func}`,
      data: { targetFunc: func },
   });

   const config = FUNCOES_CONFIG[func];
   const posicoes = getPosicoesByFunc(func);
   const color = config.theme.color;

   const zoneClass = isOver
      ? "border-blue-400 bg-blue-100 ring-2 ring-blue-300"
      : (colorMap[color] ?? "border-gray-200 bg-gray-50");

   return (
      <div
         ref={setNodeRef}
         className={clsx("flex min-h-20 flex-col border shadow-sm", zoneClass)}
      >
         <div
            className={clsx(
               "flex items-center justify-between px-2 py-1 text-xs font-semibold",
               headerColorMap[color] ?? "bg-gray-100 text-gray-600"
            )}
         >
            <span>
               {config.label}
               {trips.length > 0 && (
                  <span className="ml-1 font-normal opacity-70">
                     ({trips.length})
                  </span>
               )}
            </span>
            {trips.length > 0 && (
               <button
                  type="button"
                  onClick={onRemoveAll}
                  className="rounded p-0.5 opacity-60 hover:opacity-100"
                  title="Limpar todos"
               >
                  <HiX className="h-3 w-3" />
               </button>
            )}
         </div>

         <div className="flex flex-col gap-1 p-1.5">
            {/* Assigned trips */}
            {trips.map((t) => (
               <div
                  key={t.tripId}
                  className="flex items-center gap-1 border border-slate-200 bg-white px-1.5 py-1 text-xs uppercase shadow"
               >
                  <MdDragIndicator className="h-3.5 w-3.5 shrink-0 text-gray-300" />
                  <span className="min-w-0 flex-1 truncate font-medium text-gray-700">
                     {t.pGraduacao} {t.nomeGuerra}
                  </span>
                  {posicoes.length > 0 ? (
                     <FuncBordoSelect
                        value={t.funcBordo}
                        options={posicoes}
                        onChange={(codigo) =>
                           onFuncBordoChange(t.tripId, codigo)
                        }
                     />
                  ) : (
                     <span className="shrink-0 text-xs text-gray-400">--</span>
                  )}
                  <button
                     type="button"
                     onClick={() => onRemove(t.tripId)}
                     title={`Remover ${t.nomeGuerra}`}
                     aria-label={`Remover ${t.nomeGuerra} da função ${config.label}`}
                     className="ml-0.5 shrink-0 text-gray-300 hover:text-red-500"
                  >
                     <HiX className="h-3 w-3" />
                  </button>
               </div>
            ))}

            {trips.length === 0 && (
               <p className="py-1 text-center text-xs text-gray-400">
                  Arraste tripulantes para cá
               </p>
            )}

            <InlineTripSearch
               func={func}
               funcLabel={config.label}
               trigClass={trigColorMap[color] ?? "text-gray-600"}
               assignedIds={assignedIds}
               onAdd={(trip) => onAddTrip(trip, func)}
            />
         </div>
      </div>
   );
}
