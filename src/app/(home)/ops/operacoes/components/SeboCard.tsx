"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { minutesToTime } from "@/../utils/dateHandler";
import type { SeboRow } from "services/routes/ops/operacoes";

export function SeboCard({ sebo }: { sebo: SeboRow[] }) {
   const [funcFilter, setFuncFilter] = useState<string | null>(null);

   const funcs = useMemo(() => {
      const set = new Set(sebo.map((s) => s.func));
      return Array.from(set);
   }, [sebo]);

   const rows = useMemo(() => {
      const filtered = funcFilter
         ? sebo.filter((s) => s.func === funcFilter)
         : sebo;
      return filtered;
   }, [sebo, funcFilter]);

   return (
      <section className="rounded border border-slate-300 bg-white shadow">
         <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
               <span className="bg-primary-600 h-4 w-1 rounded-full" />
               Pau de sebo
            </h2>
            <span className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">
               por tripulante · horas
            </span>
         </header>

         {funcs.length > 0 && (
            <div className="flex items-center gap-1.5 border-b border-slate-100 px-4 py-2">
               <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
                  Função
               </span>
               <button
                  type="button"
                  onClick={() => setFuncFilter(null)}
                  className={clsx(
                     "rounded-md px-2 py-1.5 text-[11px] font-bold uppercase transition-colors pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]",
                     funcFilter === null
                        ? "bg-primary-600 text-white"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  )}
               >
                  Todas
               </button>
               {funcs.map((f) => (
                  <button
                     key={f}
                     type="button"
                     onClick={() =>
                        setFuncFilter((cur) => (cur === f ? null : f))
                     }
                     className={clsx(
                        "rounded-md px-2 py-1.5 text-[11px] font-bold uppercase transition-colors pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]",
                        funcFilter === f
                           ? "bg-primary-600 text-white"
                           : "bg-primary-50 text-primary-700 hover:bg-primary-100"
                     )}
                  >
                     {f}
                  </button>
               ))}
            </div>
         )}

         {rows.length === 0 ? (
            <p className="flex min-h-70 items-center justify-center px-4 text-center text-sm text-slate-400">
               Nenhuma tripulação registrada nas etapas associadas.
            </p>
         ) : (
            <table className="w-full text-sm">
               <thead>
                  <tr className="font-mono text-[10px] tracking-[0.15em] text-slate-500 uppercase">
                     <th className="px-3 py-2 text-left font-bold">#</th>
                     <th className="px-2 py-2 text-left font-bold">
                        Nome de guerra
                     </th>
                     <th className="px-2 py-2 text-left font-bold">função</th>
                     <th className="px-2 py-2 text-right font-bold">Etapas</th>
                     <th className="px-4 py-2 text-right font-bold">Horas</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {rows.map((s, idx) => (
                     <tr key={s.trip_id} className="hover:bg-slate-50">
                        <td className="px-3 py-2">
                           <span
                              className={clsx(
                                 "flex h-6 w-6 items-center justify-center rounded-md font-mono text-xs font-bold tabular-nums",
                                 idx < 3
                                    ? "bg-primary-600 text-white"
                                    : "bg-slate-100 text-slate-600"
                              )}
                           >
                              {idx + 1}
                           </span>
                        </td>

                        <td className="px-2 py-2">
                           <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-700 uppercase">
                                 {s.nome}
                              </span>
                           </div>
                        </td>
                        <td className="px-2 py-2">
                           <span className="bg-primary-50 text-primary-700 rounded-md px-1.5 py-0.5 text-[11px] font-bold uppercase">
                              {s.func}
                           </span>
                        </td>
                        <td className="px-2 py-2 text-right font-mono font-semibold text-slate-600 tabular-nums">
                           {s.etapas}
                        </td>
                        <td className="px-4 py-2 text-right font-mono font-bold text-slate-800 tabular-nums">
                           {minutesToTime(s.horas)}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         )}
      </section>
   );
}
