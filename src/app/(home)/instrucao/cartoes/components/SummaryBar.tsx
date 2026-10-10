"use client";

import { memo, useCallback } from "react";
import clsx from "clsx";
import type { CartaoStatus } from "../types";
import {
   CARD_WARN_DAYS_LABEL,
   DOC_FIELDS,
   SEVERIDADES,
   STATUS_LABELS,
   type DocField,
} from "../cartoes.config";
import { getStatusColors } from "../utils/statusColors";
import type { CartaoFiltro, DocStats } from "../utils/cartaoStats";

/**
 * Contador que também é o filtro daquele status NAQUELE documento — mesmo
 * padrão do resumo de `aeromedica/cartoes-saude`: clicar lista exatamente os
 * pilotos que o número conta, e clicar de novo desliga.
 *
 * Rótulo em cima e número embaixo (lá ficam na mesma linha): com seis
 * documentos e quatro contadores por faixa, cada contador tem ~65px no
 * celular, e "A VENCER" ao lado do número não caberia.
 *
 * `<button>` nativo (e não `Button` do Flowbite): o alvo é um bloco com
 * rótulo, número e barra, e o padding do componente brigaria com a densidade.
 */
const CounterButton = memo(function CounterButton({
   doc,
   status,
   count,
   efetivo,
   active,
   onToggle,
}: {
   doc: DocField;
   status: CartaoStatus;
   count: number;
   efetivo: number;
   active: boolean;
   onToggle: (doc: string, status: CartaoStatus) => void;
}) {
   const colors = getStatusColors(status);
   const pct = efetivo > 0 ? Math.round((count / efetivo) * 100) : 0;
   // Sem o documento no nome acessível os 24 botões se anunciariam como seis
   // quartetos idênticos ("Vencido, 3").
   const nome = `${doc.nome}: ${STATUS_LABELS[status]}, ${count}`;
   const dica = status === "warn" ? ` (${CARD_WARN_DAYS_LABEL})` : "";

   return (
      <button
         type="button"
         aria-pressed={active}
         aria-label={`${nome} — filtrar`}
         title={`${nome}${dica} — clique para filtrar`}
         onClick={() => onToggle(doc.key, status)}
         className={clsx(
            "min-w-0 rounded border px-1.5 py-1 text-left transition-colors",
            active ? "shadow-sm" : "border-slate-200 bg-white hover:bg-gray-50"
         )}
         style={
            active
               ? {
                    backgroundColor: colors.badgeBg,
                    borderColor: colors.badgeBorder,
                 }
               : undefined
         }
      >
         <span
            className="block truncate text-[9px] font-semibold tracking-wide uppercase"
            style={{ color: colors.text }}
         >
            {STATUS_LABELS[status]}
         </span>
         <span
            className="block text-base leading-tight font-bold tabular-nums"
            style={{ color: colors.text }}
         >
            {count}
         </span>
         <span className="mt-1 block h-1 w-full overflow-hidden rounded-full bg-gray-200">
            <span
               className="block h-full rounded-full"
               style={{ width: `${pct}%`, backgroundColor: colors.dot }}
            />
         </span>
      </button>
   );
});

function DocSummary({
   doc,
   stats,
   filtro,
   onToggle,
}: {
   doc: DocField;
   stats: DocStats;
   filtro: CartaoFiltro | null;
   onToggle: (doc: string, status: CartaoStatus) => void;
}) {
   return (
      <div className="flex items-center gap-2.5 bg-white p-2.5">
         {/* Identidade: sigla e cobertura. O "sem data" tem contador próprio;
             aqui a leitura é de quantos do efetivo já têm a data lançada. */}
         <div className="w-14 shrink-0 sm:w-24" title={doc.nome}>
            <span className="block truncate text-sm font-bold text-gray-800">
               {doc.label}
            </span>
            <span className="block text-[11px] whitespace-nowrap text-gray-500 tabular-nums">
               {stats.total}/{stats.efetivo}
               <span className="hidden sm:inline"> com data</span>
            </span>
         </div>
         <div className="grid min-w-0 flex-1 grid-cols-4 gap-1.5">
            {SEVERIDADES.map((status) => (
               <CounterButton
                  key={status}
                  doc={doc}
                  status={status}
                  count={stats.counts[status]}
                  efetivo={stats.efetivo}
                  active={filtro?.doc === doc.key && filtro.status === status}
                  onToggle={onToggle}
               />
            ))}
         </div>
      </div>
   );
}

interface SummaryBarProps {
   stats: Record<string, DocStats>;
   filtro: CartaoFiltro | null;
   onFiltroChange: (filtro: CartaoFiltro | null) => void;
}

/**
 * Resumo dos seis documentos com validade (quatro provas e dois idiomas).
 * Uma faixa por documento — identidade à esquerda, contadores à direita —
 * em grade de 1, 2 ou 3 colunas conforme a largura. O `gap-px` sobre fundo
 * slate desenha os divisores entre as faixas em qualquer número de colunas.
 *
 * Só um recorte fica ativo por vez: clicar no contador já ativo desliga.
 */
const SummaryBar = memo(function SummaryBar({
   stats,
   filtro,
   onFiltroChange,
}: SummaryBarProps) {
   // Estável enquanto o recorte não muda: senão o `memo` do CounterButton
   // não serviria para nada.
   const handleToggle = useCallback(
      (doc: string, status: CartaoStatus) =>
         onFiltroChange(
            filtro?.doc === doc && filtro.status === status
               ? null
               : { doc, status }
         ),
      [filtro, onFiltroChange]
   );

   return (
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded border border-slate-200 bg-slate-200 shadow-sm md:grid-cols-2 2xl:grid-cols-3">
         {DOC_FIELDS.map((doc) => (
            <DocSummary
               key={doc.key}
               doc={doc}
               stats={stats[doc.key]}
               filtro={filtro}
               onToggle={handleToggle}
            />
         ))}
      </div>
   );
});

export default SummaryBar;
