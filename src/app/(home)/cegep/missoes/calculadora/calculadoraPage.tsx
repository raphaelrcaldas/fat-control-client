"use client";

import { useSimulacao } from "./hooks/useSimulacao";
import { MissaoParamsCard } from "./components/MissaoParamsCard";
import { PernoitesCard } from "./components/PernoitesCard";
import { CombinacoesCard } from "./components/CombinacoesCard";
import { ResultadoPanel } from "./components/ResultadoPanel";
import { ImpactoComissPanel } from "./components/ImpactoComissPanel";

/**
 * Tab "Calculadora": simula o custo de uma missão em fase de planejamento
 * (nada persiste — ver CONTEXTO_DESIGN_CALCULADORA_MISSOES.md). "Militar"
 * vira "PG genérico + quantidade"; não há período de missão, só as datas de
 * cada pernoite entram no cálculo.
 *
 * Não há botão de calcular: os dois painéis são reativos e se refazem
 * sozinhos conforme o formulário muda. À esquerda, o formulário e, ao final
 * dele, o custo que produz; à direita, o efeito da missão sobre os
 * comissionamentos acoplados.
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
      motivoBloqueio,
      calculandoPrimeiro,
      atualizando,
      erro,
      tentarNovamente,
   } = useSimulacao();

   return (
      <div className="grid items-start gap-4 xl:grid-cols-2">
         <div className="flex min-w-0 flex-col gap-3">
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

            <ResultadoPanel
               resultado={resultado}
               calculandoPrimeiro={calculandoPrimeiro}
               atualizando={atualizando}
               erro={erro}
               motivoBloqueio={motivoBloqueio}
               onTentarNovamente={tentarNovamente}
               pnts={pnts}
            />
         </div>

         <ImpactoComissPanel pnts={pnts} acrecDesloc={acrecDesloc} />
      </div>
   );
}
