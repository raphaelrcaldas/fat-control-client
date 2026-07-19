"use client";

import { Button } from "flowbite-react";
import { HiCalculator } from "react-icons/hi";
import { useSimulacao } from "./hooks/useSimulacao";
import { MissaoParamsCard } from "./components/MissaoParamsCard";
import { PernoitesCard } from "./components/PernoitesCard";
import { CombinacoesCard } from "./components/CombinacoesCard";
import { ResultadoPanel } from "./components/ResultadoPanel";

/**
 * Tab "Calculadora": simula o custo de uma missão em fase de planejamento
 * (nada persiste — ver CONTEXTO_DESIGN_CALCULADORA_MISSOES.md). "Militar"
 * vira "PG genérico + quantidade"; não há período de missão, só as datas de
 * cada pernoite entram no cálculo.
 */
export function CalculadoraPage() {
   const {
      acrecDesloc,
      setAcrecDesloc,
      pnts,
      setPnts,
      combinacoes,
      setCombinacoes,
      invalidPernoites,
      duplicateIdx,
      resultado,
      desatualizado,
      podeCalcular,
      motivoBloqueio,
      calcular,
      isCalculando,
      erro,
   } = useSimulacao();

   return (
      <div className="grid items-start gap-4 lg:grid-cols-2">
         <div className="flex flex-col gap-3">
            <MissaoParamsCard
               acrecDesloc={acrecDesloc}
               setAcrecDesloc={setAcrecDesloc}
            />

            <PernoitesCard
               pnts={pnts}
               setPnts={setPnts}
               invalidIdx={invalidPernoites}
            />

            <CombinacoesCard
               combinacoes={combinacoes}
               setCombinacoes={setCombinacoes}
               duplicateIdx={duplicateIdx}
            />

            <div className="flex items-center justify-end gap-3">
               {!podeCalcular && !isCalculando && motivoBloqueio && (
                  <p className="text-xs text-slate-500">{motivoBloqueio}</p>
               )}
               <Button
                  color="primary"
                  disabled={!podeCalcular}
                  onClick={calcular}
               >
                  <HiCalculator className="mr-2 h-4 w-4" />
                  {isCalculando ? "Calculando..." : "Calcular"}
               </Button>
            </div>
         </div>

         <ResultadoPanel
            resultado={resultado}
            isCalculando={isCalculando}
            desatualizado={desatualizado}
            erro={erro}
            onRecalcular={calcular}
            pnts={pnts}
         />
      </div>
   );
}
