"use client";

import clsx from "clsx";
import { IoMdSearch } from "react-icons/io";
import { MdClose } from "react-icons/md";
import { TextInput } from "flowbite-react";
import { isoDateToShort } from "@/../utils/dateHandler";
import type {
   OperStatus,
   OperTipo,
   OperacaoTabCounts,
} from "services/routes/ops/operacoes";
import { TIPOS } from "../schemas/operacaoSchema";
import { STATUS_TAB } from "./operacaoUi";

export interface OperacoesFiltersState {
   status: OperStatus | null;
   tipo: OperTipo | null;
   date_start: string;
   date_end: string;
   q: string;
}

interface Tab {
   key: OperStatus | null;
   accent: OperStatus | "todas";
   label: string;
   count: (c: OperacaoTabCounts) => number;
}

const TABS: Tab[] = [
   { key: null, accent: "todas", label: "Todas", count: (c) => c.todas },
   {
      key: "andamento",
      accent: "andamento",
      label: "Em andamento",
      count: (c) => c.andamento,
   },
   {
      key: "encerrada",
      accent: "encerrada",
      label: "Encerradas",
      count: (c) => c.encerrada,
   },
   {
      key: "planejada",
      accent: "planejada",
      label: "Rascunhos",
      count: (c) => c.planejada,
   },
   {
      key: "cancelada",
      accent: "cancelada",
      label: "Canceladas",
      count: (c) => c.cancelada,
   },
];

interface Props {
   value: OperacoesFiltersState;
   onChange: (next: OperacoesFiltersState) => void;
   counts: OperacaoTabCounts;
   defaultDates: { start: string; end: string };
}

