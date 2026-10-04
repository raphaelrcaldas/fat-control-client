"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { minutesToTime } from "@/../utils/dateHandler";
import type { TipoMissaoLinha } from "services/routes/estatistica/indicadores";
import { useChartColor } from "../../sebo/hooks/useChartColor";
import { fmtInt, pct } from "../utils";
import { CHART_HEIGHT } from "./chartConstants";

const Chart = dynamic(() => import("react-apexcharts"), {
   ssr: false,
   loading: () => <div style={{ height: CHART_HEIGHT }} />,
});

/** Quantos tipos de missão listar antes de agrupar o resto. */
const TOP_TIPOS = 8;
const COLOR_OUTROS = "#94a3b8"; // slate-400
const COLOR_TEXT = "#334155"; // slate-700
const MAX_LABEL = 26;

interface Barra {
   nome: string;
   tvoo: number;
   etapas: number;
}

interface TipoMissaoBarrasProps {
   porTipoMissao: TipoMissaoLinha[];
}

/** Horas por tipo de missão: os maiores em barras, o resto agrupado. */
export function TipoMissaoBarras({ porTipoMissao }: TipoMissaoBarrasProps) {
   const primary = useChartColor();
   const total = porTipoMissao.reduce((acc, t) => acc + t.tvoo, 0);

   const barras = useMemo<Barra[]>(() => {
      const top = porTipoMissao.slice(0, TOP_TIPOS).map((t) => ({
         nome: `${t.cod} ${t.desc}`,
         tvoo: t.tvoo,
         etapas: t.etapas,
      }));
      const resto = porTipoMissao.slice(TOP_TIPOS);
      if (resto.length === 0) return top;
      return [
         ...top,
         {
            nome: `Outros (${resto.length})`,
            tvoo: resto.reduce((acc, t) => acc + t.tvoo, 0),
            etapas: resto.reduce((acc, t) => acc + t.etapas, 0),
         },
      ];
   }, [porTipoMissao]);

   const options = useMemo<ApexOptions>(() => {
      const maior = Math.max(...barras.map((b) => b.tvoo), 1);
      return {
         chart: { toolbar: { show: false }, fontFamily: "inherit" },
         colors: barras.map((b) =>
            b.nome.startsWith("Outros (") ? COLOR_OUTROS : primary
         ),
         plotOptions: {
            bar: {
               horizontal: true,
               distributed: true,
               borderRadius: 4,
               borderRadiusApplication: "end",
               barHeight: "70%",
               dataLabels: { position: "top" },
            },
         },
         legend: { show: false },
         dataLabels: {
            enabled: true,
            textAnchor: "start",
            offsetX: 4,
            formatter: (val: number) => minutesToTime(Math.round(val)),
            style: { colors: [COLOR_TEXT], fontSize: "11px", fontWeight: 600 },
            dropShadow: { enabled: false },
         },
         xaxis: {
            categories: barras.map((b) => b.nome),
            // Folga à direita para o rótulo da maior barra caber; a 360px o
            // plot é estreito e 1.2 deixava "657:25" vazar da borda.
            max: maior * 1.4,
            labels: { show: false },
            axisBorder: { show: false },
            axisTicks: { show: false },
         },
         yaxis: {
            labels: {
               maxWidth: 190,
               style: { colors: COLOR_TEXT, fontSize: "11px", fontWeight: 500 },
               // Nome completo fica no tooltip; o eixo trunca.
               formatter: (nome: string | number) => {
                  const s = String(nome);
                  return s.length > MAX_LABEL
                     ? `${s.slice(0, MAX_LABEL - 1)}…`
                     : s;
               },
            },
         },
         grid: {
            borderColor: "#e2e8f0",
            strokeDashArray: 3,
            xaxis: { lines: { show: false } },
         },
         tooltip: {
            theme: "light",
            y: {
               title: { formatter: () => "" },
               formatter: (val: number, { dataPointIndex }) => {
                  const b = barras[dataPointIndex];
                  return `${minutesToTime(val)} · ${fmtInt(b.etapas)} etapas · ${pct(val, total).toFixed(1)}%`;
               },
            },
         },
      };
   }, [barras, primary, total]);

   return (
      <div className="p-2">
         <Chart
            options={options}
            series={[{ name: "Horas de voo", data: barras.map((b) => b.tvoo) }]}
            type="bar"
            width="100%"
            height={CHART_HEIGHT}
         />
         <div className="sr-only">
            <table>
               <caption>Horas de voo por tipo de missão</caption>
               <thead>
                  <tr>
                     <th>Tipo</th>
                     <th>Etapas</th>
                     <th>Horas</th>
                     <th>Participação</th>
                  </tr>
               </thead>
               <tbody>
                  {barras.map((b) => (
                     <tr key={b.nome}>
                        <td>{b.nome}</td>
                        <td>{fmtInt(b.etapas)}</td>
                        <td>{minutesToTime(b.tvoo)}</td>
                        <td>{pct(b.tvoo, total).toFixed(1)}%</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );
}
