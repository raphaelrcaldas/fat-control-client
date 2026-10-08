"use client";

import type { ReactNode } from "react";
import {
   TbClockHour4,
   TbPlaneArrival,
   TbPlane,
   TbCalendarStats,
} from "react-icons/tb";
import { minutesToTime } from "@/../utils/dateHandler";
import type { AnvHorasResponse } from "services/routes/estatistica/horasAnv";
import { MONTH_LABELS } from "../constants";
import { getHorasAnvStats } from "../utils";

interface StatCardProps {
   icon: ReactNode;
   label: string;
   value: ReactNode;
   sub: string;
}

function StatCard({ icon, label, value, sub }: StatCardProps) {
   return (
      <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
         <div className="flex items-center gap-3">
            <div className="bg-primary-50 text-primary-600 ring-primary-100 hidden h-10 w-10 shrink-0 place-items-center rounded-md ring-1 ring-inset sm:grid">
               {icon}
            </div>
            <div className="min-w-0">
               <span className="block font-mono text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">
                  {label}
               </span>
               <span className="block truncate text-2xl leading-tight font-extrabold tracking-tight text-slate-900 tabular-nums">
                  {value}
               </span>
            </div>
         </div>
         <p className="mt-2 truncate text-xs text-slate-400">{sub}</p>
      </div>
   );
}

interface HorasAnvStatsProps {
   data: AnvHorasResponse;
   ano: number;
}

export function HorasAnvStats({ data, ano }: HorasAnvStatsProps) {
   const { aeronavesAtivas, totalFrota, picoIdx, picoTvoo } =
      getHorasAnvStats(data);

   const picoLabel = picoIdx >= 0 ? MONTH_LABELS[picoIdx].toUpperCase() : "—";

   return (
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
         <StatCard
            icon={<TbClockHour4 className="h-5 w-5" />}
            label="Horas Voadas"
            value={minutesToTime(data.total_tvoo)}
            sub={`Tempo de voo total em ${ano}`}
         />
         <StatCard
            icon={<TbPlaneArrival className="h-5 w-5" />}
            label="Pousos"
            value={data.total_pousos.toLocaleString("pt-BR")}
            sub="Pousos registrados"
         />
         <StatCard
            icon={<TbPlane className="h-5 w-5" />}
            label="Aeronaves Ativas"
            value={
               <>
                  {aeronavesAtivas}
                  <span className="text-base font-bold text-slate-400">
                     /{totalFrota}
                  </span>
               </>
            }
            sub="Frota com registro no ano"
         />
         <StatCard
            icon={<TbCalendarStats className="h-5 w-5" />}
            label="Mês de Pico"
            value={picoLabel}
            sub={
               picoIdx >= 0
                  ? `${minutesToTime(picoTvoo)} de voo`
                  : "Sem registros no período"
            }
         />
      </div>
   );
}
