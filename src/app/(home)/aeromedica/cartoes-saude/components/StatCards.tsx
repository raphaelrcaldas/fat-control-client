"use client";

import { Badge, Progress } from "flowbite-react";
import { MdWarning } from "react-icons/md";
import { FaHeartPulse, FaEye } from "react-icons/fa6";
import { FaSpaceShuttle } from "react-icons/fa";
import clsx from "clsx";
import type { DateStatus } from "@/utils/dateStatus";
import { getStatusConfig } from "../utils/dateStatus";

// ========================================
// StatCard
// ========================================

interface StatCardProps {
   icon: React.ComponentType<{ className?: string }>;
   iconColor: string;
   iconBg: string;
   label: string;
   total: number;
   counts: {
      valid: number;
      warning: number;
      critical: number;
      expired: number;
      empty: number;
   };
   urgent: number;
   extra?: React.ReactNode;
}

function StatCard({
   icon: Icon,
   iconColor,
   iconBg,
   label,
   total,
   counts,
   urgent,
   extra,
}: StatCardProps) {
   const statuses: DateStatus[] = [
      "valid",
      "warning",
      "critical",
      "expired",
      "empty",
   ];

   // `total` conta só quem tem data; o efetivo é ele + os sem data. Todas as
   // barras usam esse mesmo denominador — com bases diferentes elas não
   // seriam comparáveis entre si, que é a única razão de ficarem lado a lado.
   const efetivo = total + counts.empty;

   return (
      <div className="overflow-hidden rounded border border-slate-200 bg-white p-5 shadow-sm">
         {/* Header */}
         <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className={clsx("rounded-md p-2.5", iconBg)}>
                  <Icon className={clsx("h-5 w-5", iconColor)} />
               </div>
               <div>
                  <h2 className="text-sm font-bold text-gray-800">{label}</h2>
                  <p className="text-xs text-gray-500 tabular-nums">
                     {total} de {efetivo} com data
                  </p>
               </div>
            </div>
            {urgent > 0 && (
               <Badge color="failure" size="sm">
                  <span className="flex items-center gap-1">
                     <MdWarning className="h-3 w-3" />
                     <span className="font-bold">{urgent}</span>
                  </span>
               </Badge>
            )}
         </div>

         {/* Counters */}
         <div className="grid grid-cols-5 gap-2">
            {statuses.map((s) => {
               const cfg = getStatusConfig(s);
               const count = counts[s];
               const pct =
                  efetivo > 0 ? Math.round((count / efetivo) * 100) : 0;
               return (
                  <div key={s} className="text-center">
                     <div
                        className={clsx(
                           "text-xl font-bold tabular-nums",
                           cfg.color
                        )}
                     >
                        {count}
                     </div>
                     {/* Sem `opacity-80`: as cores 700/gray-500 foram escolhidas
                         para passar AA e a opacidade anulava a escolha (3.3–4.1).
                         `whitespace-nowrap` impede a colisão dos rótulos no
                         tablet; a altura fixa mantém as 5 barras no mesmo eixo. */}
                     <div
                        className={clsx(
                           "flex h-4 items-center justify-center text-[10px] font-semibold tracking-wide whitespace-nowrap uppercase",
                           cfg.color
                        )}
                     >
                        {cfg.label}
                     </div>
                     <div className="mt-1.5">
                        <Progress
                           progress={pct}
                           size="sm"
                           color={
                              cfg.barColor === "green"
                                 ? "green"
                                 : cfg.barColor === "yellow"
                                   ? "yellow"
                                   : cfg.barColor === "gray"
                                     ? "dark"
                                     : "red"
                           }
                        />
                     </div>
                  </div>
               );
            })}
         </div>

         {/* Extra row */}
         {extra}
      </div>
   );
}

// ========================================
// StatCardsGrid
// ========================================

interface StatCardsGridProps {
   cemalStats: {
      total: number;
      counts: {
         valid: number;
         warning: number;
         critical: number;
         expired: number;
         empty: number;
      };
   };
   imaeStats: {
      total: number;
      counts: {
         valid: number;
         warning: number;
         critical: number;
         expired: number;
         empty: number;
      };
   };
   tovnStats: {
      total: number;
      counts: {
         valid: number;
         warning: number;
         critical: number;
         expired: number;
         empty: number;
      };
   };
}

export default function StatCardsGrid({
   cemalStats,
   imaeStats,
   tovnStats,
}: StatCardsGridProps) {
   return (
      // 3 colunas só a partir de `xl`: abaixo disso o card não passa de ~250px
      // e os 5 rótulos colidem ("REGULARATENÇÃOCRÍTICO..."). Medido em 1024,
      // onde a separação entre eles era de 0px.
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
         <StatCard
            icon={FaHeartPulse}
            iconColor="text-rose-500"
            iconBg="bg-rose-50"
            label="CEMAL — Inspeção de Saúde"
            total={cemalStats.total}
            counts={cemalStats.counts}
            urgent={cemalStats.counts.expired + cemalStats.counts.critical}
         />
         <StatCard
            icon={FaSpaceShuttle}
            iconColor="text-cyan-500"
            iconBg="bg-cyan-50"
            label="IMAE — Adaptação Fisiológica"
            total={imaeStats.total}
            counts={imaeStats.counts}
            urgent={imaeStats.counts.expired + imaeStats.counts.critical}
         />
         <StatCard
            icon={FaEye}
            iconColor="text-emerald-500"
            iconBg="bg-emerald-50"
            label="TOVN — Visão Noturna"
            total={tovnStats.total}
            counts={tovnStats.counts}
            urgent={tovnStats.counts.expired + tovnStats.counts.critical}
         />
      </div>
   );
}
