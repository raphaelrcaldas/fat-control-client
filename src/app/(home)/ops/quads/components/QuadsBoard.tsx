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
         className={clsx(
            "overflow-hidden rounded border border-slate-200 bg-white shadow transition-opacity duration-200",
            isFetching && !isLoading && "opacity-50"
         )}
      >
         {/* Subheader — identifica o grupo/tipo do quadro */}
         <div className="relative flex items-center border-b border-slate-200 bg-slate-50 py-2.5 pr-4 pl-5">
            {/* Espinha vermelha — ecoa a espinha dos cards e do masthead */}
            <span
               aria-hidden
               className="absolute top-0 left-0 h-full w-1 bg-red-600"
            />

            {!groupName ? (
               <div className="flex items-center gap-2">
                  <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
               </div>
            ) : (
               <div className="flex min-w-0 items-baseline gap-2">
                  <span className="truncate text-sm font-bold tracking-wide text-slate-900 uppercase">
                     {groupName}
                  </span>
                  {typeName && (
                     <span className="truncate text-xs font-semibold tracking-wide text-slate-500 uppercase">
                        {typeName}
                     </span>
                  )}
               </div>
            )}
         </div>

         {/* Área rolável / arrastável dos quadrinhos */}
         <div
            id="quad_table"
            className="relative flex max-h-[80%] cursor-grab flex-col gap-1 overflow-x-auto overflow-y-auto py-3 whitespace-nowrap select-none"
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
      </div>
   );
}
