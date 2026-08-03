"use client";

import clsx from "clsx";
import { minutesToTime } from "@/../utils/dateHandler";
import type {
   MesLinha,
   Metricas,
} from "services/routes/estatistica/indicadores";
import { MONTH_LABELS } from "../constants";
import { fmtInt, fmtDec } from "../utils";
import { SecaoCard } from "./SecaoCard";

interface MatrizRow {
   key: keyof Metricas;
   label: string;
   unit?: string;
   fmt: (n: number) => string;
   /** Abre um grupo visual (borda superior mais forte). */
   groupStart?: boolean;
}

const MATRIZ_ROWS: MatrizRow[] = [
   { key: "tvoo", label: "Horas Voadas", fmt: minutesToTime },
   { key: "etapas", label: "Etapas", fmt: fmtInt },
   { key: "pousos", label: "Pousos", fmt: fmtInt },
   { key: "pax", label: "Passageiros", groupStart: true, fmt: fmtInt },
   { key: "carga", label: "Carga", unit: "kg", fmt: fmtInt },
   {
      key: "comb",
      label: "Combustível",
      unit: "L",
      groupStart: true,
      fmt: fmtInt,
   },
   { key: "lub", label: "Lubrificante", unit: "L", fmt: fmtDec },
   { key: "comb_transf", label: "Comb. Transferido", unit: "L", fmt: fmtInt },
   { key: "pqd", label: "PQD Lançados", groupStart: true, fmt: fmtInt },
   { key: "heavy_qtd", label: "Heavy", fmt: fmtInt },
   { key: "cds_qtd", label: "CDS", fmt: fmtInt },
   { key: "peso_lancado", label: "Carga Lançada", unit: "kg", fmt: fmtInt },
];

interface IndicadoresMatrizProps {
   mensal: MesLinha[];
   totais: Metricas;
   anoRef: number;
}

export function IndicadoresMatriz({
   mensal,
   totais,
   anoRef,
}: IndicadoresMatrizProps) {
   const hoje = new Date();
   const highlightMonth = anoRef === hoje.getFullYear() ? hoje.getMonth() : -1;

   return (
      <SecaoCard titulo={`Matriz Mensal · ${anoRef}`}>
         {/* tabIndex torna a área rolável alcançável pelo teclado — sem
             ela, quem não usa mouse não chega nos meses fora da tela. */}
         <div
            className="overflow-x-auto"
            tabIndex={0}
            role="region"
            aria-label={`Matriz mensal de indicadores de ${anoRef}`}
         >
            <table className="w-full border-collapse text-right text-sm whitespace-nowrap">
               <thead>
                  <tr>
                     <th className="sticky left-0 z-20 border-r border-b border-slate-300 bg-slate-100 px-3 py-2 text-left font-bold text-slate-700">
                        Indicador
                     </th>
                     {MONTH_LABELS.map((m, i) => (
                        <th
                           key={m}
                           className={clsx(
                              "min-w-16 border-b border-l border-slate-200 px-2 py-2 font-mono text-[11px] font-bold tracking-wide uppercase",
                              i === highlightMonth
                                 ? "bg-primary-50 text-primary-700"
                                 : "bg-slate-100 text-slate-600"
                           )}
                        >
                           {m}
                        </th>
                     ))}
                     <th className="min-w-20 border-b border-l border-slate-300 bg-slate-200 px-3 py-2 font-mono text-[11px] font-bold tracking-wide text-slate-700 uppercase">
                        Total
                     </th>
                  </tr>
               </thead>

               <tbody>
                  {MATRIZ_ROWS.map((row) => {
                     const total = totais[row.key];
                     return (
                        <tr
                           key={row.key}
                           className={clsx(
                              "group border-t",
                              row.groupStart
                                 ? "border-slate-300"
                                 : "border-slate-100"
                           )}
                        >
                           <th
                              scope="row"
                              className="sticky left-0 z-10 border-r border-slate-300 bg-white px-3 py-1.5 text-left font-semibold text-slate-800 group-hover:bg-slate-50"
                           >
                              {row.label}
                              {row.unit && (
                                 <span className="ml-1 font-mono text-[10px] font-normal text-slate-500">
                                    {row.unit}
                                 </span>
                              )}
                           </th>

                           {mensal.map((mes, i) => {
                              const v = mes[row.key];
                              return (
                                 <td
                                    key={mes.mes}
                                    className={clsx(
                                       "border-l border-slate-100 px-2 py-1.5 tabular-nums",
                                       i === highlightMonth
                                          ? "bg-primary-50/60"
                                          : "group-hover:bg-slate-50",
                                       v > 0
                                          ? "text-slate-700"
                                          : "text-slate-300"
                                    )}
                                 >
                                    {v > 0 ? row.fmt(v) : "–"}
                                 </td>
                              );
                           })}

                           <td
                              className={clsx(
                                 "border-l border-slate-300 bg-slate-50 px-3 py-1.5 font-bold tabular-nums group-hover:bg-slate-100",
                                 total > 0 ? "text-slate-900" : "text-slate-300"
                              )}
                           >
                              {total > 0 ? row.fmt(total) : "–"}
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
      </SecaoCard>
   );
}