export function OperacoesFilters({
   value,
   onChange,
   counts,
   defaultDates,
}: Props) {
   function patch(p: Partial<OperacoesFiltersState>) {
      onChange({ ...value, ...p });
   }

   // "Ativo" = difere do padrão (período do ano corrente / sem tipo / sem busca)
   const periodoCustom =
      value.date_start !== defaultDates.start ||
      value.date_end !== defaultDates.end;
   const hasAny =
      periodoCustom || value.tipo !== null || value.q.trim().length > 0;

   function clearFilters() {
      patch({
         tipo: null,
         date_start: defaultDates.start,
         date_end: defaultDates.end,
         q: "",
      });
   }

   return (
      <div className="mb-4 flex flex-col gap-3">
         {/* Trilho de status — cada aba carrega a cor da espinha do card.
             No mobile rola na horizontal em uma linha (sem quebrar). */}
         <div className="flex items-center gap-0.5 overflow-x-auto border-b border-slate-200 whitespace-nowrap">
            {TABS.map((tab) => {
               const n = tab.count(counts);
               if (tab.key === "cancelada" && n === 0) return null;
               const active = value.status === tab.key;
               const accent = STATUS_TAB[tab.accent];
               return (
                  <button
                     key={tab.label}
                     type="button"
                     onClick={() => patch({ status: tab.key })}
                     className={clsx(
                        "-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-semibold transition-colors pointer-coarse:min-h-[44px]",
                        active
                           ? clsx(accent.border, accent.text)
                           : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                     )}
                  >
                     {tab.label}
                     <span
                        className={clsx(
                           "rounded-full px-1.5 text-xs font-bold tabular-nums transition-colors",
                           active ? accent.pill : "bg-slate-100 text-slate-500"
                        )}
                     >
                        {n}
                     </span>
                  </button>
               );
            })}
         </div>

         {/* Deck de controles — superfície única que rima com o card */}
         <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded border border-slate-200 bg-slate-50/70 p-2">
            {/* Busca (largura fixa para não reflowar o deck) */}
            <div className="w-full sm:w-72">
               <TextInput
                  icon={IoMdSearch}
                  placeholder="buscar por nome, documento, ICAO…"
                  value={value.q}
                  onChange={(e) => patch({ q: e.target.value })}
                  sizing="sm"
               />
            </div>

            <span
               className="hidden h-7 w-px bg-slate-200 lg:block"
               aria-hidden
            />

            {/* Tipo — no mobile o segmentado ocupa a largura, botões iguais */}
            <div className="flex w-full items-center gap-1.5 sm:w-auto">
               <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-slate-500 uppercase">
                  Tipo
               </span>
               <div className="flex flex-1 items-center gap-0.5 rounded-md bg-slate-200/70 p-0.5 sm:flex-initial">
                  <TipoBtn
                     active={value.tipo === null}
                     onClick={() => patch({ tipo: null })}
                  >
                     Todos
                  </TipoBtn>
                  {TIPOS.map((t) => (
                     <TipoBtn
                        key={t.value}
                        active={value.tipo === t.value}
                        onClick={() => patch({ tipo: t.value })}
                     >
                        {t.label}
                     </TipoBtn>
                  ))}
               </div>
            </div>

            <span
               className="hidden h-7 w-px bg-slate-200 lg:block"
               aria-hidden
            />

            {/* Período — inputs separados (Flowbite TextInput type=date).
                No mobile ficam lado a lado numa grid de 2 colunas; no sm+ o
                `contents` dissolve o wrapper e cada grupo volta ao flex do deck. */}
            <div className="grid w-full grid-cols-2 gap-2 sm:contents">
               <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-slate-500 uppercase">
                     Início
                  </span>
                  <TextInput
                     type="date"
                     aria-label="Início do período"
                     sizing="sm"
                     className="min-w-0 flex-1 sm:w-40 sm:flex-initial"
                     value={value.date_start}
                     onChange={(e) => patch({ date_start: e.target.value })}
                  />
               </div>
               <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-slate-500 uppercase">
                     Fim
                  </span>
                  <TextInput
                     type="date"
                     aria-label="Fim do período"
                     sizing="sm"
                     className="min-w-0 flex-1 sm:w-40 sm:flex-initial"
                     value={value.date_end}
                     onChange={(e) => patch({ date_end: e.target.value })}
                  />
               </div>
            </div>

            {/* Sempre renderizado (slot fixo) — só alterna visibilidade,
                evitando que o aparecimento empurre o layout. */}
            <button
               type="button"
               onClick={clearFilters}
               aria-hidden={!hasAny}
               tabIndex={hasAny ? 0 : -1}
               className={clsx(
                  "ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-colors",
                  hasAny
                     ? "text-slate-500 hover:bg-slate-200/60 hover:text-slate-700"
                     : "pointer-events-none invisible"
               )}
            >
               <MdClose className="h-4 w-4" /> Limpar
            </button>
         </div>

         {/* Chips de período ativo (apenas quando difere do ano corrente) */}
         {periodoCustom && (
            <div className="flex flex-wrap items-center gap-2">
               <Chip
                  label={`Período: ${isoDateToShort(value.date_start)} → ${isoDateToShort(value.date_end)}`}
                  onRemove={() =>
                     patch({
                        date_start: defaultDates.start,
                        date_end: defaultDates.end,
                     })
                  }
               />
            </div>
         )}
      </div>
   );
}

function TipoBtn({
   active,
   onClick,
   children,
}: {
   active: boolean;
   onClick: () => void;
   children: React.ReactNode;
}) {
   return (
      <button
         type="button"
         onClick={onClick}
         className={clsx(
            "flex-1 rounded px-2.5 py-1.5 text-xs font-semibold transition-all sm:flex-initial pointer-coarse:min-h-[44px]",
            active
               ? "bg-white text-slate-900 shadow-sm"
               : "text-slate-600 hover:text-slate-900"
         )}
      >
         {children}
      </button>
   );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
   return (
      <span className="bg-primary-50 text-primary-700 ring-primary-200 flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset">
         {label}
         <button
            type="button"
            onClick={onRemove}
            aria-label={`Remover ${label}`}
         >
            <MdClose className="h-3.5 w-3.5" />
         </button>
      </span>
   );
}
