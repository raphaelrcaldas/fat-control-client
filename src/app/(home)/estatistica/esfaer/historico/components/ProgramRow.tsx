"use client";

import clsx from "clsx";
import { Checkbox } from "flowbite-react";
import { minutesToTime } from "@/../utils/dateHandler";
import { formatSignedMinutes } from "../../utils";
import { ultimoDelta } from "../utils";
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

   // Último Δ da timeline — o do backend, sem tratar "1 ponto" como criação
   // (ver `ultimoDelta`): o gráfico lê a mesma fonte, e os dois precisam
   // mostrar o mesmo número para a mesma série.
   const delta = ultimoDelta(timeline);
   const deltaColor =
      delta === 0
         ? "text-slate-400"
         : delta > 0
           ? "text-green-600"
           : "text-red-600";

   return (
      <div
         data-esfaer-id={programa.esfaer_id}
         className={clsx(
            "flex items-center gap-3 rounded border px-3 py-2 transition-opacity",
            // O isolado precisa de tinta PRÓPRIA: `dimmed` cai nos OUTROS, de
            // modo que sem isto a linha em foco fica idêntica a uma normal —
            // e, com o rail rolado, o usuário vê várias linhas apagadas e
            // nenhuma acesa. Ring na cor da série amarra a linha ao gráfico.
            isolated ? "bg-slate-50" : "border-slate-200 bg-white",
            dimmed && "opacity-45"
         )}
         // Borda na cor da própria série (não numa cor de realce fixa): amarra
         // a linha do rail à linha do gráfico. Inline porque a cor é dado,
         // não classe — mesma razão da paleta em `constants.ts`.
         style={
            isolated
               ? { borderColor: color, boxShadow: `0 0 0 1px ${color}` }
               : undefined
         }
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
