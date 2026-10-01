"use client";

import clsx from "clsx";
import { Checkbox } from "flowbite-react";
import { minutesToTime } from "@/../utils/dateHandler";
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
 * Linha do rail de programas, numa linha só: checkbox de visibilidade + dot de
 * cor + nome (clicável p/ isolar) e, à direita, o alocado atual. O Δ fica
 * só no tooltip do gráfico, onde tem data e valor anterior para dar sentido.
 *
 * O grupo NÃO se repete por linha: o rail agrupa por seção, com o grupo no
 * cabeçalho — o selo em cada uma das ~57 linhas dobrava a altura delas.
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
   const { nome, descricao, atual } = programa;

   // Programa sem hora alocada hoje: fica na lista (tem histórico), mas cede o
   // peso visual para os que estão valendo. `slate-500`, não mais claro: o
   // texto continua legível (AA), só deixa de competir.
   const zerado = atual === 0;

   return (
      <div
         data-esfaer-id={programa.esfaer_id}
         className={clsx(
            // `scroll-mt-8`: o `scrollIntoView` do isolado não pode deixar a
            // linha escondida atrás do cabeçalho fixo da seção.
            "flex scroll-mt-8 items-center gap-2 rounded border py-1 pr-2 pl-1 transition-opacity",
            // O isolado precisa de tinta PRÓPRIA: `dimmed` cai nos OUTROS, de
            // modo que sem isto a linha em foco fica idêntica a uma normal —
            // e, com o rail rolado, o usuário vê várias linhas apagadas e
            // nenhuma acesa. Ring na cor da série amarra a linha ao gráfico.
            isolated ? "bg-slate-50" : "border-transparent hover:bg-slate-50",
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
         {/* O checkbox tem 14px; o alvo de 24px é o `label` que o abraça
             (cresce o elemento da linha, não um halo — ver regra de alvos). */}
         <label className="flex h-[24px] w-[24px] shrink-0 cursor-pointer items-center justify-center">
            <Checkbox
               color="primary"
               checked={checked}
               onChange={onToggle}
               aria-label={`Alternar visibilidade de ${nome}`}
               className="cursor-pointer"
            />
         </label>

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
            className={clsx(
               "min-h-[24px] min-w-0 flex-1 truncate text-left text-sm font-semibold",
               zerado ? "text-slate-500" : "text-slate-900"
            )}
         >
            {nome}
         </button>

         <span
            className={clsx(
               "shrink-0 font-mono text-sm font-semibold tabular-nums",
               zerado ? "text-slate-500" : "text-slate-900"
            )}
         >
            {minutesToTime(atual)}
         </span>
      </div>
   );
}
