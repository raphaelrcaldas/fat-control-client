"use client";

import clsx from "clsx";
import { Button, Tooltip } from "flowbite-react";
import { HiCalculator, HiExclamation } from "react-icons/hi";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { Pernoite, SimulacaoResultado } from "services/routes/cegep/missoes";
import { EmptyState } from "@/components/ui/EmptyState";
import { getPostoByShort } from "@/constants/militar/postos";
import { SITUACAO_CONFIG } from "@/constants/cegep/situacoes";
import { realCurrency } from "utils/financeiro";
import type { SimulacaoErrorInfo } from "../simulacaoErrors";
import { ResultadoSkeleton } from "./ResultadoSkeleton";
import { ExtratoAccordion } from "./ExtratoAccordion";

interface ResultadoPanelProps {
   resultado: SimulacaoResultado | null;
   isCalculando: boolean;
   desatualizado: boolean;
   erro: SimulacaoErrorInfo | null;
   onRecalcular: () => void;
   pnts: Pernoite[];
}

export function ResultadoPanel({
   resultado,
   isCalculando,
   desatualizado,
   erro,
   onRecalcular,
   pnts,
}: ResultadoPanelProps) {
   const stale = !!resultado && (desatualizado || isCalculando);

   return (
      <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
         <p className="mb-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Resultado
         </p>

         {/* Precedência: skeleton (calculando) > erro > desatualizado >
             resultado normal > EmptyState. Erro some sozinho no próximo
             mutate() bem-sucedido (mutation.error é limpo pelo React Query). */}
         {isCalculando && !resultado && <ResultadoSkeleton />}

         {!isCalculando && erro && (
            <div className="space-y-4">
               <ErroBanner erro={erro} onRecalcular={onRecalcular} />
               {resultado && (
                  <div className="pointer-events-none space-y-4 opacity-50">
                     <ResultadoConteudo resultado={resultado} pnts={pnts} />
                  </div>
               )}
            </div>
         )}

         {!erro && !resultado && !isCalculando && (
            <EmptyState
               icon={HiCalculator}
               title="Nenhuma simulação"
               description="Preencha pernoites e militares e clique em Calcular."
            />
         )}

         {!erro && resultado && (
            <div className="space-y-4">
               {stale && (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-amber-200 bg-amber-50 px-3 py-2">
                     <span className="flex items-center gap-1.5 text-sm text-amber-800">
                        <HiExclamation className="h-4 w-4 shrink-0" />
                        {isCalculando
                           ? "Calculando…"
                           : "Inputs alterados — resultado desatualizado"}
                     </span>
                     {!isCalculando && (
                        <Button size="xs" color="yellow" onClick={onRecalcular}>
                           Recalcular
                        </Button>
                     )}
                  </div>
               )}

               <div
                  className={clsx(
                     "space-y-4 transition-opacity",
                     stale && "pointer-events-none opacity-50"
                  )}
               >
                  <ResultadoConteudo resultado={resultado} pnts={pnts} />
               </div>
            </div>
         )}
      </div>
   );
}

/** Banner vermelho persistente do erro — mesmo padrão visual do banner
 * "desatualizado" (amber), mas em red e sem se apagar sozinho. */
function ErroBanner({
   erro,
   onRecalcular,
}: {
   erro: SimulacaoErrorInfo;
   onRecalcular: () => void;
}) {
   return (
      <div className="flex flex-wrap items-start justify-between gap-2 rounded border border-red-200 bg-red-50 px-3 py-2">
         <div className="flex items-start gap-1.5 text-sm text-red-800">
            <HiExclamation className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
               <p>{erro.message}</p>
               {erro.detalhes.length > 0 && (
                  <ul className="list-disc pl-4">
                     {erro.detalhes.map((d, i) => (
                        <li key={i}>{d}</li>
                     ))}
                  </ul>
               )}
            </div>
         </div>
         <Button size="xs" color="failure" onClick={onRecalcular}>
            Tentar novamente
         </Button>
      </div>
   );
}

