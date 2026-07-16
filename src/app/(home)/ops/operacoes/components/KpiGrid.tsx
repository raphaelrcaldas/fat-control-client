"use client";

import { minutesToTime } from "@/../utils/dateHandler";
import type { OperacaoKpis } from "services/routes/ops/operacoes";

const nf = new Intl.NumberFormat("pt-BR");

interface KpiCardProps {
   label: string;
   value: string;
   unit?: string;
   sub?: string;
   highlight?: boolean;
}

function KpiCard({ label, value, unit, sub, highlight }: KpiCardProps) {
   return (
      <div
         className={
            highlight
               ? "rounded bg-linear-to-br from-primary-600 to-primary-700 px-4 py-3 text-white shadow"
               : "rounded border border-slate-300 bg-white px-4 py-3 shadow"
         }
      >
         <p
            className={`font-mono text-[10px] font-bold tracking-[0.2em] uppercase ${
               highlight ? "text-primary-100" : "text-slate-500"
            }`}
         >
            {label}
         </p>
         <p
            className={`mt-1 font-mono text-2xl leading-none font-extrabold tracking-tight tabular-nums ${
               highlight ? "text-white" : "text-slate-900"
            }`}
         >
            {value}
            {unit && (
               <span
                  className={`ml-0.5 text-sm font-bold ${
                     highlight ? "text-primary-200" : "text-slate-500"
                  }`}
               >
                  {unit}
               </span>
            )}
         </p>
         {sub && (
            <p
               className={`mt-1 text-[11px] font-medium ${
                  highlight ? "text-primary-100" : "text-slate-500"
               }`}
            >
               {sub}
            </p>
         )}
      </div>
   );
}

export function KpiGrid({ kpis }: { kpis: OperacaoKpis }) {
   const mediaComb = kpis.etapas > 0 ? Math.round(kpis.comb / kpis.etapas) : 0;

   return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
         <KpiCard
            label="Horas voadas"
            value={minutesToTime(kpis.horas)}
            unit="h"
         />
         <KpiCard label="Etapas" value={nf.format(kpis.etapas)} />
         <KpiCard label="Aeronaves" value={nf.format(kpis.anv)} />
         <KpiCard label="Pax" value={nf.format(kpis.pax)} />
         <KpiCard
            label="Carga"
            value={nf.format(Math.round(kpis.carga))}
            unit="Kg"
         />
         <KpiCard
            label="Combustível"
            value={nf.format(Math.round(kpis.comb))}
            unit="L"
         />
      </div>
   );
}
