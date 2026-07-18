"use client";

import clsx from "clsx";
import { Button, Tooltip } from "flowbite-react";
import { HiCalculator, HiExclamation } from "react-icons/hi";
import { IoMdInformationCircleOutline } from "react-icons/io";
import {
   Pernoite,
   SimulacaoResultado,
   SituacaoSimulacao,
} from "services/routes/cegep/missoes";
import { EmptyState } from "@/components/ui/EmptyState";
import { getPostoByShort } from "@/constants/militar/postos";
import { ResultadoSkeleton } from "./ResultadoSkeleton";
import { ExtratoAccordion } from "./ExtratoAccordion";

const SIT_LABEL: Record<SituacaoSimulacao, string> = {
   c: "Comissionado",
   d: "Diária",
   g: "Grat Rep",
};

function currency(v: number): string {
   return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface ResultadoPanelProps {
   resultado: SimulacaoResultado | null;
   isCalculando: boolean;
   desatualizado: boolean;
   onRecalcular: () => void;
   pnts: Pernoite[];
}

export function ResultadoPanel({
   resultado,
   isCalculando,
   desatualizado,
   onRecalcular,
   pnts,
}: ResultadoPanelProps) {
   const stale = !!resultado && (desatualizado || isCalculando);

   return (
      <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
         <p className="mb-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Resultado
         </p>

         {!resultado && !isCalculando && (
            <EmptyState
               icon={HiCalculator}
               title="Nenhuma simulação"
               description="Preencha pernoites e militares e clique em Calcular."
            />
         )}

         {!resultado && isCalculando && <ResultadoSkeleton />}

         {resultado && (
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
                        <div className="min-w-max font-mono text-xs tabular-nums">
                           <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 border-b border-slate-300 pb-1 text-[10px] tracking-wide text-slate-400 uppercase">
                              <span>Combinação</span>
                              <span className="text-right">Unit.</span>
                              <span className="text-right">Qtd</span>
                              <span className="text-right">Subtotal</span>
                           </div>
                           {resultado.combinacoes.map((c, i) => (
                              <div
                                 key={`${c.p_g}-${c.sit}-${i}`}
                                 className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 border-b border-dashed border-slate-200 py-1"
                              >
                                 <span className="text-slate-700">
                                    {getPostoByShort(c.p_g)?.mid ??
                                       c.p_g.toUpperCase()}{" "}
                                    · {SIT_LABEL[c.sit]}
                                 </span>
                                 <span className="text-right text-slate-600">
                                    {currency(c.valor_unitario)}
                                 </span>
                                 <span className="text-right text-slate-500">
                                    ×{c.qtd}
                                 </span>
                                 <span className="text-right font-semibold text-slate-900">
                                    {currency(c.subtotal)}
                                 </span>
                              </div>
                           ))}
                           <div className="grid grid-cols-[1fr_auto] gap-x-4 pt-2">
                              <span className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
                                 Total geral
                              </span>
                              <span className="text-right text-base font-bold text-slate-900">
                                 {currency(resultado.total_geral)}
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Extrato por pernoite */}
                  {resultado.pernoites.length > 0 && (
                     <div>
                        <p className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                           Extrato por pernoite
                        </p>
                        <ExtratoAccordion
                           pernoites={resultado.pernoites}
                           pnts={pnts}
                        />
                     </div>
                  )}
               </div>
            </div>
         )}
      </div>
   );
}

function onlyGrat(resultado: SimulacaoResultado): boolean {
   return (
      resultado.combinacoes.length > 0 &&
      resultado.combinacoes.every((c) => c.sit === "g")
   );
}
