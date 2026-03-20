"use client";

import { memo } from "react";
import { Badge, Progress } from "flowbite-react";
import { MdWarning } from "react-icons/md";
import clsx from "clsx";
import type { DateStatus } from "../types";
import {
   getDateStatus,
   getStatusConfig,
} from "@/app/(home)/aeromedica/cartoes-saude/utils/dateStatus";
import type { TripCrmOut } from "services/routes/seg-voo/crm";


interface StatCardProps {
   total: number;
   counts: {
      valid: number;
      warning: number;
      critical: number;
      expired: number;
   };
}

function StatCard({ total, counts }: StatCardProps) {
   const statuses: DateStatus[] = ["valid", "warning", "critical", "expired"];

   return (
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
         {/* Indicadores de validade */}
         <div className="p-5">
            <div className="mb-3 flex items-center justify-between">
               <p className="text-xs text-gray-500 text-center w-full">
                  {total} militares certificados
               </p>
               {counts.expired + counts.critical > 0 && (
                  <Badge color="failure" size="sm">
                     <span className="flex items-center gap-1">
                        <MdWarning className="h-3 w-3" />
                        <span className="font-bold">
                           {counts.expired + counts.critical}
                        </span>
                     </span>
                  </Badge>
               )}
            </div>

            <div className="grid grid-cols-4 gap-2">
               {statuses.map((s) => {
                  const cfg = getStatusConfig(s);
                  const count = counts[s];
                  const pct =
                     total > 0 ? Math.round((count / total) * 100) : 0;
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
      </div>
   );
}

interface StatCardsProps {
   data: TripCrmOut[];
}

const StatCards = memo(function StatCards({ data }: StatCardsProps) {
   const counts = { valid: 0, warning: 0, critical: 0, expired: 0 };
   let total = 0;

   for (const item of data) {
      const status = getDateStatus(item.crm?.data_validade);
      if (status !== "empty") {
         counts[status]++;
         total++;
      }
   }

   return (
      <div className="flex justify-center">
         <StatCard total={total} counts={counts} />
      </div>
   );
});

export default StatCards;
