"use client";

import { memo, useCallback, useMemo } from "react";
import clsx from "clsx";
import { CrewIndispList } from "services/routes/indisps";
import { dateToIso } from "utils/dateHandler";
import { IndispBar as IndispBarModel, buildRowBars } from "./utils/indispBars";
import { rowHeight, TEXTO_DADO, TRIG_COL } from "./utils/indispBoardLayout";
import { IndispBar } from "./IndispBar";
import { IndispSlot } from "./IndispSlot";

interface IndispBoardRowProps {
   tripData: CrewIndispList;
   /** Identidade estável que dimensiona as faixas. */
   dates: Date[];
   /** Faixa aberta no momento — realçada enquanto o modal estiver de pé. */
   selectedBarKey: string | null;
   /** A linha entrega a faixa; quem decide o destino é o board. */
   onOpenBar: (tripData: CrewIndispList, bar: IndispBarModel) => void;
   onOpenTrip: (tripData: CrewIndispList) => void;
   onAdd: (tripData: CrewIndispList, dateIso: string) => void;
   /** Sem permissão de criar, a vaga "+" nem existe. */
   canCreate: boolean;
   /** Um arrasto que termina sobre a faixa não deve abri-la. */
   shouldIgnoreClick: () => boolean;
}

/** Tudo que a linha precisa, menos o tripulante — o Grid repassa este bloco. */
export type IndispRowConfig = Omit<IndispBoardRowProps, "tripData">;

export const IndispBoardRow = memo(function IndispBoardRow({
   tripData,
   dates,
   selectedBarKey,
   onOpenBar,
   onOpenTrip,
   onAdd,
   canCreate,
   shouldIgnoreClick,
}: IndispBoardRowProps) {
   const { bars, lanes, freeCols } = useMemo(
      () => buildRowBars(tripData, dates),
      [tripData, dates]
   );

   const { trig, oper } = tripData.trip;
   const handleAdd = useCallback(
      (col: number) => {
         if (!shouldIgnoreClick()) onAdd(tripData, dateToIso(dates[col]));
      },
      [dates, onAdd, shouldIgnoreClick, tripData]
   );

   return (
      <div
         role="group"
         aria-label={`Tripulante ${trig}${oper === "in" ? ", instrutor" : ""}`}
         className="flex border-b border-slate-200 transition-colors hover:bg-slate-50/70"
         style={{ height: rowHeight(lanes) }}
      >
         <div className={clsx(TRIG_COL, "border-r-2 border-slate-300")}>
            <button
               type="button"
               onClick={() => {
                  if (!shouldIgnoreClick()) onOpenTrip(tripData);
               }}
               className="focus-visible:ring-primary-600 relative flex h-full w-full cursor-[inherit] items-center justify-center px-0.5 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
               aria-label={`Ver indisponibilidades de ${trig}${oper === "in" ? ", instrutor" : ""}`}
            >
               <span
                  className={clsx(
                     "font-mono font-bold tracking-wide uppercase",
                     TEXTO_DADO
                  )}
               >
                  {trig}
               </span>
            </button>
         </div>

         <div className="relative flex-1">
            {canCreate && (
               <IndispSlot
                  freeCols={freeCols}
                  total={dates.length}
                  onAdd={handleAdd}
               />
            )}

            {bars.map((bar) => (
               <IndispBar
                  key={bar.key}
                  bar={bar}
                  total={dates.length}
                  selected={bar.key === selectedBarKey}
                  onOpen={() => {
                     if (!shouldIgnoreClick()) onOpenBar(tripData, bar);
                  }}
               />
            ))}
         </div>
      </div>
   );
}, areIndispBoardRowPropsEqual);

function areIndispBoardRowPropsEqual(
   previous: IndispBoardRowProps,
   next: IndispBoardRowProps
) {
   if (
      previous.tripData !== next.tripData ||
      previous.dates !== next.dates ||
      previous.onOpenBar !== next.onOpenBar ||
      previous.onOpenTrip !== next.onOpenTrip ||
      previous.onAdd !== next.onAdd ||
      previous.canCreate !== next.canCreate ||
      previous.shouldIgnoreClick !== next.shouldIgnoreClick
   ) {
      return false;
   }

   if (previous.selectedBarKey === next.selectedBarKey) return true;

   const prefix = `${previous.tripData.trip.id}:`;
   return (
      !previous.selectedBarKey?.startsWith(prefix) &&
      !next.selectedBarKey?.startsWith(prefix)
   );
}
