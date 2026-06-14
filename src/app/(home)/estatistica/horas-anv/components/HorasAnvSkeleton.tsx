import clsx from "clsx";
import { Fragment } from "react";
import { MONTH_LABELS } from "../constants";

const STAT_CARDS = [0, 1, 2, 3];
const TABLE_ROWS = [0, 1, 2, 3, 4, 5];

/** Larguras fixas por subcoluna — espelham HorasAnvTable (HV_W / PSO_W). */
const HV_W = "w-18";
const PSO_W = "w-8";

/** Mini-legenda HV/PSO — chrome estático idêntico ao da tabela real. */
function PairLegend() {
   return (
      <div className="mt-0.5 flex font-mono text-[9px] font-semibold tracking-wide text-slate-400">
         <span className={clsx(HV_W, "text-center")}>HV</span>
         <span className={clsx(PSO_W, "text-center")}>PSO</span>
      </div>
   );
}

/** Célula numérica em estado de carregamento (bloco pulse centralizado). */
function SkelNumCell({
   col,
   className,
   tone = "bg-slate-100",
}: {
   col: "hv" | "pso";
   className?: string;
   tone?: string;
}) {
   return (
      <td
         className={clsx(
            "px-0.5 py-1.5",
            col === "hv" ? HV_W : PSO_W,
            className
         )}
      >
         <div
            className={clsx(
               "mx-auto h-3 animate-pulse rounded",
               tone,
               col === "hv" ? "w-9" : "w-5"
            )}
         />
      </td>
   );
}

export function HorasAnvSkeleton() {
   return (
      <div className="flex flex-col gap-5">
         {/* KPIs — espelha StatCard de HorasAnvStats */}
         <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {STAT_CARDS.map((i) => (
               <div
                  key={i}
                  className="rounded border border-slate-200 bg-white p-4 shadow-sm"
               >
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 shrink-0 animate-pulse rounded-md bg-slate-200" />
                     <div className="min-w-0 flex-1">
                        <div className="h-2.5 w-16 animate-pulse rounded bg-slate-100" />
                        <div className="mt-2 h-6 w-24 animate-pulse rounded bg-slate-200" />
                     </div>
                  </div>
                  <div className="mt-2 h-2.5 w-32 animate-pulse rounded bg-slate-100" />
               </div>
            ))}
         </div>

         {/* Tabela — espelha a matriz 12 meses × HV/PSO de HorasAnvTable */}
         <div>
            <div className="max-h-[70vh] overflow-auto rounded border border-slate-200 bg-white shadow-sm">
               <table className="w-full border-collapse text-center text-sm whitespace-nowrap">
                  <thead>
                     <tr>
                        <th className="sticky top-0 left-0 z-30 border-r border-slate-300 bg-slate-100 px-3 py-2 font-bold text-slate-700">
                           ANV
                        </th>
                        {MONTH_LABELS.map((m) => (
                           <th
                              key={m}
                              colSpan={2}
                              className="sticky top-0 z-20 border-l border-slate-200 bg-slate-100 px-0 py-1.5 align-top text-slate-600"
                           >
                              <span className="text-xs font-bold tracking-wide uppercase">
                                 {m}
                              </span>
                              <PairLegend />
                           </th>
                        ))}
                        <th
                           colSpan={2}
                           className="sticky top-0 z-20 border-l border-slate-300 bg-slate-200 px-0 py-1.5 align-top font-bold text-slate-700"
                        >
                           <span className="text-xs font-bold tracking-wide uppercase">
                              Total
                           </span>
                           <PairLegend />
                        </th>
                     </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                     {TABLE_ROWS.map((row) => (
                        <tr key={row}>
                           <td className="sticky left-0 z-10 border-r border-slate-300 bg-white px-3 py-1.5">
                              <div className="h-3 w-12 animate-pulse rounded bg-slate-200" />
                           </td>
                           {MONTH_LABELS.map((m) => (
                              <Fragment key={m}>
                                 <SkelNumCell
                                    col="hv"
                                    className="border-l border-slate-100"
                                 />
                                 <SkelNumCell col="pso" />
                              </Fragment>
                           ))}
                           <SkelNumCell
                              col="hv"
                              className="border-l border-slate-300 bg-slate-50"
                              tone="bg-slate-200"
                           />
                           <SkelNumCell
                              col="pso"
                              className="bg-slate-50"
                              tone="bg-slate-200"
                           />
                        </tr>
                     ))}

                     {/* Linha TOTAL */}
                     <tr>
                        <td className="sticky left-0 z-10 border-t border-r border-slate-300 bg-slate-200 px-3 py-1.5 font-bold text-slate-800">
                           TOTAL
                        </td>
                        {MONTH_LABELS.map((m) => (
                           <Fragment key={m}>
                              <SkelNumCell
                                 col="hv"
                                 className="border-t border-l border-slate-300 bg-slate-200"
                                 tone="bg-slate-300"
                              />
                              <SkelNumCell
                                 col="pso"
                                 className="border-t border-slate-300 bg-slate-200"
                                 tone="bg-slate-300"
                              />
                           </Fragment>
                        ))}
                        <SkelNumCell
                           col="hv"
                           className="border-t border-l border-slate-300 bg-slate-300"
                           tone="bg-slate-400/70"
                        />
                        <SkelNumCell
                           col="pso"
                           className="border-t border-slate-300 bg-slate-300"
                           tone="bg-slate-400/70"
                        />
                     </tr>
                  </tbody>
               </table>
            </div>

            <p className="mt-2 px-1 font-mono text-[11px] tracking-wide text-slate-400">
               HV = horas de voo (HH:MM) · PSO = nº de pousos
            </p>
         </div>
      </div>
   );
}
