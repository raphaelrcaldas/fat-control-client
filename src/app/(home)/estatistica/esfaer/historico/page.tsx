"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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

/** Piso da altura do grid quando a viewport é muito baixa. */
const MIN_GRID_HEIGHT = 360;
/** Respiro na base (padding do <main> + folga) descontado da altura medida. */
const BOTTOM_GAP = 12;

/**
 * `useLayoutEffect` no cliente (aplica a altura ANTES do paint, sem flash) e
 * `useEffect` no SSR (evita o warning do React em pré-render).
 */
const useIsoLayoutEffect =
   typeof document !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Top acumulado do elemento em coordenadas de LAYOUT (soma de `offsetTop` pela
 * cadeia de `offsetParent`). É imune a `transform` — ao contrário de
 * `getBoundingClientRect().top` —, então mede certo mesmo durante a transição
 * de entrada da página (`translate-y`), sem oscilar.
 */
function layoutTop(el: HTMLElement | null): number {
   let top = 0;
   for (let n = el; n; n = n.offsetParent as HTMLElement | null) {
      top += n.offsetTop;
   }
   return top;
}

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

   // Altura EXPLÍCITA do grid (px), medida a partir do <main> (o scroll
   // container). Altura explícita — e não flex-fill — porque o `PageTransition`
   // é `min-h-full` (só piso, sem teto): com flex-fill o chart mediria o
   // container, cresceria o conteúdo, o container cresceria junto → loop
   // infinito. Com px fixo não há realimentação. A medição usa `layoutTop`
   // (imune ao transform de entrada), então é idempotente e não pisca.
   const gridRef = useRef<HTMLDivElement>(null);
   const [gridHeight, setGridHeight] = useState<number | undefined>(undefined);

   useIsoLayoutEffect(() => {
      const measure = () => {
         const grid = gridRef.current;
         const isLg = window.matchMedia("(min-width: 1024px)").matches;
         const main = grid?.closest("main");
         if (!grid || !isLg || !main) {
            setGridHeight(undefined);
            return;
         }
         const gridWithinMain =
            layoutTop(grid) - layoutTop(main as HTMLElement);
         const avail = main.clientHeight - gridWithinMain - BOTTOM_GAP;
         setGridHeight(Math.max(MIN_GRID_HEIGHT, Math.floor(avail)));
      };
      measure();
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
      // Re-mede quando o nº de programas muda (altura do header/toolbar estável,
      // mas garante recálculo se o layout acima do grid variar).
   }, [programas.length]);

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

               <div
                  ref={gridRef}
                  style={gridHeight ? { height: gridHeight } : undefined}
                  className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1fr)_330px] lg:grid-rows-1 lg:overflow-hidden"
               >
                  <div className="min-w-0 lg:min-h-0">
                     <HistoricoChart
                        ref={chartRef}
                        historico={data}
                        visibility={visibility}
                        carry={carry}
                        programColors={programColors}
                     />
                  </div>

                  <div className="min-w-0 lg:min-h-0">
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
