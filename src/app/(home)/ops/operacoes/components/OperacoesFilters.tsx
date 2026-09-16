"use client";

import { useState } from "react";
import clsx from "clsx";
import { IoMdSearch } from "react-icons/io";
import { MdClose, MdFilterList } from "react-icons/md";
import { Badge, Button, TextInput } from "flowbite-react";
import { useAbaixoDe } from "@/hooks/useAbaixoDe";
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
   const compacto = useAbaixoDe("sm");

   function patch(p: Partial<OperacoesFiltersState>) {
      onChange({ ...value, ...p });
   }

   // "Ativo" = difere do padrão (período do ano corrente / sem tipo / sem busca)
   const periodoCustom =
      value.date_start !== defaultDates.start ||
      value.date_end !== defaultDates.end;
   const hasAny =
      periodoCustom || value.tipo !== null || value.q.trim().length > 0;

   // Tipo e período recolhem no mobile: inline, empurravam a primeira operação
   // para baixo da dobra no S25. Fechado, o contador é a única pista de que a
   // lista não está no padrão.
   const recolhidosAtivos =
      (value.tipo !== null ? 1 : 0) + (periodoCustom ? 1 : 0);
   const [filtrosAbertos, setFiltrosAbertos] = useState(recolhidosAtivos > 0);

   function clearFilters() {
      patch({
         tipo: null,
         date_start: defaultDates.start,
         date_end: defaultDates.end,
         q: "",
      });
   }

   return (
      /* Vive DENTRO do card da listagem: sem moldura, sem raio e sem margem
         próprios — o separador para a tabela é o `border-b` da barra. */
      <div className="flex flex-col">
         {/* Trilho de status — cada aba carrega a cor da espinha da linha.
             No mobile rola na horizontal em uma linha (sem quebrar). */}
         <div className="flex items-center gap-0.5 overflow-x-auto border-b border-slate-200 px-2 whitespace-nowrap">
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
                        "-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-semibold transition-colors",
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

         {/* Deck de controles */}
         <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-slate-200 bg-slate-50/70 p-2">
            {/* Busca + gatilho do disclosure (só no mobile) */}
            <div className="flex w-full items-center gap-2 sm:w-72">
               <div className="flex-1">
                  <TextInput
                     icon={IoMdSearch}
                     /* A API busca `nome` e `documento_referencia` — não ICAO.
                        Prometer o que o endpoint não filtra gera busca vazia
                        que parece defeito. */
                     placeholder="buscar por nome ou documento…"
                     value={value.q}
                     onChange={(e) => patch({ q: e.target.value })}
                     sizing="sm"
                  />
               </div>
               <Button
                  color="light"
                  size="sm"
                  className="shrink-0 sm:hidden"
                  onClick={() => setFiltrosAbertos((aberto) => !aberto)}
                  aria-expanded={filtrosAbertos}
                  aria-controls="operacoes-filtros"
               >
                  <MdFilterList className="mr-1 h-4 w-4" />
                  Filtros
                  {recolhidosAtivos > 0 && (
                     <Badge color="primary" className="ml-1.5">
                        {recolhidosAtivos}
                     </Badge>
                  )}
               </Button>
            </div>

            {/* Tipo e período: recolhíveis no mobile, inline de `sm:` para
                cima. A altura anima por `grid-template-rows` (0fr → 1fr), não
                por `max-height` — ver `TripFilters`. */}
            <div
               id="operacoes-filtros"
               className={clsx(
                  "grid w-full transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none sm:contents",
                  filtrosAbertos ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
               )}
            >
               <div className="overflow-hidden sm:contents">
                  {/* `inert` só no mobile: de `sm:` para cima `filtrosAbertos`
                      pode ser falso e os controles seguem visíveis. */}
                  <div
                     inert={compacto && !filtrosAbertos}
                     className="flex flex-col gap-2 pt-2 sm:contents"
                  >
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
                              onChange={(e) =>
                                 patch({ date_start: e.target.value })
                              }
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
                              onChange={(e) =>
                                 patch({ date_end: e.target.value })
                              }
                           />
                        </div>
                     </div>
                  </div>
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
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-2 py-1.5">
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
            "flex-1 rounded px-2.5 py-1.5 text-xs font-semibold transition-all sm:flex-initial",
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
