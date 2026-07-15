"use client";

import { useMemo, useRef } from "react";
import clsx from "clsx";
import { useEsfAerHistorico } from "@/hooks/queries/useEsfAer";
import { useHistoricoFilters } from "./hooks/useHistoricoFilters";
import { useHistoricoVisibility } from "./hooks/useHistoricoVisibility";
import { useCarryForward } from "./hooks/useCarryForward";
import { buildProgramColors } from "./utils";
import { HistoricoHeader } from "./components/HistoricoHeader";
import { HistoricoSkeleton } from "./components/HistoricoSkeleton";
import { HistoricoToolbar } from "./components/HistoricoToolbar";
import {
   HistoricoChart,
   type HistoricoChartHandle,
} from "./components/HistoricoChart";
import { ProgramRail } from "./components/ProgramRail";
import type { HistPrograma } from "services/routes/estatistica/esfAer";

const EMPTY_PROGRAMAS: HistPrograma[] = [];

export default function HistoricoEsfAerPage() {
   // Filtros espelhados na URL (compartilhável): ano de referência + busca.
   const { anoRef, query, setAnoRef, setQuery } = useHistoricoFilters();

   const { data, isLoading, isFetching } = useEsfAerHistorico(anoRef);
   // Refetch suave (keepPreviousData): esmaecer conteúdo sem cobrir com spinner.
   const isRefetching = !isLoading && isFetching;

   const programas = data?.programas ?? EMPTY_PROGRAMAS;

   // Visibilidade das séries (default: só o Total; reseta ao trocar o ano).
   const {
      visibility,
      onToggleTotal,
      onToggleGroup,
      onTogglePrograma,
      onIsolate,
   } = useHistoricoVisibility(anoRef);

   // Derivados compartilhados por toolbar/chart/rail — UMA computação.
   const carry = useCarryForward(programas);
   const programColors = useMemo(
      () => buildProgramColors(programas),
      [programas]
   );

   const chartRef = useRef<HistoricoChartHandle>(null);
   const onResetZoom = () => chartRef.current?.resetZoom();

   return (
      <div className="space-y-2">
         <HistoricoHeader anoRef={anoRef} onAnoRefChange={setAnoRef} />

         {isLoading ? (
            <HistoricoSkeleton />
         ) : !data || programas.length === 0 ? (
            <div className="flex items-center justify-center rounded border border-slate-200 bg-white py-16 shadow-sm">
               <p className="text-sm text-gray-500">
                  Nenhum histórico de esforço aéreo para {anoRef}.
               </p>
            </div>
         ) : (
            <div
               className={clsx(
                  "space-y-2 transition-opacity duration-200",
                  isRefetching && "pointer-events-none opacity-50"
               )}
            >
               <HistoricoToolbar
                  totalVisible={visibility.totalVisible}
                  onToggleTotal={onToggleTotal}
                  grupos={carry.grupos}
                  groups={visibility.groups}
                  onToggleGroup={onToggleGroup}
                  somaAtualPorGrupo={carry.somaAtualPorGrupo}
                  onResetZoom={onResetZoom}
               />

               {/* Grid content-sized: alturas fixas no chart e `max-h` na lista
                   do rail — nada de medir viewport/container (já causou loop de
                   crescimento infinito com o ResizeObserver + ApexCharts). */}
               <div className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1fr)_330px]">
                  <div className="min-w-0">
                     <HistoricoChart
                        ref={chartRef}
                        historico={data}
                        visibility={visibility}
                        carry={carry}
                        programColors={programColors}
                     />
                  </div>

                  <div className="min-w-0">
                     <ProgramRail
                        programas={programas}
                        programColors={programColors}
                        toggled={visibility.toggled}
                        isolated={visibility.isolated}
                        query={query}
                        onQueryChange={setQuery}
                        onTogglePrograma={onTogglePrograma}
                        onIsolate={onIsolate}
                     />
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
