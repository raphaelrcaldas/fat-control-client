"use client";

import Link from "next/link";
import {
   MdFlightTakeoff,
   MdLayers,
   MdLocationOn,
   MdOutlineDescription,
} from "react-icons/md";
import { isoDateToShort, minutesToTime } from "@/../utils/dateHandler";
import type { OperacaoListItem } from "services/routes/ops/operacoes";
import {
   STATUS_DOT,
   STATUS_GLOW,
   STATUS_LABEL,
   STATUS_SPINE,
   STATUS_TEXT,
   TIPO_CHIP,
   TIPO_LABEL,
} from "./operacaoUi";

export function OperacaoCard({ op }: { op: OperacaoListItem }) {
   return (
      <Link
         href={`/ops/operacoes/${op.id}`}
         className={`group relative flex items-stretch overflow-hidden border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-slate-300 hover:shadow-lg ${STATUS_GLOW[op.status]}`}
      >
         {/* Espinha de status — varredura instantânea pela lista */}
         <span
            className={`w-1 shrink-0 transition-all duration-200 group-hover:w-1.5 ${STATUS_SPINE[op.status]}`}
            aria-hidden
         />

         <div className="flex min-w-0 flex-1 flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:gap-5">
            {/* Identidade: nome + tipo, depois cidade / status / documento */}
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
               <div className="flex items-center gap-2">
                  <h3 className="w-28 truncate text-[15px] leading-none font-extrabold tracking-tight text-slate-900 uppercase">
                     {op.nome}
                  </h3>
                  <span
                     className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ring-1 ring-inset ${TIPO_CHIP[op.tipo]}`}
                  >
                     {TIPO_LABEL[op.tipo]}
                  </span>
               </div>

               <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs leading-none text-slate-500">
                  <span className="inline-flex w-28 shrink-0 items-center gap-1.5 font-semibold">
                     <span className="relative flex h-1.5 w-1.5 shrink-0">
                        {op.status === "andamento" && (
                           <span
                              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${STATUS_DOT[op.status]}`}
                              aria-hidden
                           />
                        )}
                        <span
                           className={`relative inline-flex h-1.5 w-1.5 rounded-full ${STATUS_DOT[op.status]}`}
                        />
                     </span>
                     <span className={STATUS_TEXT[op.status]}>
                        {STATUS_LABEL[op.status]}
                     </span>
                  </span>

                  {/* Slots sempre renderizados (largura fixa) — colunas
                      alinhadas entre os cards mesmo sem cidade/documento */}
                  <span className="inline-flex w-48 shrink-0 items-center gap-1 truncate text-slate-400">
                     <MdLocationOn className="h-3.5 w-3.5 shrink-0" />
                     {op.cidade ? (
                        <span className="truncate text-slate-500">
                           {op.cidade.nome} — {op.cidade.uf}
                        </span>
                     ) : (
                        <span className="text-slate-300">—</span>
                     )}
                  </span>

                  <span className="inline-flex w-56 shrink-0 items-center gap-1 truncate text-slate-400">
                     {op.documento_referencia && (
                        <>
                           <MdOutlineDescription className="h-3.5 w-3.5 shrink-0" />
                           <span className="truncate text-slate-500">
                              {op.documento_referencia}
                           </span>
                        </>
                     )}
                  </span>
               </div>
            </div>

            {/* Painel de dados: período · horas (herói) · etapas/anv */}
            <div className="flex shrink-0 items-center justify-between gap-4 rounded border border-slate-300 bg-slate-50/80 px-3 py-2 md:justify-start">
               {/* Período */}
               <div className="flex w-44 shrink-0 flex-col gap-1">
                  <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                     Período
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-sm font-bold text-slate-700 tabular-nums">
                     {isoDateToShort(op.data_inicio)}
                     <span className="text-slate-300">→</span>
                     {isoDateToShort(op.data_fim)}
                     <span className="rounded bg-slate-200/80 px-1 py-px text-[10px] font-bold text-slate-500">
                        {op.dias}d
                     </span>
                  </span>
               </div>

               <span
                  className="hidden h-9 w-px bg-slate-200 sm:block"
                  aria-hidden
               />

               {/* Horas — métrica herói */}
               <div className="flex w-20 shrink-0 flex-col gap-1">
                  <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                     Horas
                  </span>
                  <span className="flex items-baseline gap-0.5 leading-none">
                     <span className="font-mono text-lg font-extrabold text-red-600 tabular-nums">
                        {minutesToTime(op.horas)}
                     </span>
                     <span className="text-[10px] font-bold text-red-400">
                        h
                     </span>
                  </span>
               </div>

               <span
                  className="hidden h-9 w-px bg-slate-200 sm:block"
                  aria-hidden
               />

               {/* Etapas / Aeronaves */}
               <div className="flex w-24 shrink-0 flex-col gap-1">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                     <MdLayers className="h-3.5 w-3.5 text-slate-400" />
                     <strong className="text-slate-700 tabular-nums">
                        {op.etapas}
                     </strong>
                     etapas
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                     <MdFlightTakeoff className="h-3.5 w-3.5 text-slate-400" />
                     <strong className="text-slate-700 tabular-nums">
                        {op.anv}
                     </strong>
                     anv
                  </span>
               </div>
            </div>
         </div>
      </Link>
   );
}
