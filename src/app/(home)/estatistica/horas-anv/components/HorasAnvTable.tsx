"use client";

import { Fragment } from "react";
import clsx from "clsx";
import { minutesToTime } from "@/../utils/dateHandler";
import type { AnvHorasResponse } from "services/routes/estatistica/horasAnv";
import { MONTH_LABELS } from "../constants";

interface HorasAnvTableProps {
   data: AnvHorasResponse;
   anoRef: number;
}

/** Larguras fixas por subcoluna — mantêm todos os meses uniformes,
 *  com ou sem dados. */
const HV_W = "min-w-12";
const PSO_W = "min-w-8";

/** Célula numérica: mostra o valor ou um traço sutil quando zerado. */
function NumCell({
   value,
   active,
   col,
   className,
}: {
   value: string | number;
   active: boolean;
   col: "hv" | "pso";
   className?: string;
}) {
   return (
      <td
         className={clsx(
            "px-0.5 py-1.5 tabular-nums",
            col === "hv" ? HV_W : PSO_W,
            active ? "text-slate-700" : "text-slate-300",
            className
         )}
      >
         {active ? value : "–"}
      </td>
   );
}

export function HorasAnvTable({ data, anoRef }: HorasAnvTableProps) {
   const currentDate = new Date();
   const highlightMonth =
      anoRef === currentDate.getFullYear() ? currentDate.getMonth() : -1;

   return (
      <div>
         <div
            role="region"
            aria-label="Horas de voo por aeronave e mês"
            tabIndex={0}
            className="focus-visible:ring-primary-600 max-h-[70vh] overflow-auto rounded border border-slate-200 bg-white shadow-sm focus-visible:ring-2 focus-visible:outline-none"
         >
            <table className="w-full border-collapse text-center text-sm whitespace-nowrap">
               <caption className="sr-only">
                  Horas de voo e pousos por aeronave, por mês, em {anoRef}
               </caption>
               <thead>
                  {/* Linha 1: nome do mês cobrindo as duas subcolunas (HV/PSO) */}
                  <tr>
                     <th
                        scope="col"
                        rowSpan={2}
                        className="sticky top-0 left-0 z-30 h-7 border-r border-b border-slate-300 bg-slate-100 px-3 align-middle font-bold text-slate-700"
                     >
                        ANV
                     </th>
                     {MONTH_LABELS.map((m, i) => (
                        <th
                           key={m}
                           scope="col"
                           colSpan={2}
                           className={clsx(
                              "sticky top-0 z-20 h-7 border-l border-slate-200 px-0",
                              i === highlightMonth
                                 ? "bg-primary-50 text-primary-700"
                                 : "bg-slate-100 text-slate-600"
                           )}
                        >
                           <span className="text-xs font-bold tracking-wide uppercase">
                              {m}
                           </span>
                        </th>
                     ))}
                     <th
                        scope="col"
                        colSpan={2}
                        className="sticky top-0 z-20 h-7 border-l border-slate-300 bg-slate-200 px-0 font-bold text-slate-700"
                     >
                        <span className="text-xs font-bold tracking-wide uppercase">
                           Total
                        </span>
                     </th>
                  </tr>

                  {/* Linha 2: subcolunas HV/PSO — th reais, alinhados às células */}
                  <tr className="font-mono text-[9px] tracking-wide">
                     {MONTH_LABELS.map((m, i) => {
                        const isHL = i === highlightMonth;
                        return (
                           <Fragment key={m}>
                              <th
                                 scope="col"
                                 className={clsx(
                                    "sticky top-7 z-20 border-b border-l border-slate-100 px-0.5 pb-1 font-normal",
                                    HV_W,
                                    isHL
                                       ? "bg-primary-50 text-primary-700"
                                       : "bg-slate-100 text-slate-400"
                                 )}
                              >
                                 <abbr
                                    title="Horas de voo"
                                    className="no-underline"
                                 >
                                    HV
                                 </abbr>
                              </th>
                              <th
                                 scope="col"
                                 className={clsx(
                                    "sticky top-7 z-20 border-b border-slate-100 px-0.5 pb-1 font-normal",
                                    PSO_W,
                                    isHL
                                       ? "bg-primary-50 text-primary-700"
                                       : "bg-slate-100 text-slate-400"
                                 )}
                              >
                                 <abbr title="Pousos" className="no-underline">
                                    PSO
                                 </abbr>
                              </th>
                           </Fragment>
                        );
                     })}
                     <th
                        scope="col"
                        className={clsx(
                           "sticky top-7 z-20 border-b border-l border-slate-300 bg-slate-200 px-0.5 pb-1 font-normal text-slate-500",
                           HV_W
                        )}
                     >
                        <abbr title="Horas de voo" className="no-underline">
                           HV
                        </abbr>
                     </th>
                     <th
                        scope="col"
                        className={clsx(
                           "sticky top-7 z-20 border-b border-slate-300 bg-slate-200 px-0.5 pb-1 font-normal text-slate-500",
                           PSO_W
                        )}
                     >
                        <abbr title="Pousos" className="no-underline">
                           PSO
                        </abbr>
                     </th>
                  </tr>
               </thead>

               <tbody className="divide-y divide-slate-100">
                  {data.items.map((item) => (
                     <tr key={item.matricula} className="group">
                        <th
                           scope="row"
                           className="sticky left-0 z-10 border-r border-slate-300 bg-white px-3 py-1.5 font-bold text-slate-800 group-hover:bg-slate-50"
                        >
                           {item.matricula}
                        </th>
                        {item.meses.map((mes, i) => {
                           const isHL = i === highlightMonth;
                           return (
                              <Fragment key={i}>
                                 <NumCell
                                    value={minutesToTime(mes.tvoo)}
                                    active={mes.tvoo > 0}
                                    col="hv"
                                    className={clsx(
                                       "border-l border-slate-100",
                                       isHL
                                          ? "bg-primary-50/60"
                                          : "group-hover:bg-slate-50"
                                    )}
                                 />
                                 <NumCell
                                    value={mes.pousos}
                                    active={mes.pousos > 0}
                                    col="pso"
                                    className={clsx(
                                       isHL
                                          ? "bg-primary-50/60"
                                          : "group-hover:bg-slate-50"
                                    )}
                                 />
                              </Fragment>
                           );
                        })}
                        <NumCell
                           value={minutesToTime(item.total_tvoo)}
                           active={item.total_tvoo > 0}
                           col="hv"
                           className="border-l border-slate-300 bg-slate-50 group-hover:bg-slate-100"
                        />
                        <NumCell
                           value={item.total_pousos}
                           active={item.total_pousos > 0}
                           col="pso"
                           className="bg-slate-50 group-hover:bg-slate-100"
                        />
                     </tr>
                  ))}

                  {/* Linha TOTAL */}
                  <tr className="font-bold text-slate-800">
                     <th
                        scope="row"
                        className="sticky left-0 z-10 border-t border-r border-slate-300 bg-slate-200 px-3 py-1.5"
                     >
                        TOTAL
                     </th>
                     {data.total_meses.map((mes, i) => (
                        <Fragment key={i}>
                           <td
                              className={clsx(
                                 "border-t border-l border-slate-300 px-0.5 py-1.5 tabular-nums",
                                 HV_W,
                                 i === highlightMonth
                                    ? "bg-primary-100 text-primary-800"
                                    : "bg-slate-200"
                              )}
                           >
                              {mes.tvoo > 0 ? minutesToTime(mes.tvoo) : "–"}
                           </td>
                           <td
                              className={clsx(
                                 "border-t border-slate-300 px-0.5 py-1.5 tabular-nums",
                                 PSO_W,
                                 i === highlightMonth
                                    ? "bg-primary-100 text-primary-800"
                                    : "bg-slate-200"
                              )}
                           >
                              {mes.pousos > 0 ? mes.pousos : "–"}
                           </td>
                        </Fragment>
                     ))}
                     <td
                        className={clsx(
                           "border-t border-l border-slate-300 bg-slate-300 px-0.5 py-1.5 tabular-nums",
                           HV_W
                        )}
                     >
                        {minutesToTime(data.total_tvoo)}
                     </td>
                     <td
                        className={clsx(
                           "border-t border-slate-300 bg-slate-300 px-0.5 py-1.5 tabular-nums",
                           PSO_W
                        )}
                     >
                        {data.total_pousos}
                     </td>
                  </tr>
               </tbody>
            </table>
         </div>

         <p className="mt-2 px-1 font-mono text-[11px] tracking-wide text-slate-400">
            HV = horas de voo (HH:MM) · PSO = nº de pousos
         </p>
      </div>
   );
}
