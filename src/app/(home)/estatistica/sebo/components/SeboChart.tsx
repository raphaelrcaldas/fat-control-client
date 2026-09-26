"use client";
import { useCallback, useMemo, useState, type CSSProperties } from "react";
import { Label, RangeSlider } from "flowbite-react";
import Chart from "react-apexcharts";
import { minutesToTime } from "@/../utils/dateHandler";
import type { SeboTripItem } from "services/routes/estatistica/sebo";
import { renderSeboTooltip } from "../utils";
import { SeboStatCards } from "./SeboStatCards";
import type { SeboStats } from "../types";
import { useChartColor } from "../hooks/useChartColor";
import styles from "./SeboChart.module.css";

interface SeboChartProps {
   trips: SeboTripItem[];
   activeRow: number;
   isPilot: boolean;
   stats: SeboStats;
}

const COLOR_DEFAULT = "#cbd5e1"; // slate-300
const COLOR_AXIS = "#64748b"; // slate-500

export default function SeboChart({
   trips,
   activeRow,
   isPilot,
   stats,
}: SeboChartProps) {
   // Margem (%) da zona de tolerância em torno da média — ajustável pelo usuário.
   const [margin, setMargin] = useState(25);
   const activeColor = useChartColor();

   const data = useMemo(() => trips.map((t) => t.voo.h_ano), [trips]);
   const categories = useMemo(
      () => trips.map((t) => t.trig.toUpperCase()),
      [trips]
   );

   const barColors = useMemo(
      () => data.map((_, i) => (i === activeRow ? activeColor : COLOR_DEFAULT)),
      [data, activeRow, activeColor]
   );

   const media = stats.mediaRaw;

   // Eixo em horas cheias: o Apex divide o intervalo em minutos e rotulava
   // 16:40, 33:20... Passo "redondo" que rende até 6 marcas, cobrindo também
   // o topo da zona de tolerância.
   const yAxis = useMemo(() => {
      const topo = Math.max(...data, media * (1 + margin / 100), 60);
      const horas = topo / 60;
      const passoHoras =
         [1, 2, 5, 10, 20, 25, 50, 100].find((p) => horas / p <= 6) ?? 200;
      const passo = passoHoras * 60;
      return { max: Math.ceil(topo / passo) * passo, stepSize: passo };
   }, [data, media, margin]);

   const customTooltip = useCallback(
      ({
         series,
         seriesIndex,
         dataPointIndex,
      }: {
         series: number[][];
         seriesIndex: number;
         dataPointIndex: number;
      }) =>
         renderSeboTooltip(
            trips[dataPointIndex],
            categories[dataPointIndex],
            minutesToTime(series[seriesIndex][dataPointIndex]),
            isPilot
         ),
      [trips, categories, isPilot]
   );

   const options = useMemo(
      () => ({
         chart: {
            id: "sebo-chart",
            toolbar: {
               show: true,
               tools: {
                  download: true,
                  zoom: true,
                  zoomin: true,
                  zoomout: true,
                  pan: false,
                  reset: true,
               },
            },
            animations: {
               enabled: true,
               speed: 300,
               dynamicAnimation: { enabled: true, speed: 150 },
            },
         },
         colors: barColors,
         plotOptions: {
            bar: { distributed: true, borderRadius: 6, columnWidth: "70%" },
         },
         legend: { show: false },
         dataLabels: { enabled: false },
         yaxis: {
            min: 0,
            max: yAxis.max,
            stepSize: yAxis.stepSize,
            labels: {
               formatter: (value: number) => minutesToTime(Math.round(value)),
               style: { colors: COLOR_AXIS, fontSize: "11px", fontWeight: 500 },
            },
         },
         xaxis: {
            categories,
            labels: {
               rotate: -45,
               // Trigrama girado ocupa ~30px; o default (120px) deixava um vão
               // branco entre o eixo e a legenda.
               maxHeight: 40,
               style: { colors: COLOR_AXIS, fontSize: "10px", fontWeight: 500 },
            },
         },
         tooltip: { custom: customTooltip, theme: "light" as const },
         annotations: {
            yaxis: [
               {
                  y: media,
                  borderColor: activeColor,
                  strokeDashArray: 4,
                  label: {
                     borderColor: activeColor,
                     style: {
                        color: "#fff",
                        background: activeColor,
                        fontSize: "11px",
                        fontWeight: 600,
                     },
                     text: `Média: ${minutesToTime(Math.round(media))}`,
                  },
               },
               {
                  y: media + (margin * media) / 100,
                  y2: media - (margin * media) / 100,
                  fillColor: "#fbbf24",
                  opacity: 0.2,
                  label: {
                     text: `±${margin}%`,
                     style: {
                        color: "#92400e",
                        background: "#fef3c7",
                        fontSize: "10px",
                     },
                  },
               },
            ],
         },
         grid: { borderColor: "#e2e8f0", strokeDashArray: 3 },
      }),
      [barColors, categories, customTooltip, media, margin, activeColor, yAxis]
   );

   return (
      <div className="space-y-4">
         <SeboStatCards stats={stats} />

         {/* Controle da zona de tolerância */}
         <div className="flex items-center gap-3 text-sm">
            <Label
               htmlFor="sebo-margin"
               className="font-medium whitespace-nowrap text-slate-700"
            >
               Zona de tolerância
            </Label>
            <RangeSlider
               id="sebo-margin"
               min={0}
               max={100}
               step={5}
               value={margin}
               onChange={(e) => setMargin(Number(e.target.value))}
               className="flex-1"
               aria-valuetext={`Mais ou menos ${margin}%`}
               style={{ "--sebo-progress": `${margin}%` } as CSSProperties}
               clearTheme={{ field: { input: { base: true } } }}
               theme={{
                  field: {
                     input: {
                        base: styles.slider,
                     },
                  },
               }}
            />
            <span className="w-12 text-right font-semibold text-slate-900 tabular-nums">
               ±{margin}%
            </span>
         </div>

         <Chart
            options={options}
            series={[{ name: "Horas de Voo", data }]}
            type="bar"
            width="100%"
            height="380"
         />

         {/* Legenda */}
         <div className="flex items-center justify-center gap-4 border-t border-slate-200 pt-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
               <div className="h-3 w-3 rounded bg-slate-300" />
               <span>Horas de Voo</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="bg-primary-600 h-3 w-3 rounded" />
               <span>Selecionado</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="h-3 w-3 rounded border border-yellow-400 bg-yellow-100" />
               <span>Zona ±{margin}%</span>
            </div>
         </div>
      </div>
   );
}
