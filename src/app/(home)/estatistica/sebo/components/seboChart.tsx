"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { minutesToTime } from "@/../utils/dateHandler";
import type { SeboTripItem } from "services/routes/estatistica/sebo";

const Chart = dynamic(() => import("react-apexcharts"), {
   ssr: false,
});

interface SeboChartProps {
   data: number[];
   categories: string[];
   activeRow: number;
   trips: SeboTripItem[];
}

const COLOR_DEFAULT = "#93c5fd";
const COLOR_ACTIVE = "#2563eb";

export default function SeboChart({
   categories,
   data,
   activeRow,
   trips,
}: SeboChartProps) {
   const [media, setMedia] = useState(0);

   const barColors = useMemo(
      () =>
         data.map((_, i) => (i === activeRow ? COLOR_ACTIVE : COLOR_DEFAULT)),
      [data, activeRow]
   );

   const stats = useMemo(() => {
      if (!data || data.length === 0) return null;

      const soma = data.reduce((acc, curr) => acc + curr, 0);
      const avg = soma / data.length;
      const max = Math.max(...data);
      const min = Math.min(...data);

      return {
         total: minutesToTime(soma),
         media: minutesToTime(Math.round(avg)),
         max: minutesToTime(max),
         min: minutesToTime(min),
         count: data.length,
      };
   }, [data]);

   useEffect(() => {
      if (data && data.length > 0) {
         const soma = data.reduce((acc, curr) => acc + curr, 0);
         setMedia(soma / data.length);
      }
   }, [data]);

   const customTooltip = useCallback(
      ({
         series,
         seriesIndex,
         dataPointIndex,
      }: {
         series: number[][];
         seriesIndex: number;
         dataPointIndex: number;
      }) => {
         const trip = trips?.[dataPointIndex];
         const hours = minutesToTime(series[seriesIndex][dataPointIndex]);

         return `
         <div style="padding: 12px; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="font-weight: bold; color: #1f2937; margin-bottom: 4px;">${
               trip?.trig.toUpperCase() || categories[dataPointIndex]
            }</div>
            <div style="color: #3b82f6; font-weight: 600; font-size: 16px; margin-bottom: 4px;">${hours}</div>
            ${
               trip?.nome_guerra
                  ? `<div style="color: #6b7280; font-size: 12px;">${trip.nome_guerra}</div>`
                  : ""
            }
            ${
               trip?.oper
                  ? `<div style="margin-top: 4px;"><span style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500;">${trip.oper.toUpperCase()}</span></div>`
                  : ""
            }
         </div>
      `;
      },
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
               speed: 800,
               dynamicAnimation: {
                  enabled: true,
                  speed: 150,
               },
            },
         },
         colors: barColors,
         plotOptions: {
            bar: {
               distributed: true,
               borderRadius: 6,
               columnWidth: "70%",
            },
         },
         legend: {
            show: false,
         },
         dataLabels: {
            enabled: false,
         },
         yaxis: {
            labels: {
               formatter: minutesToTime,
               style: {
                  colors: "#6b7280",
                  fontSize: "11px",
                  fontWeight: 500,
               },
            },
         },
         xaxis: {
            categories: categories,
            labels: {
               rotate: -45,
               style: {
                  colors: "#6b7280",
                  fontSize: "10px",
                  fontWeight: 500,
               },
            },
         },
         tooltip: {
            custom: customTooltip,
            theme: "light" as const,
         },
         annotations: {
            yaxis: [
               {
                  y: media,
                  borderColor: "#ef4444",
                  strokeDashArray: 4,
                  label: {
                     borderColor: "#ef4444",
                     style: {
                        color: "#fff",
                        background: "#ef4444",
                        fontSize: "11px",
                        fontWeight: 600,
                     },
                     text: `Media: ${minutesToTime(Math.round(media))}`,
                  },
               },
               {
                  y: media + (25 * media) / 100,
                  y2: media - (25 * media) / 100,
                  fillColor: "#fbbf24",
                  opacity: 0.2,
                  label: {
                     text: "±25%",
                     style: {
                        color: "#92400e",
                        background: "#fef3c7",
                        fontSize: "10px",
                     },
                  },
               },
            ],
         },
         grid: {
            borderColor: "#e5e7eb",
            strokeDashArray: 3,
         },
      }),
      [barColors, categories, customTooltip, media]
   );

   return (
      <div className="space-y-4">
         {/* Statistics Cards */}
         {stats && (
            <div className="mb-4 grid grid-cols-3 gap-3">
               <div className="rounded-lg bg-linear-to-br from-orange-50 to-orange-100 p-3">
                  <div className="text-xs font-medium text-orange-600">
                     Minimo
                  </div>
                  <div className="text-lg font-bold text-orange-900">
                     {stats.min}
                  </div>
               </div>
               <div className="rounded-lg bg-linear-to-br from-green-50 to-green-100 p-3">
                  <div className="text-xs font-medium text-green-600">
                     Media
                  </div>
                  <div className="text-lg font-bold text-green-900">
                     {stats.media}
                  </div>
               </div>
               <div className="rounded-lg bg-linear-to-br from-purple-50 to-purple-100 p-3">
                  <div className="text-xs font-medium text-purple-600">
                     Maximo
                  </div>
                  <div className="text-lg font-bold text-purple-900">
                     {stats.max}
                  </div>
               </div>
            </div>
         )}

         {/* Chart */}
         <div className="relative">
            <Chart
               options={options}
               series={[
                  {
                     name: "Horas de Voo",
                     data: data,
                  },
               ]}
               type="bar"
               width="100%"
               height="380"
            />
         </div>

         {/* Legend */}
         <div className="flex items-center justify-center gap-4 border-t border-gray-200 pt-2 text-xs text-gray-600">
            <div className="flex items-center gap-2">
               <div className="h-3 w-3 rounded bg-blue-300"></div>
               <span>Horas de Voo</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="h-3 w-3 rounded bg-blue-600"></div>
               <span>Selecionado</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="h-3 w-3 rounded border border-yellow-400 bg-yellow-100"></div>
               <span>Zona ±25%</span>
            </div>
         </div>
      </div>
   );
}
