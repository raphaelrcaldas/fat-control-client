"use client";

import { TbX } from "react-icons/tb";
import { ChartReadout } from "./ChartReadout";
import type { ChartReadouts } from "../hooks/useChartReadouts";

interface ChartHeaderProps extends ChartReadouts {
   /** Nome do esforço isolado, quando há um (habilita a ação de sair). */
   isoladoNome: string | null;
   onClearIsolated: () => void;
}

/**
 * Cabeçalho do gráfico: a leitura das séries ativas (valor e Δ de cada uma) e,
 * quando há isolamento, a ação de sair dele.
 *
 * A leitura mora aqui, junto do gráfico que ela descreve — os chips da toolbar
 * são CONTROLE (ligam e desligam séries) e ficam só com o rótulo.
 */
export function ChartHeader({
   readouts,
   excedente,
   isoladoNome,
   onClearIsolated,
}: ChartHeaderProps) {
   return (
      <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
         {/* Heading de verdade fica no `sr-only`: um h2 cujo texto acessível
             fosse a lista de números seria inútil para navegação. As leituras
             mudam a cada toggle, então vão num live region educado. */}
         <h2 className="sr-only">Séries no gráfico</h2>
         <div
            role="status"
            aria-live="polite"
            className="flex flex-wrap items-center gap-x-4 gap-y-1"
         >
            {readouts.length > 0 ? (
               readouts.map((r) => (
                  <ChartReadout
                     key={r.key}
                     label={r.label}
                     color={r.color}
                     atual={r.atual}
                     delta={r.delta}
                     dashed={r.dashed}
                  />
               ))
            ) : (
               <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Histórico · carry-forward
               </span>
            )}
            {excedente > 0 && (
               <span
                  className="font-mono text-[11px] text-slate-500 tabular-nums"
                  title="Os demais esforços ligados estão no gráfico; a leitura mostra os primeiros para não roubar altura."
               >
                  +{excedente} no gráfico
               </span>
            )}
         </div>

         {isoladoNome && (
            /* Dispensável aqui: sair do isolamento exigia achar de novo a
               linha no rail — que pode ter rolado para fora. O usuário já
               está olhando para cá. */
            <button
               type="button"
               onClick={onClearIsolated}
               title={`Sair do isolamento de ${isoladoNome}`}
               className="inline-flex max-w-full items-center gap-1 rounded border border-red-100 bg-red-50 py-0.5 pr-1.5 pl-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
            >
               <span className="truncate">sair do isolamento</span>
               <TbX aria-hidden className="h-3.5 w-3.5 shrink-0" />
            </button>
         )}
      </div>
   );
}
