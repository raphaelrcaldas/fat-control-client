"use client";

import { minutesToTime } from "@/../utils/dateHandler";
import type {
   RegimeLinha,
   TipoMissaoLinha,
} from "services/routes/estatistica/indicadores";
import { REGIME_LABELS } from "../constants";
import { fmtInt, pct } from "../utils";
import { SecaoCard } from "./SecaoCard";

/** Quantos tipos de missão listar antes de agrupar o resto. */
const TOP_TIPOS = 8;

interface IndicadoresQuebrasProps {
   porRegime: RegimeLinha[];
   porTipoMissao: TipoMissaoLinha[];
}

export function IndicadoresQuebras({
   porRegime,
   porTipoMissao,
}: IndicadoresQuebrasProps) {
   const totalRegime = porRegime.reduce((acc, r) => acc + r.tvoo, 0);
   const totalTipo = porTipoMissao.reduce((acc, t) => acc + t.tvoo, 0);

   const topTipos = porTipoMissao.slice(0, TOP_TIPOS);
   const resto = porTipoMissao.slice(TOP_TIPOS);
   const restoTvoo = resto.reduce((acc, t) => acc + t.tvoo, 0);
   const restoEtapas = resto.reduce((acc, t) => acc + t.etapas, 0);

   return (
      <div className="grid gap-2 lg:grid-cols-2">
         <SecaoCard titulo="Regime de Voo">
            {porRegime.length === 0 ? (
               <p className="px-4 py-8 text-center text-sm text-slate-500">
                  Sem horas registradas no período.
               </p>
            ) : (
               <table className="w-full text-sm">
                  <thead>
                     <tr className="border-b border-slate-200 bg-slate-50 font-mono text-[10px] tracking-wider text-slate-600 uppercase">
                        <th className="px-4 py-2 text-left font-bold">
                           Regime
                        </th>
                        <th className="px-4 py-2 text-right font-bold">
                           Horas
                        </th>
                        <th className="w-20 px-4 py-2 text-right font-bold">
                           Part.
                        </th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {porRegime.map((r) => (
                        <tr key={r.reg} className="hover:bg-slate-50">
                           <td className="px-4 py-2 font-semibold text-slate-800">
                              {REGIME_LABELS[r.reg] ?? r.reg}
                           </td>
                           <td className="px-4 py-2 text-right text-slate-700 tabular-nums">
                              {minutesToTime(r.tvoo)}
                           </td>
                           <td className="px-4 py-2 text-right text-slate-500 tabular-nums">
                              {pct(r.tvoo, totalRegime).toFixed(1)}%
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            )}
         </SecaoCard>

         <SecaoCard titulo="Tipo de Missão">
            {porTipoMissao.length === 0 ? (
               <p className="px-4 py-8 text-center text-sm text-slate-500">
                  Sem missões registradas no período.
               </p>
            ) : (
               <div
                  className="overflow-x-auto"
                  tabIndex={0}
                  role="region"
                  aria-label="Horas por tipo de missão"
               >
                  <table className="w-full text-sm whitespace-nowrap">
                     <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 font-mono text-[10px] tracking-wider text-slate-600 uppercase">
                           <th className="px-4 py-2 text-left font-bold">
                              Tipo
                           </th>
                           <th className="px-4 py-2 text-right font-bold">
                              Etapas
                           </th>
                           <th className="px-4 py-2 text-right font-bold">
                              Horas
                           </th>
                           <th className="w-20 px-4 py-2 text-right font-bold">
                              Part.
                           </th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {topTipos.map((t) => (
                           <tr key={t.cod} className="hover:bg-slate-50">
                              <td className="px-4 py-2">
                                 <span className="font-mono text-xs font-bold text-slate-500">
                                    {t.cod}
                                 </span>
                                 <span className="ml-2 font-semibold text-slate-800">
                                    {t.desc}
                                 </span>
                              </td>
                              <td className="px-4 py-2 text-right text-slate-700 tabular-nums">
                                 {fmtInt(t.etapas)}
                              </td>
                              <td className="px-4 py-2 text-right text-slate-700 tabular-nums">
                                 {minutesToTime(t.tvoo)}
                              </td>
                              <td className="px-4 py-2 text-right text-slate-500 tabular-nums">
                                 {pct(t.tvoo, totalTipo).toFixed(1)}%
                              </td>
                           </tr>
                        ))}
                        {resto.length > 0 && (
                           <tr className="bg-slate-50 text-slate-500">
                              <td className="px-4 py-2 font-semibold italic">
                                 Outros ({resto.length})
                              </td>
                              <td className="px-4 py-2 text-right tabular-nums">
                                 {fmtInt(restoEtapas)}
                              </td>
                              <td className="px-4 py-2 text-right tabular-nums">
                                 {minutesToTime(restoTvoo)}
                              </td>
                              <td className="px-4 py-2 text-right tabular-nums">
                                 {pct(restoTvoo, totalTipo).toFixed(1)}%
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            )}
         </SecaoCard>
      </div>
   );
}
