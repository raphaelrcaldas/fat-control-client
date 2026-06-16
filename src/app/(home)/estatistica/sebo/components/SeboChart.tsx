"use client";
import { useCallback, useMemo, useState } from "react";
import { Label } from "flowbite-react";
import Chart from "react-apexcharts";
import { minutesToTime } from "@/../utils/dateHandler";
import type { SeboTripItem } from "services/routes/estatistica/sebo";
import { computeSeboStats, renderSeboTooltip } from "../utils";
import { SeboStatCards } from "./SeboStatCards";

interface SeboChartProps {
   trips: SeboTripItem[];
   activeRow: number;
}

const COLOR_DEFAULT = "#cbd5e1"; // slate-300
const COLOR_ACTIVE = "#dc2626"; // red-600
const COLOR_AXIS = "#64748b"; // slate-500

export default function SeboChart({ trips, activeRow }: SeboChartProps) {
   // Margem (%) da zona de tolerância em torno da média — ajustável pelo usuário.
   const [margin, setMargin] = useState(25);

   const data = useMemo(() => trips.map((t) => t.voo.h_ano), [trips]);
   const categories = useMemo(
      () => trips.map((t) => t.trig.toUpperCase()),
      [trips]
   );

   const barColors = useMemo(
      () =>
         data.map((_, i) => (i === activeRow ? COLOR_ACTIVE : COLOR_DEFAULT)),
      [data, activeRow]
   );

   const stats = useMemo(() => computeSeboStats(data), [data]);
   const media = stats?.mediaRaw ?? 0;

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
            minutesToTime(series[seriesIndex][dataPointIndex])
         ),
      [trips, categories]
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
            labels: {
               formatter: minutesToTime,
               style: { colors: COLOR_AXIS, fontSize: "11px", fontWeight: 500 },
            },
         },
         xaxis: {
            categories,
            labels: {
               rotate: -45,
               style: { colors: COLOR_AXIS, fontSize: "10px", fontWeight: 500 },
            },
         },
         tooltip: { custom: customTooltip, theme: "light" as const },
         annotations: {
            yaxis: [
               {
                  y: media,
                  borderColor: COLOR_ACTIVE,
                  strokeDashArray: 4,
                  label: {
                     borderColor: COLOR_ACTIVE,
                     style: {
                        color: "#fff",
                        background: COLOR_ACTIVE,
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
      [barColors, categories, customTooltip, media, margin]
   );

   return (
      <div className="space-y-4">
         {stats && <SeboStatCards stats={stats} />}

         {/* Controle da zona de tolerância */}
         <div className="flex items-center gap-3 text-sm">
            <Label
               htmlFor="sebo-margin"
               className="font-medium whitespace-nowrap text-slate-700"
            >
               Zona de tolerância
            </Label>
            <input
               id="sebo-margin"
               type="range"
               min={0}
               max={100}
               step={5}
               value={margin}
               onChange={(e) => setMargin(Number(e.target.value))}
               className="sebo-range flex-1"
               style={{
                  background: `linear-gradient(to right, #dc2626 ${margin}%, #e2e8f0 ${margin}%)`,
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
               <div className="h-3 w-3 rounded bg-red-600" />
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
