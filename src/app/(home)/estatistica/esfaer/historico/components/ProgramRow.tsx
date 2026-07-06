"use client";

import clsx from "clsx";
import { Checkbox } from "flowbite-react";
import { minutesToTime } from "@/../utils/dateHandler";
import { formatSignedMinutes } from "../../utils";
import { getGroupColor } from "../constants";
import type { HistPrograma } from "services/routes/estatistica/esfAer";

interface ProgramRowProps {
   programa: HistPrograma;
   /** Cor da série deste programa (a mesma do gráfico — `buildProgramColors`). */
   color: string;
   /** Visibilidade marcada no rail. */
   checked: boolean;
   /** Este programa é o isolado (estado do botão do nome). */
   isolated: boolean;
   /** Esmaecido quando outro programa está isolado. */
   dimmed: boolean;
   onToggle: () => void;
   /** Clique no nome → isolar (só Total + este programa). */
   onIsolate: () => void;
}

/**
 * Linha do rail de programas: checkbox de visibilidade + dot de cor + nome
 * (clicável p/ isolar) com badge do grupo, e à direita o alocado atual + o
 * último Δ da timeline (verde se positivo, vermelho se negativo, cinza se
 * criação/zero).
 */
export function ProgramRow({
   programa,
   color,
   checked,
   isolated,
   dimmed,
   onToggle,
   onIsolate,
}: ProgramRowProps) {
   const { nome, descricao, grupo, atual, timeline } = programa;
   const grupoColor = getGroupColor(grupo);

   // Último delta da timeline. Timeline com 1 ponto = criação (Δ neutro).
   const isCriacao = timeline.length <= 1;
   const delta = timeline.length > 0 ? timeline[timeline.length - 1].delta : 0;
   const deltaColor =
      isCriacao || delta === 0
         ? "text-slate-400"
         : delta > 0
           ? "text-green-600"
           : "text-red-600";

   return (
      <div
         className={clsx(
            "flex items-center gap-3 rounded border border-slate-200 bg-white px-3 py-2 transition-opacity",
            dimmed && "opacity-45"
         )}
      >
         <Checkbox
            color="red"
            checked={checked}
            onChange={onToggle}
            aria-label={`Alternar visibilidade de ${nome}`}
            className="shrink-0 cursor-pointer"
         />

         <span
            aria-hidden
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
         />

         <button
            type="button"
            onClick={onIsolate}
            title={descricao}
            aria-pressed={isolated}
            aria-label={`Isolar ${nome} no gráfico`}
            className="min-w-0 flex-1 text-left"
         >
            <span className="block truncate text-sm font-semibold text-slate-900">
               {nome}
            </span>
            <span
               className="mt-0.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase"
               style={{ color: grupoColor, backgroundColor: `${grupoColor}14` }}
            >
               {grupo}
            </span>
         </button>

         <div className="shrink-0 text-right">
            <span className="block font-mono text-sm font-semibold text-slate-900 tabular-nums">
               {minutesToTime(atual)}
            </span>
            <span
               className={clsx(
                  "block font-mono text-xs tabular-nums",
                  deltaColor
               )}
            >
               {formatSignedMinutes(delta)}
            </span>
         </div>
      </div>
   );
}
