import { ReactNode } from "react";
import clsx from "clsx";
import { isoStrToDate, todayIso } from "utils/dateHandler";
import { buildDayColumns, buildMonthSegments } from "./utils/indispDays";
import { IndispBoardMonths } from "./IndispBoardMonths";
import { IndispBoardRuler } from "./IndispBoardRuler";
import {
   colWidth,
   LANE_VARS,
   rowHeight,
   TRIG_COL,
} from "./utils/indispBoardLayout";

interface IndispBoardSkeletonProps {
   /** Mesma janela do board real, para não haver salto quando os dados chegam. */
   dates: Date[];
   focusedIso: string | null;
   onFocusDay: (iso: string) => void;
   rows?: number;
   toolbar: ReactNode;
}

/**
 * Espelha o IndispBoard: barra de mês, régua e N linhas de uma pista.
 * Larguras das faixas vêm de um padrão FIXO — nada de aleatório, que causaria
 * flicker e divergência de hidratação.
 */
const PADRAO_FAIXAS = [
   [{ from: 2, to: 7 }],
   [{ from: 0, to: 2 }],
   [{ from: 4, to: 11 }],
   [{ from: 1, to: 4 }],
   [{ from: 6, to: 9 }],
   [{ from: 9, to: 14 }],
   [{ from: 3, to: 5 }],
   [{ from: 11, to: 16 }],
];

export function IndispBoardSkeleton({
   dates,
   focusedIso,
   onFocusDay,
   rows = 12,
   toolbar,
}: IndispBoardSkeletonProps) {
   const cols = dates.length;
   const days = buildDayColumns(dates, isoStrToDate(todayIso()), focusedIso);
   return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
         {toolbar}
         <div className={clsx(LANE_VARS, "flex min-h-0 flex-1 flex-col")}>
            <IndispBoardMonths
               segments={buildMonthSegments(dates)}
               total={cols}
            />
            <IndispBoardRuler
               days={days}
               onFocusDay={onFocusDay}
               shouldIgnoreClick={() => false}
            />
            <div role="status" className="min-h-0 flex-1 overflow-hidden">
               <span className="sr-only">Carregando indisponibilidades…</span>
               <div
                  aria-hidden
                  className="animate-pulse motion-reduce:animate-none"
               >
                  {Array.from({ length: rows }).map((_, r) => (
                     <div
                        key={r}
                        className="flex border-b border-slate-200"
                        style={{ height: rowHeight(1) }}
                     >
                        <div
                           className={clsx(
                              TRIG_COL,
                              "flex items-center justify-center border-r-2 border-slate-300"
                           )}
                        >
                           <div className="h-2.5 w-8 rounded bg-slate-200" />
                        </div>
                        <div className="relative flex-1">
                           {PADRAO_FAIXAS[r % PADRAO_FAIXAS.length]
                              .filter((f) => f.from < cols)
                              .map((f) => (
                                 <div
                                    key={f.from}
                                    style={{
                                       left: colWidth(f.from, cols),
                                       width: colWidth(
                                          Math.min(f.to, cols) - f.from,
                                          cols
                                       ),
                                       top: "var(--row-pad)",
                                       height: "var(--bar-h)",
                                    }}
                                    className="absolute rounded bg-slate-100"
                                 />
                              ))}
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );
}
