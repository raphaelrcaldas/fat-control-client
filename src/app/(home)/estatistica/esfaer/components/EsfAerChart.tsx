"use client";

import { useMemo } from "react";
import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";
import dynamic from "next/dynamic";
import { minutesToTime } from "@/../utils/dateHandler";
import { MONTH_LABELS } from "../constants";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface EsfAerChartProps {
   totalAlocado: number;
   totalMeses: number[];
}

export function EsfAerChartLine({
   totalAlocado,
   totalMeses,
}: EsfAerChartProps) {
   const chartData = useMemo(() => {
      const monthlyPlan = totalAlocado / 12;
      const planned: number[] = [];
      const accumulated: (number | null)[] = [];
      const monthlyVoado: number[] = [];

      // Encontra o último mês com dados voados
      let lastFlownIndex = -1;
      for (let i = 11; i >= 0; i--) {
         if (totalMeses[i] > 0) {
            lastFlownIndex = i;
            break;
         }
      }

      let accum = 0;
      for (let i = 0; i < 12; i++) {
         planned.push(monthlyPlan * (i + 1));
         accum += totalMeses[i];
         accumulated.push(i <= lastFlownIndex ? accum : null);
         monthlyVoado.push(totalMeses[i]);
      }

      const voadoMax = Math.max(...monthlyVoado);

      return { planned, accumulated, monthlyVoado, voadoMax };
   }, [totalAlocado, totalMeses]);

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
               max: Math.round(chartData.voadoMax * 3),
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
      [chartData.voadoMax]
   );

   const chartSeries = useMemo(
      () => [
         { name: "PLANEJADO", type: "line", data: chartData.planned },
         { name: "ACUMULADO", type: "line", data: chartData.accumulated },
         { name: "VOADO", type: "bar", data: chartData.monthlyVoado },
      ],
      [chartData]
   );

   return (
      <div className="rounded-lg border border-gray-200 bg-white p-4">
         <Chart
            options={chartOptions}
            series={chartSeries}
            type="line"
            height={320}
         />
      </div>
   );
}

export function EsfAerChartTable({
   totalAlocado,
   totalMeses,
}: EsfAerChartProps) {
   const monthlySummary = useMemo(() => {
      const monthlyPlan = totalAlocado / 12;

      let lastFlownIndex = -1;
      for (let i = 11; i >= 0; i--) {
         if (totalMeses[i] > 0) {
            lastFlownIndex = i;
            break;
         }
      }

      let accum = 0;
      return MONTH_LABELS.map((label, i) => {
         accum += totalMeses[i];
         return {
            label,
            planejado: Math.round(monthlyPlan * (i + 1)),
            voado: totalMeses[i],
            acumulado: i <= lastFlownIndex ? accum : null,
         };
      });
   }, [totalAlocado, totalMeses]);

   return (
      <div className="rounded-lg border border-gray-200 bg-white">
         <Table striped className="text-xs">
            <TableHead>
               <TableRow>
                  <TableHeadCell>MES</TableHeadCell>
                  <TableHeadCell className="text-center">
                     PLANEJADO
                  </TableHeadCell>
                  <TableHeadCell className="text-center">VOADO</TableHeadCell>
                  <TableHeadCell className="text-center">
                     ACUMULADO
                  </TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className="divide-y">
               {monthlySummary.map((row) => (
                  <TableRow key={row.label}>
                     <TableCell className="text-center font-medium text-gray-900">
                        {row.label}
                     </TableCell>
                     <TableCell className="text-center">
                        {minutesToTime(row.planejado)}
                     </TableCell>
                     <TableCell className="text-center">
                        {minutesToTime(row.voado)}
                     </TableCell>
                     <TableCell className="text-center">
                        {row.acumulado !== null
                           ? minutesToTime(row.acumulado)
                           : "-"}
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
   );
}
