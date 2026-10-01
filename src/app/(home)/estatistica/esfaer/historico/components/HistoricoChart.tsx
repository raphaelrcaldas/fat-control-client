"use client";

/**
 * Gráfico da view "Histórico de Esforço Aéreo".
 *
 * Renderiza, em ApexCharts (line chart com markers), a evolução das horas
 * alocadas ao longo do ano: Total da unidade, Σ por grupo e cada programa.
 * Abaixo, um chart de brush (~78px) sincronizado nativamente para dar zoom no
 * recorte temporal.
 *
 * Princípios (ver plano):
 * - Visibilidade/cores 100% DECLARATIVAS — vêm de `useHistoricoSeries` em
 *   lockstep posicional (series[i] ↔ colors[i] ↔ dashArray[i] ↔ meta[i]).
 *   Nada de `showSeries/hideSeries` imperativo.
 * - Altura do principal em `%` do wrapper, e o wrapper tem altura dada pelo
 *   LAYOUT, nunca pelo conteúdo: fixa (330px) abaixo de `lg`; em `lg`, o resto
 *   do card numa página presa à altura da janela. Com altura em `%` o Apex não
 *   aplica o `minHeight = altura + parentHeightOffset` no div externo — era ele
 *   que, com a altura medida de um container content-sized, crescia ~30px por
 *   ciclo do ResizeObserver (loop infinito no mobile). O brush segue fixo.
 * - Brush SEMPRE plota o Total do backend, independente da visibilidade — é
 *   contexto de navegação, não uma série toggleável.
 * - Pontos imperativos: `resetZoom()` exposto via ref (a toolbar chama) e
 *   `events.mounted/updated`, que consultam `getState()` para alimentar o ref
 *   do recorte temporal.
 */

import {
   useImperativeHandle,
   useMemo,
   useRef,
   type ReactNode,
   type Ref,
} from "react";
import Chart from "react-apexcharts";
import ApexChartsLib from "apexcharts";
import { Button } from "flowbite-react";
import { minutesToTime } from "@/../utils/dateHandler";
import { TOTAL_COLOR } from "../constants";
import {
   deriveEndData,
   epochOf,
   escalaY,
   toApexData,
   type ApexSeries,
} from "../utils";
import { useHistoricoSeries } from "../hooks/useHistoricoSeries";
import type { HistoricoVisibility } from "../hooks/useHistoricoVisibility";
import { useChartReadouts } from "../hooks/useChartReadouts";
import type { CarryForward } from "../hooks/useCarryForward";
import type { EsfAerHistorico } from "services/routes/estatistica/esfAer";
import { buildTooltipHTML } from "./HistoricoTooltip";
import { ChartHeader } from "./ChartHeader";

/** id estável do chart principal (alvo do brush e do `exec`). */
const MAIN_ID = "hist-main";
const BRUSH_ID = "hist-brush";

const BRUSH_HEIGHT = 78;

/**
 * Wrapper do gráfico principal: a altura vem daqui (o Apex usa `height="100%"`
 * do pai) — 330px abaixo de `lg`; em `lg`, o resto do card. `overflow-hidden`
 * + `min-h-0` garantem que o conteúdo nunca empurre o wrapper — é o que mantém
 * o `%` longe do loop de realimentação. O vazio sem séries (`h-[423px]`) cobre
 * o principal + o brush (78px + os 15px de respiro que o Apex soma a ele).
 */
const MAIN_WRAPPER = "h-[330px] overflow-hidden lg:h-auto lg:min-h-0 lg:flex-1";

/** Handle imperativo exposto à toolbar (ex.: botão "Ver ano todo"). */
export interface HistoricoChartHandle {
   /** Volta o eixo X (chart + janela do brush) para o ano inteiro. */
   resetZoom: () => void;
}

export interface HistoricoChartProps {
   ref?: Ref<HistoricoChartHandle>;
   /** Controles das séries (Total/Σ grupos/zoom), no topo do card. */
   toolbar: ReactNode;
   historico: EsfAerHistorico;
   visibility: HistoricoVisibility;
   /** Derivados compartilhados da página (mesma fonte do rail). */
   carry: CarryForward;
   programColors: Map<number, string>;
   /** Sai do isolamento (badge dispensável do cabeçalho). */
   onClearIsolated: () => void;
   /** Devolve o default da tela (só o Total) — saída do estado vazio. */
   onResetVisibility: () => void;
}

