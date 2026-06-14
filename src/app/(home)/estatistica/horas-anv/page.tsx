"use client";

import { useState } from "react";
import { Select, Label } from "flowbite-react";
import { TbPlaneInflight } from "react-icons/tb";
import clsx from "clsx";
import { useHorasAnv } from "@/hooks/queries";
import { YEAR_OPTIONS } from "./constants";
import { HorasAnvTable } from "./components/HorasAnvTable";
import { HorasAnvStats } from "./components/HorasAnvStats";
import { HorasAnvSkeleton } from "./components/HorasAnvSkeleton";

export default function HorasAnvPage() {
   const currentYear = new Date().getFullYear();
   const [anoRef, setAnoRef] = useState(currentYear);

   const { data, isLoading, isFetching } = useHorasAnv(anoRef);

   const isRefetching = !isLoading && isFetching;
   const hasData = !!data && data.items.length > 0;

   return (
      <div className="flex flex-col">
         {/* Masthead — linguagem tática padrão do sistema */}
         <header className="relative mb-5 overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
            <span
               aria-hidden
               className="absolute top-0 left-0 h-full w-1 bg-red-600"
            />

            <div className="relative flex flex-wrap items-center justify-between gap-4">
               <div className="flex min-w-0 items-center gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-red-50 text-red-600 ring-1 ring-red-100 ring-inset">
                     <TbPlaneInflight className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                     <span className="block font-mono text-[10px] font-bold tracking-[0.3em] text-red-500 uppercase">
                        1º/1º GT · Estatística
                     </span>
                     <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                        Horas por Aeronave
                     </h1>
                  </div>
               </div>

               <div className="flex items-center gap-2.5">
                  <Label
                     htmlFor="anoRef"
                     className="font-mono text-[11px] font-bold tracking-wider text-slate-400 uppercase"
                  >
                     Ano
                  </Label>
                  <Select
                     id="anoRef"
                     value={anoRef}
                     onChange={(e) => setAnoRef(Number(e.target.value))}
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

         {isLoading ? (
            <HorasAnvSkeleton />
         ) : !hasData ? (
            <div className="rounded border border-dashed border-slate-300 bg-slate-50 px-4 py-16 text-center">
               <p className="text-sm font-semibold text-slate-600">
                  Nenhum dado encontrado para {anoRef}
               </p>
               <p className="mt-1 text-xs text-slate-400">
                  Selecione outro ano de referência.
               </p>
            </div>
         ) : (
            <div
               className={clsx(
                  "flex flex-col gap-5 transition-opacity duration-200",
                  isRefetching && "pointer-events-none opacity-50"
               )}
            >
               <HorasAnvStats data={data} ano={anoRef} />
               <HorasAnvTable data={data} anoRef={anoRef} />
            </div>
         )}
      </div>
   );
}
