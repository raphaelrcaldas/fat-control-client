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
 * - Alturas FIXAS (main + brush). Não derivar a altura do container: o
 *   ApexCharts aplica `minHeight = altura + parentHeightOffset` (15px) no div
 *   externo, então medir o container content-sized e realimentar a altura do
 *   chart cresce ~30px por ciclo do ResizeObserver — loop infinito no mobile.
 * - Brush SEMPRE plota o Total do backend, independente da visibilidade — é
 *   contexto de navegação, não uma série toggleável.
 * - Único ponto imperativo: `resetZoom()` exposto via ref (a toolbar chama).
 */

import { useImperativeHandle, useMemo, type Ref } from "react";
import Chart from "react-apexcharts";
import ApexChartsLib from "apexcharts";
import { minutesToTime } from "@/../utils/dateHandler";
import { TOTAL_COLOR } from "../constants";
import { epochOf, toApexData, type ApexSeries } from "../utils";
import {
   useHistoricoSeries,
   type HistoricoVisibility,
} from "../hooks/useHistoricoSeries";
import type { CarryForward } from "../hooks/useCarryForward";
import type { EsfAerHistorico } from "services/routes/estatistica/esfAer";
import { buildTooltipHTML } from "./HistoricoTooltip";

/** id estável do chart principal (alvo do brush e do `exec`). */
const MAIN_ID = "hist-main";
const BRUSH_ID = "hist-brush";

const MAIN_HEIGHT = 330;
const BRUSH_HEIGHT = 78;

/** Handle imperativo exposto à toolbar (ex.: botão "Ver ano todo"). */
export interface HistoricoChartHandle {
   /** Volta o eixo X (chart + janela do brush) para o ano inteiro. */
   resetZoom: () => void;
}

export interface HistoricoChartProps {
   ref?: Ref<HistoricoChartHandle>;
   historico: EsfAerHistorico;
   visibility: HistoricoVisibility;
   /** Derivados compartilhados da página (mesma fonte do rail). */
   carry: CarryForward;
   programColors: Map<number, string>;
}

export function HistoricoChart({
   ref,
   historico,
   visibility,
   carry,
   programColors,
}: HistoricoChartProps) {
   const { series, colors, dashArray, widths, markerSizes, meta } =
      useHistoricoSeries(historico, visibility, carry, programColors);

   const anoRef = historico.ano_ref;

   // Escala temporal compartilhada entre chart principal e brush.
   const yearStart = useMemo(() => epochOf(`${anoRef}-01-01`), [anoRef]);
   const yearEnd = useMemo(() => epochOf(`${anoRef}-12-31`), [anoRef]);

   /** Data ISO da última atualização do ano (último ponto real do Total). */
   const lastUpdateData = useMemo(() => {
      const pts = historico.total.timeline;
      return pts.length ? pts[pts.length - 1].data : `${anoRef}-01-01`;
   }, [historico, anoRef]);

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

   // Teto do eixo Y derivado das séries visíveis (com folga de 10%).
   const yMax = useMemo(() => {
      let max = 0;
      for (const s of series) {
         for (const p of s.data) if (p.y > max) max = p.y;
      }
      return max > 0 ? Math.round(max * 1.1) : 60;
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
            ApexChartsLib.exec(MAIN_ID, "zoomX", yearStart, domainMax);
            // O zoomX no principal não move a janela do brush — sincroniza.
            ApexChartsLib.exec(BRUSH_ID, "updateOptions", {
               chart: {
                  selection: { xaxis: { min: yearStart, max: domainMax } },
               },
            });
         },
      }),
      [yearStart, domainMax]
   );

   const options = useMemo<ApexCharts.ApexOptions>(
      () => ({
         chart: {
            id: MAIN_ID,
            type: "line",
            fontFamily: "Inter, sans-serif",
            animations: { enabled: false },
            toolbar: { show: false },
            zoom: { enabled: true, type: "x", autoScaleYaxis: true },
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
            min: yearStart,
            max: domainMax,
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
            max: yMax,
            tickAmount: 5,
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
      }),
      [
         series,
         colors,
         dashArray,
         widths,
         markerSizes,
         meta,
         yearStart,
         domainMax,
         yMax,
      ]
   );

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

   const isolatedNome =
      visibility.isolated != null
         ? historico.programas.find((p) => p.esfaer_id === visibility.isolated)
              ?.nome
         : null;

   const hasSeries = series.length > 0;

   return (
      <div className="flex h-full flex-col rounded border border-slate-200 bg-white p-4 shadow-sm">
         <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
               Total da unidade · carry-forward
            </h2>
            {isolatedNome && (
               <span className="inline-flex items-center gap-1 rounded border border-red-100 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                  isolado: {isolatedNome}
               </span>
            )}
         </div>

         <div>
            {hasSeries ? (
               <>
                  <Chart
                     options={options}
                     series={series}
                     type="line"
                     height={MAIN_HEIGHT}
                  />
                  <Chart
                     options={brushOptions}
                     series={brushSeries}
                     type="area"
                     height={BRUSH_HEIGHT}
                  />
               </>
            ) : (
               <div
                  className="flex items-center justify-center text-sm text-slate-400"
                  style={{ height: MAIN_HEIGHT + BRUSH_HEIGHT }}
               >
                  Nenhuma série visível — ative o Total, um grupo ou um
                  programa.
               </div>
            )}
         </div>
      </div>
   );
}
