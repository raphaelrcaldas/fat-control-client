"use client";

import { useMemo, useRef, useState } from "react";
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
import { ExtratoModal } from "./components/ExtratoModal";
import type { HistPrograma } from "services/routes/estatistica/esfAer";

const EMPTY_PROGRAMAS: HistPrograma[] = [];

// Altura explícita só a partir de `lg` — mesma régua de `relatorios-voo` e
// `ops/indisp`: o pai (`PageTransition`) só tem `min-h-full`, então sem isto o
// gráfico e o rail não teriam de onde herdar altura. É a altura da JANELA, não
// do conteúdo — por isso o gráfico pode crescer sem o loop do ApexCharts (ver
// `HistoricoChart`). Abaixo de `lg` volta ao fluxo natural, com alturas fixas.
// O `min-h` segura um piso em janela baixa: abaixo dele a página rola.
const ALTURA_PAGINA =
   "flex min-h-0 flex-col space-y-2 lg:h-[calc(100dvh-5rem)] lg:min-h-[600px] lg:overflow-hidden";

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

   // Programas no gráfico, na ordem da resposta — a mesma regra de
   // `useHistoricoSeries`: no modo isolado só o isolado, senão os marcados.
   const selecionados = useMemo(
      () =>
         programas.filter((p) =>
            visibility.isolated !== null
               ? p.esfaer_id === visibility.isolated
               : visibility.toggled[p.esfaer_id] === true
         ),
      [programas, visibility.isolated, visibility.toggled]
   );
   const [extratoAberto, setExtratoAberto] = useState(false);

   const chartRef = useRef<HistoricoChartHandle>(null);
   const onResetZoom = () => chartRef.current?.resetZoom();

   return (
      <div className={ALTURA_PAGINA}>
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

               {/* Em `lg` o grid ocupa o resto da altura da página e a linha
                   única (`minmax(0,1fr)`) estica os dois cards até a mesma
                   base. Abaixo de `lg`, content-sized com alturas fixas. */}
               <div
                  className={clsx(
                     "grid grid-cols-1 gap-2 transition-opacity duration-200 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_330px] lg:grid-rows-[minmax(0,1fr)]",
                     isRefetching && "pointer-events-none opacity-50"
                  )}
               >
                  <div className="min-w-0 lg:min-h-0">
                     <HistoricoChart
                        ref={chartRef}
                        toolbar={
                           <HistoricoToolbar
                              totalVisible={visibility.totalVisible}
                              onToggleTotal={onToggleTotal}
                              grupos={carry.grupos}
                              groups={visibility.groups}
                              onToggleGroup={onToggleGroup}
                              onResetZoom={onResetZoom}
                              onResetVisibility={onResetVisibility}
                              hasSelection={hasSelection}
                              extratoCount={selecionados.length}
                              onOpenExtrato={() => setExtratoAberto(true)}
                           />
                        }
                        historico={data}
                        visibility={visibility}
                        carry={carry}
                        programColors={programColors}
                        onClearIsolated={onClearIsolated}
                        onResetVisibility={onResetVisibility}
                     />
                  </div>

                  <div className="min-w-0 lg:min-h-0">
                     <ProgramRail
                        programas={programas}
                        grupos={carry.grupos}
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

               <ExtratoModal
                  show={extratoAberto}
                  onClose={() => setExtratoAberto(false)}
                  anoRef={data.ano_ref}
                  programas={selecionados}
                  programColors={programColors}
               />
            </>
         )}
      </div>
   );
}
