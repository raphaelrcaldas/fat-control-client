"use client";

import { memo } from "react";
import { FaHeartPulse, FaEye } from "react-icons/fa6";
import { FaSpaceShuttle } from "react-icons/fa";
import clsx from "clsx";
import type { DateStatus } from "@/utils/dateStatus";
import { getStatusConfig } from "../utils/dateStatus";
import {
   SEVERIDADES,
   type CartaoStats,
   type DocKey,
   type ValidadeFilter,
} from "../types";

// ========================================
// CounterButton
// ========================================

/**
 * Contador que também é o filtro daquele status NAQUELE documento — o número
 * e a ação são a mesma coisa, então a régua de chips saiu da barra de
 * filtros. Clicar lista exatamente os militares que o número conta.
 *
 * `<button>` nativo (e não `Button` do Flowbite): o alvo é um bloco com
 * número, rótulo e barra de proporção, não um botão de texto — o padding e a
 * altura do componente da biblioteca brigariam com a densidade da faixa.
 */
const CounterButton = memo(function CounterButton({
   docLabel,
   status,
   count,
   efetivo,
   active,
   onToggle,
}: {
   docLabel: string;
   status: DateStatus;
   count: number;
   efetivo: number;
   active: boolean;
   onToggle: (status: DateStatus) => void;
}) {
   const cfg = getStatusConfig(status);
   const pct = efetivo > 0 ? Math.round((count / efetivo) * 100) : 0;
   // Sem o documento no nome acessível os quinze botões da faixa se anunciam
   // como cinco trios idênticos ("Vencidos, 3").
   const nome = `${docLabel}: ${cfg.label}, ${count}`;

   return (
      <button
         type="button"
         aria-pressed={active}
         aria-label={`${nome} — filtrar`}
         onClick={() => onToggle(status)}
         title={`${nome} — clique para filtrar`}
         className={clsx(
            "rounded border px-2 py-1 text-left transition-colors",
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
   iconColor,
   iconBg,
   docKey,
   sigla,
   nome,
   stats,
   validadeFilter,
   onToggle,
}: {
   icon: React.ComponentType<{ className?: string }>;
   iconColor: string;
   iconBg: string;
   docKey: DocKey;
   sigla: string;
   nome: string;
   stats: CartaoStats;
   validadeFilter: ValidadeFilter;
   onToggle: (doc: DocKey, status: DateStatus) => void;
}) {
   return (
      // Até `lg` o bloco é uma faixa (identidade à esquerda, contadores à
      // direita). De `lg` para cima os três blocos ficam lado a lado, e aí a
      // identidade sobe para cima dos contadores: ao lado, sobrariam ~54px
      // por contador e o rótulo não caberia.
      <div className="flex flex-1 items-center gap-3 p-2.5 lg:flex-col lg:items-stretch lg:gap-2">
         <div className="flex w-28 shrink-0 items-center gap-2 sm:w-44 lg:w-auto">
            <span
               className={clsx(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-md",
                  iconBg
               )}
            >
               <Icon className={clsx("h-4 w-4", iconColor)} />
            </span>
            <span className="min-w-0">
               <span
                  className="block truncate text-sm font-bold text-gray-800"
                  title={nome}
               >
                  {sigla}
               </span>
               {/* O "sem data" tem contador próprio; aqui a leitura é de
                   cobertura — quantos do efetivo já têm a data lançada. */}
               <span className="block text-[11px] whitespace-nowrap text-gray-500 tabular-nums">
                  {stats.total} de {stats.efetivo} com data
               </span>
            </span>
         </div>
         {/* 3 colunas no mobile: em cinco os rótulos de 9px não cabem em
             390px e quebram linha. */}
         <div className="grid min-w-0 flex-1 grid-cols-3 gap-1.5 sm:grid-cols-5">
            {SEVERIDADES.map((status) => (
               <CounterButton
                  key={status}
                  docLabel={sigla}
                  status={status}
                  count={stats.counts[status]}
                  efetivo={stats.efetivo}
                  active={
                     validadeFilter.tipo === "doc" &&
                     validadeFilter.doc === docKey &&
                     validadeFilter.status === status
                  }
                  onToggle={(s) => onToggle(docKey, s)}
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
   cemalStats: CartaoStats;
   imaeStats: CartaoStats;
   tovnStats: CartaoStats;
   validadeFilter: ValidadeFilter;
   onValidadeFilterChange: (value: ValidadeFilter) => void;
}

/**
 * Resumo dos três documentos: lado a lado no monitor, empilhado abaixo de
 * `lg` — onde três colunas de cinco contadores deixariam cada um com menos
 * de 60px. Nos dois casos a altura fica bem abaixo da pilha de três cartões
 * de 200px que havia antes.
 *
 * Cada contador filtra o SEU documento, e só um recorte fica ativo por vez:
 * clicar no contador já ativo desliga.
 */
const SummaryBar = memo(function SummaryBar({
   cemalStats,
   imaeStats,
   tovnStats,
   validadeFilter,
   onValidadeFilterChange,
}: SummaryBarProps) {
   const handleToggle = (doc: DocKey, status: DateStatus) =>
      onValidadeFilterChange(
         validadeFilter.tipo === "doc" &&
            validadeFilter.doc === doc &&
            validadeFilter.status === status
            ? { tipo: "all" }
            : { tipo: "doc", doc, status }
      );

   return (
      <div className="flex flex-col divide-y divide-slate-200 overflow-hidden rounded border border-slate-200 bg-white shadow-sm lg:flex-row lg:divide-x lg:divide-y-0">
         <DocSummary
            icon={FaHeartPulse}
            iconColor="text-rose-500"
            iconBg="bg-rose-50"
            docKey="cemal"
            sigla="CEMAL"
            nome="CEMAL — Inspeção de Saúde"
            stats={cemalStats}
            validadeFilter={validadeFilter}
            onToggle={handleToggle}
         />
         <DocSummary
            icon={FaSpaceShuttle}
            iconColor="text-cyan-500"
            iconBg="bg-cyan-50"
            docKey="imae"
            sigla="IMAE"
            nome="IMAE — Adaptação Fisiológica"
            stats={imaeStats}
            validadeFilter={validadeFilter}
            onToggle={handleToggle}
         />
         <DocSummary
            icon={FaEye}
            iconColor="text-emerald-500"
            iconBg="bg-emerald-50"
            docKey="tovn"
            sigla="TOVN"
            nome="TOVN — Visão Noturna"
            stats={tovnStats}
            validadeFilter={validadeFilter}
            onToggle={handleToggle}
         />
      </div>
   );
});

export default SummaryBar;
