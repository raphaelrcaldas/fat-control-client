import clsx from "clsx";
import { Fragment } from "react";
import { MONTH_LABELS } from "../constants";

const STAT_CARDS = [0, 1, 2, 3];
/** Frota típica — constante, para o skeleton nunca variar entre renders. */
const TABLE_ROWS = [0, 1, 2];

/** Larguras fixas por subcoluna — espelham HorasAnvTable (HV_W / PSO_W). */
const HV_W = "min-w-12";
const PSO_W = "min-w-8";

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
         {/* Altura de uma linha de texto da célula real (17,5px) */}
         <div className="flex h-[17.5px] items-center justify-center">
            <div
               className={clsx(
                  "h-3 animate-pulse rounded",
                  tone,
                  col === "hv" ? "w-9" : "w-5"
               )}
            />
         </div>
      </td>
   );
}

export function HorasAnvSkeleton() {
   return (
      <div role="status" className="space-y-2">
         <span className="sr-only">Carregando horas de voo por aeronave…</span>
         {/* KPIs — espelha StatCard de HorasAnvStats (mesmas alturas de bloco) */}
         <div aria-hidden className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {STAT_CARDS.map((i) => (
               <div
                  key={i}
                  className="rounded border border-slate-200 bg-white p-4 shadow-sm"
               >
                  <div className="flex items-center gap-3">
                     <div className="hidden h-10 w-10 shrink-0 animate-pulse rounded-md bg-slate-200 sm:block" />
                     <div className="min-w-0 flex-1">
                        <div className="flex h-[15px] items-center">
                           <div className="h-2.5 w-16 animate-pulse rounded bg-slate-100" />
                        </div>
                        <div className="flex h-[26.25px] items-center">
                           <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
                        </div>
                     </div>
                  </div>
                  <div className="mt-2 flex h-[14px] items-center">
                     <div className="h-2.5 w-32 animate-pulse rounded bg-slate-100" />
                  </div>
               </div>
            ))}
         </div>

         {/* Tabela — espelha a matriz 12 meses × HV/PSO de HorasAnvTable */}
         <div aria-hidden>
            <div className="max-h-[70vh] overflow-auto rounded border border-slate-200 bg-white shadow-sm">
               <table className="w-full border-collapse text-center text-sm whitespace-nowrap">
                  <thead>
                     {/* Linha 1: ANV + mês cobrindo HV/PSO + Total (texto estático) */}
                     <tr>
                        <th
                           rowSpan={2}
                           className="sticky top-0 left-0 z-30 h-7 border-r border-b border-slate-300 bg-slate-100 px-3 align-middle font-bold text-slate-700"
                        >
                           ANV
                        </th>
                        {MONTH_LABELS.map((m) => (
                           <th
                              key={m}
                              colSpan={2}
                              className="sticky top-0 z-20 h-7 border-l border-slate-200 bg-slate-100 px-0 text-slate-600"
                           >
                              <span className="text-xs font-bold tracking-wide uppercase">
                                 {m}
                              </span>
                           </th>
                        ))}
                        <th
                           colSpan={2}
                           className="sticky top-0 z-20 h-7 border-l border-slate-300 bg-slate-200 px-0 font-bold text-slate-700"
                        >
                           <span className="text-xs font-bold tracking-wide uppercase">
                              Total
                           </span>
                        </th>
                     </tr>

                     {/* Linha 2: subcolunas HV/PSO */}
                     <tr className="font-mono text-[9px] tracking-wide">
                        {MONTH_LABELS.map((m) => (
                           <Fragment key={m}>
                              <th
                                 className={clsx(
                                    "sticky top-7 z-20 border-b border-l border-slate-100 bg-slate-100 px-0.5 pb-1 font-normal text-slate-400",
                                    HV_W
                                 )}
                              >
                                 HV
                              </th>
                              <th
                                 className={clsx(
                                    "sticky top-7 z-20 border-b border-slate-100 bg-slate-100 px-0.5 pb-1 font-normal text-slate-400",
                                    PSO_W
                                 )}
                              >
                                 PSO
                              </th>
                           </Fragment>
                        ))}
                        <th
                           className={clsx(
                              "sticky top-7 z-20 border-b border-l border-slate-300 bg-slate-200 px-0.5 pb-1 font-normal text-slate-500",
                              HV_W
                           )}
                        >
                           HV
                        </th>
                        <th
                           className={clsx(
                              "sticky top-7 z-20 border-b border-slate-300 bg-slate-200 px-0.5 pb-1 font-normal text-slate-500",
                              PSO_W
                           )}
                        >
                           PSO
                        </th>
                     </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                     {TABLE_ROWS.map((row) => (
                        <tr key={row}>
                           <td className="sticky left-0 z-10 border-r border-slate-300 bg-white px-3 py-1.5">
                              <div className="flex h-[17.5px] items-center justify-center">
                                 <div className="h-3 w-9 animate-pulse rounded bg-slate-200" />
                              </div>
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
