"use client";

import { memo } from "react";
import { MdGroups } from "react-icons/md";
import clsx from "clsx";
import type { DateStatus } from "@/utils/dateStatus";
import { getStatusConfig } from "@/utils/dateStatus";
import type { CrmStats, StatusFilter } from "../types";

// Ordem de leitura: o que exige ação primeiro. Inclui "empty" (militar sem
// CRM lançado) — é a informação mais acionável da tela.
const SEVERIDADES: DateStatus[] = [
   "expired",
   "critical",
   "warning",
   "valid",
   "empty",
];

// ========================================
// CounterButton
// ========================================

/**
 * Contador que também é o filtro daquele status — o número e a ação são a
 * mesma coisa, então a régua de chips saiu da barra de filtros. Aqui o
 * casamento é exato: contador e filtro leem o mesmo `data_validade`.
 *
 * `<button>` nativo (e não `Button` do Flowbite): o alvo é um bloco com
 * número, rótulo e barra de proporção, não um botão de texto — o padding e a
 * altura do componente da biblioteca brigariam com a densidade da faixa.
 */
const CounterButton = memo(function CounterButton({
   status,
   count,
   total,
   active,
   onToggle,
}: {
   status: DateStatus;
   count: number;
   total: number;
   active: boolean;
   onToggle: (status: DateStatus) => void;
}) {
   const cfg = getStatusConfig(status);
   const pct = total > 0 ? Math.round((count / total) * 100) : 0;
   // O rótulo acompanha o que o clique FAZ: no estado ativo ele desliga o
   // recorte, e dizer "filtrar" ali seria mentira para quem lê o title.
   const acao = active ? "remover filtro" : "filtrar";
   const nome = `${cfg.label}, ${count} — ${acao}`;

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
// SummaryBar
// ========================================

interface SummaryBarProps {
   stats: CrmStats;
   statusFilter: StatusFilter;
   onStatusFilterChange: (value: StatusFilter) => void;
}

/**
 * Resumo da validade do CRM numa faixa: identidade à esquerda, contadores à
 * direita. Clicar no contador já ativo desliga o recorte.
 */
const SummaryBar = memo(function SummaryBar({
   stats,
   statusFilter,
   onStatusFilterChange,
}: SummaryBarProps) {
   const { total, counts } = stats;

   const handleToggle = (status: DateStatus) =>
      onStatusFilterChange(statusFilter === status ? "all" : status);

   return (
      <div className="flex items-center gap-3 overflow-hidden rounded border border-slate-200 bg-white p-2.5 shadow-sm">
         <div className="flex w-28 shrink-0 items-center gap-2 sm:w-36">
            <span className="bg-primary-50 text-primary-600 grid h-8 w-8 shrink-0 place-items-center rounded-md">
               <MdGroups className="h-4 w-4" />
            </span>
            <span className="min-w-0">
               <span className="block truncate text-sm font-bold text-gray-800">
                  Situação
               </span>
               <span className="block text-[11px] whitespace-nowrap text-gray-500 tabular-nums">
                  {total} militares
               </span>
            </span>
         </div>
         {/* 3 colunas no mobile: em cinco os rótulos de 9px não cabem em
             390px e quebram linha. */}
         <div className="grid min-w-0 flex-1 grid-cols-3 gap-1.5 sm:grid-cols-5">
            {SEVERIDADES.map((status) => (
               <CounterButton
                  key={status}
                  status={status}
                  count={counts[status]}
                  total={total}
                  active={statusFilter === status}
                  onToggle={handleToggle}
               />
            ))}
         </div>
      </div>
   );
});

export default SummaryBar;