/** Corpo do resultado — dias/diárias, resumo por combinação e extrato por
 * pernoite. Extraído para reuso no estado de erro (resultado antigo
 * esmaecido embaixo do banner) e no fluxo normal. */
function ResultadoConteudo({
   resultado,
   pnts,
}: {
   resultado: SimulacaoResultado;
   pnts: Pernoite[];
}) {
   return (
      <>
         {/* Dias/diárias — universais da missão (não somam por militar) */}
         <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500 tabular-nums">
            <span className="font-semibold text-slate-700">
               {resultado.total_dias}
            </span>
            {resultado.total_dias === 1 ? "dia" : "dias"}
            <span className="text-slate-300">·</span>
            <span className="font-semibold text-slate-700">
               {onlyGrat(resultado) && resultado.total_diarias === 0
                  ? "—"
                  : resultado.total_diarias.toFixed(1)}
            </span>
            diárias
            <Tooltip content="Dias e diárias são da missão — não multiplicam por militar">
               <IoMdInformationCircleOutline className="h-4 w-4 text-slate-400" />
            </Tooltip>
         </div>

         {resultado.valores_zerados && (
            <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
               Há diárias sem valor vigente para o período simulado —
               resultado pode estar incompleto.
            </div>
         )}

         {/* Resumo por combinação — nota fiscal (colunas alinhadas) */}
         <div className="rounded border border-slate-200 bg-slate-50 p-3">
            <div className="overflow-x-auto">
               <table className="w-full min-w-max border-collapse font-mono text-xs tabular-nums">
                  <thead>
                     <tr className="border-b border-slate-300 text-[10px] tracking-wide text-slate-500 uppercase">
                        <th className="pb-1 text-left font-normal">
                           Combinação
                        </th>
                        <th className="pb-1 pl-4 text-right font-normal">
                           Unit.
                        </th>
                        <th className="pb-1 pl-4 text-right font-normal">
                           Qtd
                        </th>
                        <th className="pb-1 pl-4 text-right font-normal">
                           Subtotal
                        </th>
                     </tr>
                  </thead>
                  <tbody>
                     {resultado.combinacoes.map((c, i) => (
                        <tr
                           key={`${c.p_g}-${c.sit}-${i}`}
                           className="border-b border-dashed border-slate-200"
                        >
                           <td className="py-1 text-slate-700">
                              {getPostoByShort(c.p_g)?.mid ??
                                 c.p_g.toUpperCase()}{" "}
                              · {SITUACAO_CONFIG[c.sit].label}
                           </td>
                           <td className="py-1 pl-4 text-right whitespace-nowrap text-slate-600">
                              {realCurrency(c.valor_unitario)}
                           </td>
                           <td className="py-1 pl-4 text-right whitespace-nowrap text-slate-500">
                              ×{c.qtd}
                           </td>
                           <td className="py-1 pl-4 text-right font-semibold whitespace-nowrap text-slate-900">
                              {realCurrency(c.subtotal)}
                           </td>
                        </tr>
                     ))}
                     <tr>
                        <td
                           colSpan={3}
                           className="pt-2 text-[10px] font-semibold tracking-wide text-slate-500 uppercase"
                        >
                           Total geral
                        </td>
                        <td className="pt-2 pl-4 text-right text-base font-bold whitespace-nowrap text-slate-900">
                           {realCurrency(resultado.total_geral)}
                        </td>
                     </tr>
                  </tbody>
               </table>
            </div>
         </div>

         {/* Extrato por pernoite */}
         {resultado.pernoites.length > 0 && (
            <div>
               <p className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Extrato por pernoite
               </p>
               <ExtratoAccordion pernoites={resultado.pernoites} pnts={pnts} />
            </div>
         )}
      </>
   );
}

function onlyGrat(resultado: SimulacaoResultado): boolean {
   return (
      resultado.combinacoes.length > 0 &&
      resultado.combinacoes.every((c) => c.sit === "g")
   );
}
