import { ReactNode } from "react";
import clsx from "clsx";
import {
   colWidth,
   LANE_VARS,
   rowHeight,
   TRIG_COL,
} from "./utils/indispBoardLayout";

interface IndispBoardSkeletonProps {
   /** Mesma janela do board real, para não haver salto quando os dados chegam. */
   cols: number;
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
   cols,
   rows = 12,
   toolbar,
}: IndispBoardSkeletonProps) {
   return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
         {toolbar}
         <div
            className={clsx(
               LANE_VARS,
               "flex min-h-0 flex-1 animate-pulse flex-col"
            )}
         >
            <div className="flex shrink-0 border-b border-slate-200">
               <div className={clsx(TRIG_COL, "border-r border-slate-200")} />
               <div className="flex-1 px-2 py-1">
                  <div className="h-2 w-24 rounded bg-slate-100" />
               </div>
            </div>

            <div className="flex shrink-0 border-b border-slate-200 bg-slate-50">
               <div className={clsx(TRIG_COL, "border-r border-slate-200")} />
               <div className="flex flex-1">
                  {Array.from({ length: cols }).map((_, i) => (
                     <div
                        key={i}
                        style={{ width: colWidth(1, cols) }}
                        className="space-y-1 py-1.5"
                     >
                        <div className="mx-auto h-1.5 w-5 rounded bg-slate-100" />
                        <div className="mx-auto h-2 w-4 rounded bg-slate-200" />
                     </div>
                  ))}
               </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
               {Array.from({ length: rows }).map((_, r) => (
                  <div
                     key={r}
                     className="flex border-b border-slate-100"
                     style={{ height: rowHeight(1) }}
                  >
                     <div
                        className={clsx(
                           TRIG_COL,
                           "flex items-center border-r border-slate-200 px-2.5"
                        )}
                     >
                        <div className="h-2.5 w-8 rounded bg-slate-200" />
                     </div>
                     <div className="relative flex-1">
                        {PADRAO_FAIXAS[r % PADRAO_FAIXAS.length].map((f) => (
                           <div
                              key={f.from}
                              style={{
                                 left: colWidth(f.from, cols),
                                 width: colWidth(f.to - f.from, cols),
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
   );
}
