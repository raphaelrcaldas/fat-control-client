import { Progress } from "flowbite-react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { realCurrency } from "utils/financeiro";
import { ComissWithMiss } from "services/routes/cegep/comiss";
import { DIARIA_MINIMA, buildMetricas } from "./metricas";
import { MetricaCard } from "./MetricaCard";

export function ComissMetricas({ comiss }: { comiss: ComissWithMiss }) {
   const metricas = buildMetricas(comiss);

   return (
      <div className="space-y-4 rounded border border-slate-300 bg-white p-6 shadow-sm">
         {!comiss.dias_cumprir && (
            <div className="flex items-center gap-2 rounded border border-blue-200 bg-blue-50 p-2 text-xs text-blue-800">
               <IoMdInformationCircleOutline className="size-4 shrink-0 text-blue-600" />
               <span>
                  Calculo baseado na menor diaria ({realCurrency(DIARIA_MINIMA)}
                  )
               </span>
            </div>
         )}

         <div className="grid grid-cols-3 gap-4">
            {metricas.map((m) => (
               <MetricaCard key={m.label} config={m} />
            ))}
         </div>

         <div className="space-y-2">
            <div className="flex justify-between text-sm">
               <span className="text-gray-600">Progresso</span>
               <span className="font-semibold text-gray-900">
                  {`${comiss.completude}%`}
               </span>
            </div>
            <Progress
               progress={comiss.completude}
               size="lg"
               color={comiss.modulo ? "green" : "red"}
            />
         </div>
      </div>
   );
}