export function HistoricoChart({
   ref,
   toolbar,
   historico,
   visibility,
   carry,
   programColors,
   onClearIsolated,
   onResetVisibility,
}: HistoricoChartProps) {
   const { series, colors, dashArray, widths, markerSizes, meta } =
      useHistoricoSeries(historico, visibility, carry, programColors);

   const anoRef = historico.ano_ref;

   // Escala temporal compartilhada entre chart principal e brush.
   const yearStart = useMemo(() => epochOf(`${anoRef}-01-01`), [anoRef]);
   const yearEnd = useMemo(() => epochOf(`${anoRef}-12-31`), [anoRef]);

   /**
    * Data ISO da última mudança conhecida no ano — mesma fonte das séries
    * (`useHistoricoSeries`), para o degrau final e o eixo não divergirem.
    */
   const lastUpdateData = useMemo(() => deriveEndData(historico), [historico]);

   /**
    * Fim do domínio do eixo X: a última atualização + ~5 dias de respiro (p/ o
    * último ponto não colar na borda). NÃO vai até 31/dez — o resto do ano não
    * tem lançamentos. Piso em 15/fev p/ o domínio não degenerar quando só há
    * mudanças de janeiro; nunca ultrapassa o fim do ano.
    */
   const domainMax = useMemo(() => {
      const respiro = 5 * 864e5; // ~5 dias em ms
      return Math.min(
         yearEnd,
         Math.max(epochOf(lastUpdateData) + respiro, epochOf(`${anoRef}-02-15`))
      );
   }, [anoRef, yearEnd, lastUpdateData]);

   /** Recorte default do brush: o domínio inteiro (início do ano → domainMax). */
   const brushDefault = useMemo(
      () => ({ min: yearStart, max: domainMax }),
      [yearStart, domainMax]
   );

   // Guarda o recorte aplicado pelo Apex, incluindo brush, zoom e pan. O evento
   // `updated` observa todos sem substituir os handlers nativos do brush.
   // Um novo ano/domínio volta ao default, pois o brush também o faz.
   const rangeRef = useRef<{
      anoRef: number;
      domainMax: number;
      min: number;
      max: number;
   } | null>(null);

   // Escala do eixo Y derivada das séries visíveis, em passos redondos.
   const yEscala = useMemo(() => {
      let max = 0;
      for (const s of series) {
         for (const p of s.data) if (p.y > max) max = p.y;
      }
      return escalaY(max);
   }, [series]);

   /**
    * Teto do brush fixado no máximo do TOTAL (independe de visibilidade): as
    * `brushOptions` não mudam com toggles — um `updateOptions` no brush
    * re-aplicaria a seleção default, descartando o recorte do usuário.
    */
   const brushYMax = useMemo(() => {
      let max = 0;
      for (const p of historico.total.timeline) {
         if (p.alocado > max) max = p.alocado;
      }
      return max > 0 ? Math.round(max * 1.1) : 60;
   }, [historico]);

   useImperativeHandle(
      ref,
      () => ({
         resetZoom: () => {
            rangeRef.current = {
               anoRef,
               domainMax,
               min: yearStart,
               max: domainMax,
            };
            ApexChartsLib.exec(MAIN_ID, "zoomX", yearStart, domainMax);
            // O zoomX no principal não move a janela do brush — sincroniza.
            ApexChartsLib.exec(BRUSH_ID, "updateOptions", {
               chart: {
                  selection: { xaxis: { min: yearStart, max: domainMax } },
               },
            });
         },
      }),
      [anoRef, yearStart, domainMax]
   );

   const options = useMemo<ApexCharts.ApexOptions>(() => {
      const range = rangeRef.current;
      const currentRange =
         range?.anoRef === anoRef && range.domainMax === domainMax
            ? range
            : brushDefault;
      const rememberRange = (chart: ApexChartsLib) => {
         const { minX, maxX } = chart.getState();
         if (Number.isFinite(minX) && Number.isFinite(maxX) && minX < maxX) {
            rangeRef.current = { anoRef, domainMax, min: minX, max: maxX };
         }
      };

      return {
         chart: {
            id: MAIN_ID,
            type: "line",
            // Altura em `%`: o respiro de 15px no topo não se aplica, e a
            // área útil é a do wrapper inteiro.
            parentHeightOffset: 0,
            fontFamily: "Inter, sans-serif",
            animations: { enabled: false },
            toolbar: { show: false },
            zoom: { enabled: true, type: "x", autoScaleYaxis: true },
            events: { mounted: rememberRange, updated: rememberRange },
         },
         colors,
         stroke: { curve: "straight", width: widths, dashArray },
         markers: {
            size: markerSizes,
            strokeWidth: 0,
            hover: { sizeOffset: 2 },
         },
         legend: { show: false },
         grid: { borderColor: "#e2e8f0", strokeDashArray: 4 },
         xaxis: {
            type: "datetime",
            min: currentRange.min,
            max: currentRange.max,
            axisBorder: { show: false },
            axisTicks: { color: "#e2e8f0" },
            labels: {
               style: { colors: "#64748b", fontSize: "11px" },
               datetimeUTC: true,
               // Formato explícito por escala: rótulo consistente ao dar zoom
               // pelo brush (mês "Jan" na visão ampla, "13 Jan" ao aproximar).
               datetimeFormatter: {
                  year: "yyyy",
                  month: "MMM",
                  day: "dd MMM",
                  hour: "HH:mm",
               },
            },
         },
         yaxis: {
            min: 0,
            max: yEscala.max,
            tickAmount: yEscala.divisoes,
            labels: {
               style: { colors: "#64748b", fontSize: "11px" },
               formatter: (v: number) => minutesToTime(Math.round(v)),
            },
         },
         tooltip: {
            shared: false,
            intersect: true,
            custom: ({ seriesIndex, dataPointIndex }) => {
               const name = series[seriesIndex]?.name;
               const m = meta[seriesIndex]?.[dataPointIndex];
               if (!name || !m) return "";
               return buildTooltipHTML(name, m);
            },
         },
      };
   }, [
      anoRef,
      brushDefault,
      series,
      colors,
      dashArray,
      widths,
      markerSizes,
      meta,
      yearStart,
      domainMax,
      yEscala,
   ]);

   // Brush plota o Total do backend, independente do toggle de visibilidade.
   const brushSeries = useMemo<ApexSeries[]>(
      () => [
         {
            name: "Total",
            data: toApexData(historico.total.timeline, lastUpdateData),
         },
      ],
      [historico, lastUpdateData]
   );

   const brushOptions = useMemo<ApexCharts.ApexOptions>(
      () => ({
         chart: {
            id: BRUSH_ID,
            type: "area",
            fontFamily: "Inter, sans-serif",
            animations: { enabled: false },
            toolbar: { show: false },
            brush: { enabled: true, target: MAIN_ID, autoScaleYaxis: true },
            selection: {
               enabled: true,
               xaxis: { min: brushDefault.min, max: brushDefault.max },
               fill: { color: "#0f172a", opacity: 0.08 },
               stroke: {
                  color: "#0f172a",
                  width: 1,
                  dashArray: 3,
                  opacity: 0.4,
               },
            },
         },
         colors: [TOTAL_COLOR],
         stroke: { curve: "straight", width: 1.5 },
         fill: {
            type: "gradient",
            gradient: { opacityFrom: 0.18, opacityTo: 0 },
         },
         legend: { show: false },
         grid: { show: false, padding: { top: 0, bottom: 0 } },
         xaxis: {
            type: "datetime",
            min: yearStart,
            max: domainMax,
            labels: { style: { colors: "#94a3b8", fontSize: "10px" } },
            axisBorder: { show: false },
            axisTicks: { show: false },
            tooltip: { enabled: false },
         },
         yaxis: {
            min: 0,
            max: brushYMax,
            labels: { show: false },
            tickAmount: 2,
         },
         tooltip: { enabled: false },
      }),
      [yearStart, domainMax, brushDefault, brushYMax]
   );

   const { readouts, excedente } = useChartReadouts(
      historico,
      visibility,
      carry,
      programColors
   );

   const isoladoNome =
      visibility.isolated != null
         ? (historico.programas.find((p) => p.esfaer_id === visibility.isolated)
              ?.nome ?? null)
         : null;

   const hasSeries = series.length > 0;

   return (
      <div className="flex flex-col gap-3 rounded border border-slate-200 bg-white p-4 shadow-sm lg:h-full">
         {toolbar}

         <ChartHeader
            readouts={readouts}
            excedente={excedente}
            isoladoNome={isoladoNome}
            onClearIsolated={onClearIsolated}
         />

         {hasSeries ? (
            <div className="flex flex-col lg:min-h-0 lg:flex-1">
               <div className={MAIN_WRAPPER}>
                  <Chart
                     options={options}
                     series={series}
                     type="line"
                     height="100%"
                  />
               </div>
               <div className="shrink-0">
                  <Chart
                     options={brushOptions}
                     series={brushSeries}
                     type="area"
                     height={BRUSH_HEIGHT}
                  />
               </div>
            </div>
         ) : (
            /* Beco sem saída se for só texto: o usuário precisa deduzir
                  onde clicar para recuperar o gráfico. O botão devolve o
                  default da tela em um clique. */
            <div className="flex h-[423px] flex-col items-center justify-center gap-3 text-sm text-slate-500 lg:h-auto lg:min-h-0 lg:flex-1">
               Nenhuma série visível — ative o Total, um grupo ou um programa.
               <Button color="light" size="xs" onClick={onResetVisibility}>
                  Mostrar o Total
               </Button>
            </div>
         )}
      </div>
   );
}
