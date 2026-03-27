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
   const statuses: DateStatus[] = ["valid", "warning", "critical", "expired"];

   return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
         {/* Header */}
         <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className={clsx("rounded-xl p-2.5", iconBg)}>
                  <Icon className={clsx("h-5 w-5", iconColor)} />
               </div>
               <div>
                  <h3 className="text-sm font-bold text-gray-800">{label}</h3>
                  <p className="text-[11px] text-gray-400">{total} militares</p>
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
         <div className="grid grid-cols-4 gap-2">
            {statuses.map((s) => {
               const cfg = getStatusConfig(s);
               const count = counts[s];
               const pct = total > 0 ? Math.round((count / total) * 100) : 0;
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
                     <div
                        className={clsx(
                           "text-[9px] font-semibold tracking-widest uppercase opacity-80",
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
      };
   };
   cemalScheduled: number;
   imaeStats: {
      total: number;
      counts: {
         valid: number;
         warning: number;
         critical: number;
         expired: number;
      };
   };
   tovnStats: {
      total: number;
      counts: {
         valid: number;
         warning: number;
         critical: number;
         expired: number;
      };
   };
}

export default function StatCardsGrid({
   cemalStats,
   cemalScheduled,
   imaeStats,
   tovnStats,
}: StatCardsGridProps) {
   return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
         <StatCard
            icon={FaHeartPulse}
            iconColor="text-rose-500"
            iconBg="bg-rose-50"
            label="CEMAL — Inspeção de Saúde"
            total={cemalStats.total}
            counts={cemalStats.counts}
            urgent={cemalStats.counts.expired + cemalStats.counts.critical}
            extra={
               <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-xs text-gray-500">Com agendamento</span>
                  <Badge color="info" size="sm">
                     <span className="font-bold tabular-nums">
                        {cemalScheduled} / {cemalStats.total}
                     </span>
                  </Badge>
               </div>
            }
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
