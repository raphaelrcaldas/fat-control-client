"use client";

import { minutesToTime } from "@/../utils/dateHandler";
import type { EsforcoBloco } from "services/routes/ops/operacoes";

export function EsforcoCard({ esforco }: { esforco: EsforcoBloco }) {
   return (
      <section className="rounded border border-slate-300 bg-white shadow">
         <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
               <span className="h-4 w-1 rounded-full bg-primary-600" />
               Esforço Aéreo
            </h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
               {esforco.rows.length}{" "}
               {esforco.rows.length === 1 ? "esforço" : "esforços"}
            </span>
         </header>

         {esforco.rows.length === 0 ? (
            <p className="flex min-h-70 items-center justify-center px-4 text-center text-sm text-slate-400">
               Nenhum esforço aéreo registrado nas etapas associadas.
            </p>
         ) : (
            <table className="w-full text-sm">
               <thead>
                  <tr className="font-mono text-[10px] tracking-[0.15em] text-slate-500 uppercase">
                     <th className="px-4 py-2 text-left font-bold">
                        Esforço aéreo
                     </th>
                     <th className="px-2 py-2 text-right font-bold">Etapas</th>
                     <th className="px-4 py-2 text-right font-bold">Horas</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {esforco.rows.map((r) => (
                     <tr key={r.esf_aer_id} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 text-slate-700">
                           {r.descricao}
                        </td>
                        <td className="px-2 py-2.5 text-right font-mono font-semibold text-slate-600 tabular-nums">
                           {r.etapas}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-800 tabular-nums">
                           {minutesToTime(r.horas)}
                        </td>
                     </tr>
                  ))}
               </tbody>
               <tfoot>
                  <tr className="border-t border-slate-200 bg-slate-50 font-bold">
                     <td className="px-4 py-2.5 text-slate-700">
                        Σ Total da operação
                     </td>
                     <td className="px-2 py-2.5 text-right font-mono text-slate-700 tabular-nums">
                        {esforco.total_etapas}
                     </td>
                     <td className="px-4 py-2.5 text-right font-mono text-slate-900 tabular-nums">
                        {minutesToTime(esforco.total_horas)}
                     </td>
                  </tr>
               </tfoot>
            </table>
         )}
      </section>
   );
}
