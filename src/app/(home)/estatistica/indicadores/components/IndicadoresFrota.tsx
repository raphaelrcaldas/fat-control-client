"use client";

import { minutesToTime } from "@/../utils/dateHandler";
import type { AeronaveLinha } from "services/routes/estatistica/indicadores";
import { fmtInt, pct } from "../utils";
import { SecaoCard } from "./SecaoCard";

interface IndicadoresFrotaProps {
   porAeronave: AeronaveLinha[];
}

export function IndicadoresFrota({ porAeronave }: IndicadoresFrotaProps) {
   const totalTvoo = porAeronave.reduce((acc, a) => acc + a.tvoo, 0);

   return (
      <SecaoCard titulo="Produção por Aeronave">
         {porAeronave.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
               Nenhuma aeronave com registro no período.
            </p>
         ) : (
            <div
               className="overflow-x-auto"
               tabIndex={0}
               role="region"
               aria-label="Produção por aeronave"
            >
               <table className="w-full text-sm whitespace-nowrap">
                  <thead>
                     <tr className="border-b border-slate-200 bg-slate-50 font-mono text-[10px] tracking-wider text-slate-600 uppercase">
                        <th className="px-4 py-2 text-left font-bold">ANV</th>
                        <th className="px-4 py-2 text-left font-bold">Proj.</th>
                        <th className="px-4 py-2 text-right font-bold">
                           Etapas
                        </th>
                        <th className="px-4 py-2 text-right font-bold">
                           Horas
                        </th>
                        <th className="px-4 py-2 text-right font-bold">
                           Pousos
                        </th>
                        <th className="px-4 py-2 text-right font-bold">
                           Carga kg
                        </th>
                        <th className="px-4 py-2 text-right font-bold">PAX</th>
                        <th className="w-20 px-4 py-2 text-right font-bold">
                           Part.
                        </th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {porAeronave.map((a) => (
                        <tr key={a.anv} className="hover:bg-slate-50">
                           <td className="px-4 py-2 font-bold text-slate-800 tabular-nums">
                              {a.anv}
                           </td>
                           <td className="px-4 py-2 font-mono text-xs text-slate-500">
                              {a.projeto}
                           </td>
                           <td className="px-4 py-2 text-right text-slate-700 tabular-nums">
                              {fmtInt(a.etapas)}
                           </td>
                           <td className="px-4 py-2 text-right text-slate-700 tabular-nums">
                              {minutesToTime(a.tvoo)}
                           </td>
                           <td className="px-4 py-2 text-right text-slate-700 tabular-nums">
                              {fmtInt(a.pousos)}
                           </td>
                           <td className="px-4 py-2 text-right text-slate-700 tabular-nums">
                              {fmtInt(a.carga)}
                           </td>
                           <td className="px-4 py-2 text-right text-slate-700 tabular-nums">
                              {fmtInt(a.pax)}
                           </td>
                           <td className="px-4 py-2 text-right text-slate-500 tabular-nums">
                              {pct(a.tvoo, totalTvoo).toFixed(1)}%
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
      </SecaoCard>
   );
}
