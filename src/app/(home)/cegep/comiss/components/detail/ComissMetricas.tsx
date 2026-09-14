import { Progress } from "flowbite-react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { realCurrency } from "utils/financeiro";
import { ComissWithMiss } from "services/routes/cegep/comiss";
import { DIARIA_MINIMA, buildMetricas } from "./metricas";
import { MetricaCard } from "./MetricaCard";
import { SectionWrapper } from "../../../components/SectionWrapper";
import { progressColor } from "../../comissDerivacoes";

/** buildMetricas devolve sempre Previsto, Computado e Restante nesta ordem. */
const PESO_POR_POSICAO = ["referencia", "cumprido", "acao"] as const;

export function ComissMetricas({ comiss }: { comiss: ComissWithMiss }) {
   const metricas = buildMetricas(comiss);

   return (
      <SectionWrapper title="Métricas">
         <div className="space-y-4">
            {!comiss.dias_cumprir && (
               <div className="flex items-center gap-2 rounded border border-blue-200 bg-blue-50 p-2 text-xs text-blue-800">
                  <IoMdInformationCircleOutline className="size-4 shrink-0 text-blue-600" />
                  <span>
                     Calculo baseado na menor diaria (
                     {realCurrency(DIARIA_MINIMA)})
                  </span>
               </div>
            )}

            {/* Mesma hierarquia da listagem: referencia, cumprido e o
                restante em destaque. */}
            <div className="grid grid-cols-3 gap-4">
               {metricas.map((m, i) => (
                  <MetricaCard
                     key={m.label}
                     config={m}
                     peso={PESO_POR_POSICAO[i] ?? "acao"}
                  />
               ))}
            </div>

            <div className="space-y-2">
               <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-600">Completude</span>
                  <span className="font-semibold text-gray-900 tabular-nums">
                     {`${comiss.completude}%`}
                  </span>
               </div>
               <Progress
                  progress={comiss.completude}
                  size="lg"
                  textLabel={`Completude ${comiss.completude}%`}
                  color={progressColor(comiss)}
               />
            </div>
         </div>
      </SectionWrapper>
   );
}
