"use client";

import { memo } from "react";
import { Badge, Progress } from "flowbite-react";
import { MdGroups, MdWarning } from "react-icons/md";
import clsx from "clsx";
import type { DateStatus } from "@/utils/dateStatus";
import { getStatusConfig } from "@/utils/dateStatus";
import type { CrmStats } from "../types";

// Inclui "empty" (militar sem CRM cadastrado) — relevante operacionalmente.
const STATUSES: DateStatus[] = [
   "valid",
   "warning",
   "critical",
   "expired",
   "empty",
];

interface StatCardsProps {
   stats: CrmStats;
}

const StatCards = memo(function StatCards({ stats }: StatCardsProps) {
   const { total, counts } = stats;
   const urgent = counts.expired + counts.critical;

   return (
      <div className="flex justify-center">
         <div className="w-full max-w-md overflow-hidden rounded border border-slate-200 bg-white p-5 shadow-sm">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="rounded-md bg-red-50 p-2.5">
                     <MdGroups className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                     <h3 className="text-sm font-bold text-gray-800">CRM</h3>
                     <p className="text-[11px] text-gray-400">
                        {total} militares
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
               {STATUSES.map((s) => {
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
                                      : cfg.barColor === "gray"
                                        ? "gray"
                                        : "red"
                              }
                           />
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>
      </div>
   );
});

export default StatCards;
