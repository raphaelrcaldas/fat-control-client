"use client";

import clsx from "clsx";
import { Button } from "flowbite-react";
import { TbEraser, TbZoomReset } from "react-icons/tb";
import { minutesToTime } from "@/../utils/dateHandler";
import { getGroupColor, TOTAL_COLOR } from "../constants";

/** Base comum dos chips-legenda (Total e Σ grupos): mesmo shape e ritmo. */
const CHIP_BASE =
   "inline-flex items-center gap-2 rounded border px-3 py-1.5 text-sm font-medium transition-colors";
/**
 * Chip desligado: neutro e esmaecido (sem strikethrough). `slate-500` (~4.6:1
 * sobre branco) e não `slate-400` (~2.8:1, reprova AA) — "desligado" ainda lê
 * como desligado pelo contraste com o chip ON, sem exigir texto ilegível.
 */
const CHIP_OFF =
   "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700";

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
   /** Volta a visibilidade ao default da tela (só o Total). */
   onResetVisibility: () => void;
   /** Há seleção além do default — desabilita a ação quando não há. */
   hasSelection: boolean;
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
   onResetVisibility,
   hasSelection,
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
                        !on && "text-slate-500"
                     )}
                  >
                     {minutesToTime(somaAtualPorGrupo[g])}
                  </span>
               </button>
            );
         })}

         {/* Ações — o `ml-auto` vai no grupo, não no primeiro botão, senão a
             quebra de linha separaria as duas ações. */}
         <div className="ml-auto flex items-center gap-2">
            {/* Sem isto, desfazer uma seleção grande é desmarcar item a item —
                e, com o rail rolado, sem ver o que ficou ligado. Some quando
                não há o que limpar, em vez de ficar inerte na faixa. */}
            {hasSelection && (
               <Button color="light" size="xs" onClick={onResetVisibility}>
                  <TbEraser className="mr-1.5 h-3.5 w-3.5" />
                  Limpar seleção
               </Button>
            )}

            <Button color="light" size="xs" onClick={onResetZoom}>
               <TbZoomReset className="mr-1.5 h-3.5 w-3.5" />
               Ver ano todo
            </Button>
         </div>
      </div>
   );
}
