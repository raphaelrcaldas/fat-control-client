"use client";

import { useMemo } from "react";
import Chart from "react-apexcharts";
import { minutesToTime } from "@/../utils/dateHandler";
import { MONTH_LABELS } from "../constants";
import { useEsfAerMonthly } from "../hooks/useEsfAerMonthly";

interface EsfAerChartLineProps {
   totalAlocado: number;
   totalMeses: number[];
}

export function EsfAerChartLine({
   totalAlocado,
   totalMeses,
}: EsfAerChartLineProps) {
   const { rows, voadoMax } = useEsfAerMonthly(totalAlocado, totalMeses);

   const chartSeries = useMemo(
      () => [
         {
            name: "PLANEJADO",
            type: "line",
            data: rows.map((r) => r.planejado),
         },
         {
            name: "ACUMULADO",
            type: "line",
            data: rows.map((r) => r.acumulado),
         },
         { name: "VOADO", type: "bar", data: rows.map((r) => r.voado) },
      ],
      [rows]
   );

   const chartOptions: ApexCharts.ApexOptions = useMemo(
      () => ({
         chart: {
            type: "line",
            toolbar: {
               show: true,
               tools: {
                  download: true,
                  selection: true,
                  zoom: true,
                  zoomin: true,
                  zoomout: true,
                  pan: true,
                  reset: true,
               },
               export: {
                  csv: { filename: "esforco-aereo" },
                  svg: { filename: "esforco-aereo" },
                  png: { filename: "esforco-aereo" },
               },
            },
            fontFamily: "Inter, sans-serif",
         },
         stroke: {
            width: [2, 2, 0],
            dashArray: [6, 0, 0],
         },
         plotOptions: {
            bar: {
               columnWidth: "50%",
               borderRadius: 3,
            },
         },
         colors: ["#3B82F6", "#F97316", "#111827"],
         xaxis: {
            categories: MONTH_LABELS.map((l) => l.toLowerCase()),
         },
         yaxis: [
            {
               seriesName: "PLANEJADO",
               min: 0,
               max: Math.round(totalAlocado * 1.1),
               tickAmount: 6,
               title: { text: "Acumulado / Planejado" },
               labels: {
                  formatter: (val: number) => minutesToTime(Math.round(val)),
               },
            },
            {
               seriesName: "PLANEJADO",
               show: false,
            },
            {
               seriesName: "VOADO",
               opposite: true,
               min: 0,
               max: Math.round(voadoMax * 3),
               tickAmount: 6,
               title: { text: "Voado (mensal)" },
               labels: {
                  formatter: (val: number) => minutesToTime(Math.round(val)),
               },
            },
         ],
         tooltip: {
            y: {
               formatter: (val: number) => minutesToTime(Math.round(val)),
            },
         },
         legend: {
            position: "top",
            fontSize: "11px",
         },
         grid: {
            borderColor: "#E5E7EB",
         },
      }),
      [totalAlocado, voadoMax]
   );

   return (
      <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
         <Chart
            options={chartOptions}
            series={chartSeries}
            type="line"
            height={320}
         />
      </div>
   );
}
