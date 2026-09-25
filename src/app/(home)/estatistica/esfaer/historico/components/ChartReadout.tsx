"use client";

import clsx from "clsx";
import { minutesToTime } from "@/../utils/dateHandler";

/**
 * Leitura de uma série ativa no gráfico: dot da cor da série, rótulo e alocado
 * vigente. Sem Δ: a variação fica no tooltip, junto da data e do valor
 * anterior que lhe dão sentido.
 *
 * O chip da toolbar é CONTROLE (liga/desliga) e continua só com o rótulo; a
 * leitura numérica mora aqui, junto do gráfico que ela descreve — a mesma
 * informação que o rail dá por esforço, agora também para o Total e para cada
 * grupo selecionado.
 */
export interface ChartReadoutProps {
   /** Rótulo da série ("Total da unidade", "Σ COMAE"). */
   label: string;
   /** Cor da série no gráfico. */
   color: string;
   /** Alocado vigente, em MINUTOS. */
   atual: number;
   /** Série tracejada no gráfico (Σ de grupo) — o dot vira anel. */
   dashed?: boolean;
   /**
    * Leitura principal da tela (o Total da unidade): valor maior, para ser o
    * primeiro número que o olho encontra acima do gráfico.
    */
   destaque?: boolean;
}

export function ChartReadout({
   label,
   color,
   atual,
   dashed = false,
   destaque = false,
}: ChartReadoutProps) {
   return (
      <span className="inline-flex items-baseline gap-1.5">
         {/* Dot cheio = linha sólida (Total); anel = tracejada (Σ grupo). */}
         <span
            aria-hidden
            className="h-2 w-2 shrink-0 self-center rounded-full"
            style={
               dashed
                  ? { border: `2px solid ${color}` }
                  : { backgroundColor: color }
            }
         />
         <span className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
            {label}
         </span>
         <span
            className={clsx(
               "font-mono font-semibold text-slate-900 tabular-nums",
               destaque ? "text-lg leading-none font-bold" : "text-xs"
            )}
         >
            {minutesToTime(atual)}
         </span>
      </span>
   );
}
