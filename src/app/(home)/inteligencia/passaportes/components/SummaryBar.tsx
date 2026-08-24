"use client";

import { memo } from "react";
import { HiIdentification } from "react-icons/hi";
import { FaPassport } from "react-icons/fa";
import clsx from "clsx";
import type { CountableStatus, PassaporteStats, StatusFilter } from "../types";
import { getStatusConfig } from "../utils/dateStatus";

// Ordem de leitura: o que exige ação primeiro.
const COUNTABLE: CountableStatus[] = [
   "expired",
   "critical",
   "warning",
   "valid",
];

// ========================================
// CounterButton
// ========================================

/**
 * Contador que também é o filtro daquele status — o número e a ação são a
 * mesma coisa, então a régua de chips saiu da barra de filtros.
 *
 * `<button>` nativo (e não `Button` do Flowbite): o alvo é um bloco com
 * número, rótulo e barra de proporção, não um botão de texto — o padding e a
 * altura do componente da biblioteca brigariam com a densidade da faixa.
 */
const CounterButton = memo(function CounterButton({
   docLabel,
   status,
   count,
   total,
   active,
   onToggle,
}: {
   docLabel: string;
   status: CountableStatus;
   count: number;
   total: number;
   active: boolean;
   onToggle: (status: CountableStatus) => void;
}) {
   const cfg = getStatusConfig(status);
   const pct = total > 0 ? Math.round((count / total) * 100) : 0;
   // Sem o documento no nome acessível os oito botões da faixa se anunciam
   // como quatro pares idênticos ("Vencidos, 3").
   const nome = `${docLabel}: ${cfg.label}, ${count}`;

   return (
      <button
         type="button"
         aria-pressed={active}
         aria-label={nome}
         onClick={() => onToggle(status)}
         title={nome}
         className={clsx(
            "rounded border px-2 py-1 text-left transition-colors pointer-coarse:min-h-[44px]",
            active
               ? clsx(cfg.bg, cfg.border, "shadow-sm")
               : "border-slate-200 bg-white hover:bg-gray-50"
         )}
      >
         <span className="flex items-baseline justify-between gap-1">
            <span
               className={clsx(
                  "truncate text-[9px] font-semibold tracking-widest uppercase",
                  cfg.color
               )}
            >
               {cfg.label}
            </span>
            <span
               className={clsx("text-base font-bold tabular-nums", cfg.color)}
            >
               {count}
            </span>
         </span>
         <span className="mt-1 block h-1 w-full overflow-hidden rounded-full bg-gray-200">
            <span
               className={clsx("block h-full rounded-full", cfg.dot)}
               style={{ width: `${pct}%` }}
            />
         </span>
      </button>
   );
});

// ========================================
// DocSummary
// ========================================

function DocSummary({
   icon: Icon,
   label,
   stats,
   statusFilter,
   onToggle,
}: {
   icon: React.ComponentType<{ className?: string }>;
   label: string;
   stats: PassaporteStats;
   statusFilter: StatusFilter;
   onToggle: (status: CountableStatus) => void;
}) {
   return (
      <div className="flex flex-1 items-center gap-3 p-2.5">
         <div className="flex w-32 shrink-0 items-center gap-2 sm:w-36">
            <span className="bg-primary-50 text-primary-600 grid h-8 w-8 shrink-0 place-items-center rounded-md">
               <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
               <span className="block truncate text-sm font-bold text-gray-800">
                  {label}
               </span>
               <span className="block text-[11px] whitespace-nowrap text-gray-500">
                  {stats.total} militares
               </span>
            </span>
         </div>
         {/* 2x2 no mobile: em quatro colunas os rótulos de 9px não cabem em
             390px e quebram linha. */}
         <div className="grid min-w-0 flex-1 grid-cols-2 gap-1.5 sm:grid-cols-4">
            {COUNTABLE.map((status) => (
               <CounterButton
                  key={status}
                  docLabel={label}
                  status={status}
                  count={stats.counts[status]}
                  total={stats.total}
                  active={statusFilter === status}
                  onToggle={onToggle}
               />
            ))}
         </div>
      </div>
   );
}

// ========================================
// SummaryBar
// ========================================

interface SummaryBarProps {
   passaporteStats: PassaporteStats;
   visaStats: PassaporteStats;
   statusFilter: StatusFilter;
   onStatusFilterChange: (value: StatusFilter) => void;
}

/**
 * Resumo por documento em uma faixa. O filtro de status é um só (aplicado ao
 * pior status da linha, como sempre foi), então clicar no mesmo bloco de
 * qualquer um dos lados desliga o recorte.
 */
const SummaryBar = memo(function SummaryBar({
   passaporteStats,
   visaStats,
   statusFilter,
   onStatusFilterChange,
}: SummaryBarProps) {
   const handleToggle = (status: CountableStatus) =>
      onStatusFilterChange(statusFilter === status ? "all" : status);

   return (
      <div className="flex flex-col divide-y divide-slate-200 overflow-hidden rounded border border-slate-200 bg-white shadow-sm sm:flex-row sm:divide-x sm:divide-y-0">
         <DocSummary
            icon={FaPassport}
            label="Passaporte"
            stats={passaporteStats}
            statusFilter={statusFilter}
            onToggle={handleToggle}
         />
         <DocSummary
            icon={HiIdentification}
            label="Visto"
            stats={visaStats}
            statusFilter={statusFilter}
            onToggle={handleToggle}
         />
      </div>
   );
});

export default SummaryBar;
