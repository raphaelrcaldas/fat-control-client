"use client";
import { useMemo, useState } from "react";
import { TbChartBar } from "react-icons/tb";
import clsx from "clsx";
import FilterPanel from "./components/FilterPanel";
import { SeboTable } from "./components/SeboTable";
import dynamic from "next/dynamic";
import { Alert, Button } from "flowbite-react";
import { SeboStatCards } from "./components/SeboStatCards";
import { computeSeboStats } from "./utils";
import { useSeboDesktop } from "./hooks/useSeboDesktop";
import { SeboSkeleton, SeboChartSkeleton } from "./components/SeboSkeleton";
import { useSeboFilters } from "./hooks/useSeboFilters";

const SeboChart = dynamic(() => import("./components/SeboChart"), {
   ssr: false,
   loading: () => <SeboChartSkeleton />,
});

export default function SeboPage() {
   const f = useSeboFilters();
   const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
   const activeTripId = f.trips.some((trip) => trip.trip_id === selectedTripId)
      ? selectedTripId
      : (f.trips[0]?.trip_id ?? null);
   const activeRow = f.trips.findIndex((trip) => trip.trip_id === activeTripId);
   const desktop = useSeboDesktop();
   const stats = useMemo(
      () => computeSeboStats(f.trips.map((trip) => trip.voo.h_ano)),
      [f.trips]
   );
   const isRefetching = f.isPlaceholderData;
   const hasData = f.trips.length > 0;

   return (
      <div className="flex min-w-0 flex-col space-y-2">
         {/* Masthead — linguagem tática padrão do sistema */}
         <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
            <span
               aria-hidden
               className="bg-primary-600 absolute top-0 left-0 h-full w-1"
            />

            <div className="relative flex min-w-0 items-center gap-4">
               <div className="bg-primary-50 text-primary-600 ring-primary-100 grid h-12 w-12 shrink-0 place-items-center rounded-md ring-1 ring-inset">
                  <TbChartBar className="h-6 w-6" />
               </div>
               <div className="min-w-0">
                  <span className="text-primary-600 block font-mono text-[10px] font-bold tracking-[0.3em] uppercase">
                     Estatística
                  </span>
                  <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                     Pau de Sebo
                  </h1>
               </div>
            </div>
         </header>

         <FilterPanel filters={f} />

         {f.isError && (
            <Alert color="failure">
               <div className="flex flex-wrap items-center justify-between gap-3">
                  <span>
                     {hasData
                        ? "Não foi possível atualizar os dados. Exibindo a última consulta disponível."
                        : "Não foi possível carregar os dados do Pau de Sebo."}
                  </span>
                  <Button
                     color="light"
                     size="xs"
                     onClick={() => void f.refetch()}
                     disabled={f.isFetching}
                  >
                     Tentar novamente
                  </Button>
               </div>
            </Alert>
         )}

         {f.isLoading ? (
            <SeboSkeleton
               infoCols={f.infoCols}
               isPilot={f.seboFunc === "pil"}
            />
         ) : f.isError && !hasData ? null : !hasData ? (
            <div className="space-y-1 rounded border border-dashed border-slate-300 bg-slate-50 px-4 py-16 text-center">
               <p className="text-sm font-semibold text-slate-700">
                  {f.hasOper
                     ? "Nenhum resultado encontrado"
                     : "Nenhuma operacionalidade selecionada"}
               </p>
               <p className="text-xs text-slate-600">
                  {f.hasOper
                     ? "Ajuste os filtros para encontrar o que precisa."
                     : "Marque ao menos uma operacionalidade para listar os tripulantes."}
               </p>
            </div>
         ) : (
            <div
               aria-busy={isRefetching}
               className={clsx(
                  "grid min-w-0 grid-cols-1 items-start gap-3 transition-opacity duration-200 xl:grid-cols-[minmax(0,max-content)_minmax(22rem,1fr)]",
                  isRefetching && "opacity-50"
               )}
            >
               {stats && (
                  <div className="hidden sm:block xl:hidden">
                     <SeboStatCards stats={stats} />
                  </div>
               )}
               {/* Tabela — largura apenas do necessário */}
               <div className="min-w-0">
                  <SeboTable
                     trips={f.trips}
                     activeTripId={activeTripId}
                     onSelect={setSelectedTripId}
                     infoCols={f.infoCols}
                     isPilot={f.seboFunc === "pil"}
                  />
               </div>

               {/* Gráfico — ocupa o espaço restante */}
               <aside
                  aria-labelledby="sebo-chart-title"
                  className="hidden min-w-0 space-y-4 rounded border border-slate-200 bg-white p-4 shadow-sm xl:sticky xl:top-4 xl:block"
               >
                  <h2
                     id="sebo-chart-title"
                     className="text-lg font-semibold text-slate-800"
                  >
                     Gráfico de Horas de Voo
                  </h2>
                  {desktop && stats && (
                     <SeboChart
                        trips={f.trips}
                        activeRow={activeRow}
                        isPilot={f.seboFunc === "pil"}
                        stats={stats}
                     />
                  )}
               </aside>
            </div>
         )}
      </div>
   );
}
