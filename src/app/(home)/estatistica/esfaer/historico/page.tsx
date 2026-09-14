"use client";

import { useMemo, useRef } from "react";
import clsx from "clsx";
import { Button } from "flowbite-react";
import { useEsfAerHistorico } from "@/hooks/queries/useEsfAer";
import { useHistoricoFilters } from "./hooks/useHistoricoFilters";
import { useHistoricoVisibility } from "./hooks/useHistoricoVisibility";
import { useCarryForward } from "./hooks/useCarryForward";
import { buildProgramColors } from "./utils";
import { TbAlertTriangle, TbChartLine } from "react-icons/tb";
import { EmptyState } from "@/components/ui/EmptyState";
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

   const { data, isLoading, isFetching, isError, refetch } =
      useEsfAerHistorico(anoRef);
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
      onClearIsolated,
      onResetVisibility,
      hasSelection,
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
         ) : isError && !data ? (
            /* Falha de carga vem ANTES do vazio: sem isso a tela afirmaria
               que não há histórico sobre dados que nunca chegaram a ser lidos.
               O guard `!data` respeita o `keepPreviousData` — com dado do ano
               anterior em tela, quem avisa é a faixa de erro abaixo. */
            <div role="alert">
               <EmptyState
                  icon={TbAlertTriangle}
                  title={`Não foi possível carregar o histórico de ${anoRef}`}
                  description="Verifique a conexão e tente novamente."
                  action={
                     <Button color="light" size="sm" onClick={() => refetch()}>
                        Tentar novamente
                     </Button>
                  }
               />
            </div>
         ) : !data || programas.length === 0 ? (
            <EmptyState
               icon={TbChartLine}
               title={`Nenhum histórico de esforço aéreo para ${anoRef}`}
               description="Nenhum programa teve horas alocadas neste ano de referência."
            />
         ) : (
            <>
               {isError && (
                  /* `keepPreviousData` mantém o ano anterior em tela quando o
                     novo falha: sem esta faixa, os dados antigos apareceriam
                     sob o rótulo do ano novo, sem nenhum sinal. Fica FORA do
                     wrapper esmaecido — senão o botão de retry nasceria
                     `pointer-events-none` justamente quando é preciso. */
                  <div
                     role="alert"
                     className="flex flex-wrap items-center justify-between gap-2 rounded border border-red-200 bg-red-50 px-4 py-2"
                  >
                     <span className="flex items-center gap-2 text-sm text-red-800">
                        <TbAlertTriangle aria-hidden className="h-4 w-4" />
                        Falha ao atualizar: os dados abaixo não são de {anoRef}.
                     </span>
                     <Button color="light" size="xs" onClick={() => refetch()}>
                        Tentar novamente
                     </Button>
                  </div>
               )}

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
                     onResetVisibility={onResetVisibility}
                     hasSelection={hasSelection}
                  />

                  {/* Grid content-sized: alturas fixas no chart e `max-h` na
                      lista do rail — nada de medir viewport/container (já
                      causou loop de crescimento infinito com o ResizeObserver
                      + ApexCharts). */}
                  <div className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1fr)_330px]">
                     <div className="min-w-0">
                        <HistoricoChart
                           ref={chartRef}
                           historico={data}
                           visibility={visibility}
                           carry={carry}
                           programColors={programColors}
                           onClearIsolated={onClearIsolated}
                           onResetVisibility={onResetVisibility}
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
            </>
         )}
      </div>
   );
}
