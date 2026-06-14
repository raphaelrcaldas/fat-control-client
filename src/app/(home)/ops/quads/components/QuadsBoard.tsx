"use client";
import clsx from "clsx";
import { CrewQuadRes } from "services/routes/quads";
import { DragScrollProps } from "../hooks/useDragScroll";
import { CrewRow } from "./CrewRow";
import { QuadsBoardSkeleton } from "./QuadsBoardSkeleton";

interface QuadsBoardProps {
   quads: CrewQuadRes[];
   groupName: string;
   typeName: string;
   isLoading: boolean;
   isFetching: boolean;
   dragProps: DragScrollProps;
}

export function QuadsBoard({
   quads,
   groupName,
   typeName,
   isLoading,
   isFetching,
   dragProps,
}: QuadsBoardProps) {
   return (
      <div
         id="quad_table"
         className={clsx(
            "relative flex max-h-[80%] cursor-grab flex-col gap-1 overflow-x-auto overflow-y-auto rounded border border-slate-200 bg-white py-3 whitespace-nowrap shadow transition-opacity duration-200 select-none",
            isFetching && !isLoading && "opacity-50"
         )}
         {...dragProps}
      >
         {isLoading ? (
            <QuadsBoardSkeleton />
         ) : quads.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-2 font-semibold">
               Nenhum quad encontrado
            </div>
         ) : (
            quads.map((item) => (
               <CrewRow
                  key={item.trip.id}
                  tripQuadRes={item}
                  groupName={groupName}
                  typeName={typeName}
               />
            ))
         )}
      </div>
   );
}
