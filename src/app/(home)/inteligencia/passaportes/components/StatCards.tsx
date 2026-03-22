"use client";

import { memo } from "react";
import { Badge, Progress } from "flowbite-react";
import { MdWarning } from "react-icons/md";
import { HiIdentification } from "react-icons/hi";
import { FaPassport } from "react-icons/fa";
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
   counts: { valid: number; warning: number; critical: number; expired: number };
   urgent: number;
}

function StatCard({
   icon: Icon,
   iconColor,
   iconBg,
   label,
   total,
   counts,
   urgent,
}: StatCardProps) {
   const statuses: DateStatus[] = ["valid", "warning", "critical", "expired"];

   return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
         {/* Header */}
         <div className="flex items-center justify-between mb-4">
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
                           "text-[9px] font-semibold uppercase tracking-widest opacity-80",
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
      </div>
   );
}

// ========================================
// StatCardsGrid
// ========================================

interface StatCardsGridProps {
   passaporteStats: {
      total: number;
      counts: { valid: number; warning: number; critical: number; expired: number };
   };
   visaStats: {
      total: number;
      counts: { valid: number; warning: number; critical: number; expired: number };
   };
}

const StatCardsGrid = memo(function StatCardsGrid({
   passaporteStats,
   visaStats,
}: StatCardsGridProps) {
   return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
         <StatCard
            icon={FaPassport}
            iconColor="text-red-600"
            iconBg="bg-red-50"
            label="Passaporte"
            total={passaporteStats.total}
            counts={passaporteStats.counts}
            urgent={passaporteStats.counts.expired + passaporteStats.counts.critical}
         />
         <StatCard
            icon={HiIdentification}
            iconColor="text-red-600"
            iconBg="bg-red-50"
            label="Visto Americano"
            total={visaStats.total}
            counts={visaStats.counts}
            urgent={visaStats.counts.expired + visaStats.counts.critical}
         />
      </div>
   );
});

export default StatCardsGrid;
