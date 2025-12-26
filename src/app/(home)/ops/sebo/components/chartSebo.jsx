import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { converterMinutosParaHoras } from "../utils";

const Chart = dynamic(() => import("react-apexcharts"), {
   ssr: false,
});

export default function ChartSebo({ categories, data, activeRow, trips }) {
   const [media, setMedia] = useState(0);
   const [showStats, setShowStats] = useState(true);

   function setBarColour({ dataPointIndex }) {
      if (dataPointIndex === activeRow) return "#3b82f6";
      return "#60a5fa";
   }

   const stats = useMemo(() => {
      if (!data || data.length === 0) return null;

      const soma = data.reduce((acc, curr) => acc + curr, 0);
      const media = soma / data.length;
      const max = Math.max(...data);
      const min = Math.min(...data);

      return {
         total: converterMinutosParaHoras(soma),
         media: converterMinutosParaHoras(Math.round(media)),
         max: converterMinutosParaHoras(max),
         min: converterMinutosParaHoras(min),
         count: data.length,
      };
   }, [data]);

   useEffect(() => {
      if (data && data.length > 0) {
         const soma = data.reduce((accumulator, current) => {
            return accumulator + current;
         }, 0);
         setMedia(soma / data.length);
      }
   }, [data]);

   function customTooltip({ series, seriesIndex, dataPointIndex }) {
      const trip = trips?.[dataPointIndex];
      const hours = converterMinutosParaHoras(
         series[seriesIndex][dataPointIndex]
      );

      return `
         <div style="padding: 12px; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="font-weight: bold; color: #1f2937; margin-bottom: 4px;">${
               trip?.trig || categories[dataPointIndex]
            }</div>
            <div style="color: #3b82f6; font-weight: 600; font-size: 16px; margin-bottom: 4px;">${hours}</div>
            ${
               trip?.nomeGuerra
                  ? `<div style="color: #6b7280; font-size: 12px;">${trip.nomeGuerra}</div>`
                  : ""
            }
            ${
               trip?.oper
                  ? `<div style="margin-top: 4px;"><span style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500;">${trip.oper}</span></div>`
                  : ""
            }
         </div>
      `;
   }

   return (
      <div className="space-y-4">
         {/* Statistics Cards */}
         {showStats && stats && (
            <div className="mb-4 grid grid-cols-3 gap-3">
               <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 p-3">
                  <div className="text-xs font-medium text-orange-600">
                     Mínimo
                  </div>
                  <div className="text-lg font-bold text-orange-900">
                     {stats.min}
                  </div>
               </div>
               <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-3">
                  <div className="text-xs font-medium text-green-600">
                     Média
                  </div>
                  <div className="text-lg font-bold text-green-900">
                     {stats.media}
                  </div>
               </div>
               <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-3">
                  <div className="text-xs font-medium text-purple-600">
                     Máximo
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
               options={{
                  chart: {
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
                        easing: "easeinout",
                        speed: 800,
                     },
                  },
                  colors: [setBarColour],
                  dataLabels: {
                     enabled: false,
                  },
                  yaxis: {
                     labels: {
                        formatter: converterMinutosParaHoras,
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
                     theme: "light",
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
                              text: `Média: ${converterMinutosParaHoras(
                                 Math.round(media)
                              )}`,
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
                  plotOptions: {
                     bar: {
                        borderRadius: 6,
                        columnWidth: "70%",
                        dataLabels: {
                           position: "top",
                        },
                     },
                  },
                  grid: {
                     borderColor: "#e5e7eb",
                     strokeDashArray: 3,
                  },
               }}
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
               <div className="h-3 w-3 rounded bg-blue-400"></div>
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
