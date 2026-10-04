"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { minutesToTime } from "@/../utils/dateHandler";
import type { RegimeLinha } from "services/routes/estatistica/indicadores";
import { useChartColor } from "../../sebo/hooks/useChartColor";
import { REGIME_META } from "../constants";
import { pct } from "../utils";
import { CHART_HEIGHT } from "./chartConstants";

const Chart = dynamic(() => import("react-apexcharts"), {
   ssr: false,
   loading: () => <div style={{ height: CHART_HEIGHT }} />,
});

const FALLBACK = { label: "", color: "#94a3b8", text: "#0f172a" };

interface RegimeDonutProps {
   porRegime: RegimeLinha[];
}

/** Participação de cada regime de voo nas horas do período. */
export function RegimeDonut({ porRegime }: RegimeDonutProps) {
   const total = porRegime.reduce((acc, r) => acc + r.tvoo, 0);
   // Um hook por tom de `REGIME_META.shade`; o Apex não lê var()/oklch.
   const c300 = useChartColor(300);
   const c600 = useChartColor(600);
   const c900 = useChartColor(900);

   const options = useMemo<ApexOptions>(() => {
      const hex: Record<number, string> = { 300: c300, 600: c600, 900: c900 };
      const meta = porRegime.map((r) => {
         const m = REGIME_META[r.reg];
         return m
            ? { label: m.label, color: hex[m.shade], text: m.text }
            : { ...FALLBACK, label: r.reg };
      });
      return {
         chart: { toolbar: { show: false }, fontFamily: "inherit" },
         plotOptions: { pie: { donut: { size: "60%" } } },
         labels: meta.map((m) => m.label),
         colors: meta.map((m) => m.color),
         // Respiro de 2px entre fatias, na cor da superfície.
         stroke: { width: 2, colors: ["#ffffff"] },
         dataLabels: {
            enabled: true,
            formatter: (val: number) => `${val.toFixed(1)}%`,
            style: {
               colors: meta.map((m) => m.text),
               fontSize: "12px",
               fontWeight: 600,
            },
            dropShadow: { enabled: false },
         },
         legend: {
            position: "bottom",
            fontSize: "12px",
            labels: { colors: "#334155" },
            itemMargin: { horizontal: 8 },
            formatter: (name: string, opts) =>
               `${name} · ${minutesToTime(opts.w.globals.series[opts.seriesIndex])}`,
         },
         // Pie/donut nascem com tema escuro e fundo = cor da fatia (transparente).
         tooltip: {
            theme: "light",
            fillSeriesColor: false,
            y: { formatter: (val: number) => minutesToTime(val) },
         },
      };
   }, [porRegime, c300, c600, c900]);

   return (
      <div className="p-2">
         <Chart
            options={options}
            series={porRegime.map((r) => r.tvoo)}
            type="donut"
            width="100%"
            height={CHART_HEIGHT}
         />
         <div className="sr-only">
            <table>
               <caption>Horas de voo por regime</caption>
               <thead>
                  <tr>
                     <th>Regime</th>
                     <th>Horas</th>
                     <th>Participação</th>
                  </tr>
               </thead>
               <tbody>
                  {porRegime.map((r) => (
                     <tr key={r.reg}>
                        <td>{REGIME_META[r.reg]?.label ?? r.reg}</td>
                        <td>{minutesToTime(r.tvoo)}</td>
                        <td>{pct(r.tvoo, total).toFixed(1)}%</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );
}
