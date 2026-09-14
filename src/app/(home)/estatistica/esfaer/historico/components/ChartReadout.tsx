"use client";

import clsx from "clsx";
import { minutesToTime } from "@/../utils/dateHandler";
import { formatSignedMinutes } from "../../utils";

/**
 * Leitura de uma série ativa no gráfico: dot da cor da série, rótulo, alocado
 * vigente e último Δ.
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
   /** Último Δ da série, em MINUTOS (0 = neutro). */
   delta: number;
   /** Série tracejada no gráfico (Σ de grupo) — o dot vira anel. */
   dashed?: boolean;
}

export function ChartReadout({
   label,
   color,
   atual,
   delta,
   dashed = false,
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
         <span className="font-mono text-xs font-semibold text-slate-900 tabular-nums">
            {minutesToTime(atual)}
         </span>
         <span
            className={clsx(
               "font-mono text-[11px] tabular-nums",
               delta === 0
                  ? "text-slate-500"
                  : delta > 0
                    ? "text-green-700"
                    : "text-red-700"
            )}
            // Δ zero é ambíguo: pode ser "nunca houve mudança" ou mudanças
            // opostas na MESMA data, que se anulam. Sem saber qual, o title
            // afirma só o que é certo — o valor não mudou.
            title={
               delta === 0
                  ? `${label}: sem variação`
                  : `${label}: última variação de ${formatSignedMinutes(delta)}`
            }
         >
            {formatSignedMinutes(delta)}
         </span>
      </span>
   );
}
