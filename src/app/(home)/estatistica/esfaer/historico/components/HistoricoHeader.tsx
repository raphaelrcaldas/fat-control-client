"use client";

import Link from "next/link";
import { Label, Select } from "flowbite-react";
import { TbArrowLeft, TbChartHistogram } from "react-icons/tb";
import { YEAR_OPTIONS } from "../../constants";

interface HistoricoHeaderProps {
   anoRef: number;
   onAnoRefChange: (ano: number) => void;
}

export function HistoricoHeader({
   anoRef,
   onAnoRefChange,
}: HistoricoHeaderProps) {
   return (
      <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
         <span
            aria-hidden
            className="absolute top-0 left-0 h-full w-1 bg-red-600"
         />

         <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
               <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-red-50 text-red-600 ring-1 ring-red-100 ring-inset">
                  <TbChartHistogram className="h-6 w-6" />
               </div>
               <div className="min-w-0">
                  <Link
                     href="/estatistica/esfaer"
                     className="group -ml-0.5 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.3em] text-slate-400 uppercase transition-colors hover:text-red-500"
                  >
                     <TbArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                     Esforço Aéreo
                  </Link>
                  <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                     Histórico de Esforço Aéreo
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                     Evolução das horas alocadas ao longo do ano
                  </p>
               </div>
            </div>

            <div className="flex items-center gap-2">
               <Label
                  htmlFor="anoRef"
                  className="font-mono text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase"
               >
                  Ano
               </Label>
               <Select
                  id="anoRef"
                  value={anoRef}
                  onChange={(e) => onAnoRefChange(Number(e.target.value))}
                  className="w-24"
               >
                  {YEAR_OPTIONS.map((year) => (
                     <option key={year} value={year}>
                        {year}
                     </option>
                  ))}
               </Select>
            </div>
         </div>
      </header>
   );
}
