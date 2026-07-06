"use client";

import clsx from "clsx";
import { Button } from "flowbite-react";
import { TbZoomReset } from "react-icons/tb";
import { minutesToTime } from "@/../utils/dateHandler";
import { getGroupColor, TOTAL_COLOR } from "../constants";

/** Base comum dos chips-legenda (Total e Σ grupos): mesmo shape e ritmo. */
const CHIP_BASE =
   "inline-flex items-center gap-2 rounded border px-3 py-1.5 text-sm font-medium transition-colors";
/** Chip desligado: neutro e esmaecido (sem strikethrough). */
const CHIP_OFF =
   "border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600";

interface HistoricoToolbarProps {
   /** Total visível (linha do somatório geral no gráfico). */
   totalVisible: boolean;
   onToggleTotal: () => void;
   /** Grupos derivados dos dados (ordem de exibição dos chips Σ). */
   grupos: string[];
   /** Visibilidade de cada série Σ por grupo (ausente = oculto). */
   groups: Record<string, boolean>;
   onToggleGroup: (g: string) => void;
   /** Soma do `atual` (minutos) por grupo, exibida em cada chip Σ. */
   somaAtualPorGrupo: Record<string, number>;
   /** Restaura o eixo X para o ano inteiro (limpa o zoom do brush). */
   onResetZoom: () => void;
}

/**
 * Faixa de controles do histórico: chip "Total" (toggle), chips "Σ <grupo>"
 * (toggle + somatório atual; grupos DERIVADOS dos dados) e ação "ver ano todo".
 *
 * Estilo sóbrio (legenda-toggle): mesmo shape para todos. ON aplica uma tinta
 * suave da própria cor da série (Total = slate; grupos = cor do grupo, via
 * alpha hex inline). OFF fica neutro e esmaecido — sem strikethrough. O
 * indicador é um segmento de linha honesto ao gráfico: Total sólido, Σ grupos
 * tracejado (a cor crua vem de `getGroupColor`, a mesma do gráfico).
 */
export function HistoricoToolbar({
   totalVisible,
   onToggleTotal,
   grupos,
   groups,
   onToggleGroup,
   somaAtualPorGrupo,
   onResetZoom,
}: HistoricoToolbarProps) {
   return (
      <div className="flex flex-wrap items-center gap-2 rounded border border-slate-200 bg-white px-4 py-2 shadow-sm">
         {/* Total — linha sólida (peso neutro-escuro quando ON). */}
         <button
            type="button"
            onClick={onToggleTotal}
            aria-pressed={totalVisible}
            className={clsx(
               CHIP_BASE,
               totalVisible
                  ? "border-slate-300 bg-slate-100 text-slate-900"
                  : CHIP_OFF
            )}
         >
            <span
               aria-hidden
               className="w-4 border-t-[3px]"
               style={{
                  borderColor: totalVisible ? TOTAL_COLOR : "#cbd5e1",
               }}
            />
            Total
         </button>

         {/* Separador + rótulo */}
         <span aria-hidden className="mx-1 h-5 w-px bg-slate-200" />
         <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
            Grupos
         </span>

         {/* Σ por grupo — linha tracejada (tinta da própria cor quando ON). */}
         {grupos.map((g) => {
            const on = groups[g] ?? false;
            const color = getGroupColor(g);
            return (
               <button
                  key={g}
                  type="button"
                  onClick={() => onToggleGroup(g)}
                  aria-pressed={on}
                  className={clsx(
                     CHIP_BASE,
                     on ? "border-transparent" : CHIP_OFF
                  )}
                  style={
                     on
                        ? {
                             backgroundColor: `${color}14`,
                             color,
                             borderColor: `${color}4d`,
                          }
                        : undefined
                  }
               >
                  <span
                     aria-hidden
                     className="w-4 border-t-2 border-dashed"
                     style={{ borderColor: on ? color : "#cbd5e1" }}
                  />
                  <span>Σ {g}</span>
                  <span
                     className={clsx(
                        "font-mono text-xs tabular-nums",
                        !on && "text-slate-400"
                     )}
                  >
                     {minutesToTime(somaAtualPorGrupo[g])}
                  </span>
               </button>
            );
         })}

         {/* Reset zoom */}
         <Button
            color="light"
            size="xs"
            onClick={onResetZoom}
            className="ml-auto"
         >
            <TbZoomReset className="mr-1.5 h-3.5 w-3.5" />
            Ver ano todo
         </Button>
      </div>
   );
}
