"use client";
import { useEffect, useState } from "react";
import { TbChartBar } from "react-icons/tb";
import clsx from "clsx";
import FilterPanel from "./components/FilterPanel";
import { SeboTable } from "./components/SeboTable";
import SeboChart from "./components/SeboChart";
import { SeboSkeleton } from "./components/SeboSkeleton";
import { useSeboFilters } from "./hooks/useSeboFilters";

export default function SeboPage() {
   const f = useSeboFilters();
   const [activeRow, setActiveRow] = useState(0);

   // O dataset muda (filtros/ano) => a seleção por índice volta ao topo,
   // evitando destacar a pessoa errada.
   useEffect(() => {
      setActiveRow(0);
   }, [f.trips]);

   const isRefetching = !f.isLoading && f.isFetching;
   const hasData = f.trips.length > 0;

   return (
      <div className="flex flex-col space-y-2">
         {/* Masthead — linguagem tática padrão do sistema */}
         <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
            <span
               aria-hidden
               className="absolute top-0 left-0 h-full w-1 bg-red-600"
            />

            <div className="relative flex min-w-0 items-center gap-4">
               <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-red-50 text-red-600 ring-1 ring-red-100 ring-inset">
                  <TbChartBar className="h-6 w-6" />
               </div>
               <div className="min-w-0">
                  <span className="block font-mono text-[10px] font-bold tracking-[0.3em] text-red-500 uppercase">
                     1º/1º GT · Estatística
                  </span>
                  <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                     Pau de Sebo
                  </h1>
               </div>
            </div>
         </header>

         <FilterPanel
            seboFunc={f.seboFunc}
            setSeboFunc={f.setSeboFunc}
            opIn={f.opIn}
            setOpIn={f.setOpIn}
            opOp={f.opOp}
            setOpOp={f.setOpOp}
            opAl={f.opAl}
            setOpAl={f.setOpAl}
            soO3={f.soO3}
            setSoO3={f.setSoO3}
            ano={f.ano}
            setAno={f.setAno}
            infoCols={f.infoCols}
            setInfoCols={f.setInfoCols}
         />

         {f.isLoading ? (
            <SeboSkeleton />
         ) : !hasData ? (
            <div className="rounded border border-dashed border-slate-300 bg-slate-50 px-4 py-16 text-center">
               <p className="text-sm font-semibold text-slate-600">
                  Nenhum resultado encontrado
               </p>
               <p className="mt-1 text-xs text-slate-400">
                  Ajuste os filtros para encontrar o que precisa.
               </p>
            </div>
         ) : (
            <div
               className={clsx(
                  "flex flex-col gap-3 transition-opacity duration-200 xl:flex-row",
                  isRefetching && "pointer-events-none opacity-50"
               )}
            >
               {/* Tabela — largura apenas do necessário */}
               <div className="w-auto">
                  <SeboTable
                     trips={f.trips}
                     activeRow={activeRow}
                     setRow={setActiveRow}
                     infoCols={f.infoCols}
                     isPilot={f.seboFunc === "pil"}
                  />
               </div>

               {/* Gráfico — ocupa o espaço restante */}
               <div className="hidden flex-1 xl:block">
                  <div className="sticky top-4 rounded border border-slate-200 bg-white p-4 shadow-sm">
                     <h3 className="mb-4 text-lg font-semibold text-slate-800">
                        Gráfico de Horas de Voo
                     </h3>
                     <SeboChart trips={f.trips} activeRow={activeRow} />
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
