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

   // Card em largura total, no mesmo eixo do masthead e da tabela: identidade à
   // esquerda e contadores à direita a partir de md (empilhados no mobile).
   return (
      <div className="overflow-hidden rounded border border-slate-200 bg-white p-5 shadow-sm">
         <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Identidade */}
            <div className="flex items-center gap-3">
               <div className="bg-primary-50 rounded-md p-2.5">
                  <MdGroups className="text-primary-600 h-5 w-5" />
               </div>
               <div>
                  <p className="text-sm font-bold text-gray-800">Situação</p>
                  <p className="text-xs text-gray-500">{total} militares</p>
               </div>
               {urgent > 0 && (
                  <Badge color="red" size="sm">
                     <span className="flex items-center gap-1">
                        <MdWarning className="h-3 w-3" />
                        <span className="font-bold">{urgent}</span>
                     </span>
                  </Badge>
               )}
            </div>

            {/* Contadores — crescem com a faixa livre em vez de se amontoar
                na borda direita (o vão vira respiro entre eles). */}
            <div className="grid grid-cols-5 gap-2 md:flex-1 md:gap-6 lg:max-w-3xl">
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
                        {/* Sem opacity: os tons 700 de dateStatus passam AA
                            (4.5:1) em cheio — a opacidade os derrubava. */}
                        <div
                           className={clsx(
                              "text-[10px] font-semibold tracking-widest uppercase",
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
