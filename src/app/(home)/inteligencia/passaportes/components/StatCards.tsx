"use client";

import { memo } from "react";
import { Badge, Progress } from "flowbite-react";
import { MdWarning } from "react-icons/md";
import { HiIdentification } from "react-icons/hi";
import { FaPassport } from "react-icons/fa";
import clsx from "clsx";
import type { DateStatus } from "@/utils/dateStatus";
import { getStatusConfig } from "../utils/dateStatus";
import type { CountableStatus, PassaporteStats } from "../types";

const COUNTABLE: CountableStatus[] = [
   "valid",
   "warning",
   "critical",
   "expired",
];

// ========================================
// StatCard
// ========================================

interface StatCardProps {
   icon: React.ComponentType<{ className?: string }>;
   label: string;
   stats: PassaporteStats;
}

function StatCard({ icon: Icon, label, stats }: StatCardProps) {
   const { total, counts } = stats;
   const urgent = counts.expired + counts.critical;

   return (
      <div className="overflow-hidden rounded border border-slate-200 bg-white p-5 shadow-sm">
         {/* Header */}
         <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="rounded-md bg-red-50 p-2.5">
                  <Icon className="h-5 w-5 text-red-600" />
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
            {COUNTABLE.map((s: DateStatus) => {
               const cfg = getStatusConfig(s);
               const count = counts[s as CountableStatus];
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
      </div>
   );
}

// ========================================
// StatCardsGrid
// ========================================

interface StatCardsGridProps {
   passaporteStats: PassaporteStats;
   visaStats: PassaporteStats;
}

const StatCardsGrid = memo(function StatCardsGrid({
   passaporteStats,
   visaStats,
}: StatCardsGridProps) {
   return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
         <StatCard
            icon={FaPassport}
            label="Passaporte"
            stats={passaporteStats}
         />
         <StatCard
            icon={HiIdentification}
            label="Visto Americano"
            stats={visaStats}
         />
      </div>
   );
});

export default StatCardsGrid;
