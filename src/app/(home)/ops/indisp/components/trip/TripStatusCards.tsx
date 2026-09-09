"use client";

import clsx from "clsx";
import { formatDateFull, isoStrToDate } from "utils/dateHandler";
import type { RestricaoDerivada } from "services/routes/ops/restricoes";
import {
   daysSinceLastFlight,
   filterRestricoesForDate,
} from "../../utils/indispStatus";

export function CemalCard({
   cemal,
   restricoesDerivadas,
}: {
   cemal: string | null;
   restricoesDerivadas: RestricaoDerivada[];
}) {
   const cemalDate = cemal ? isoStrToDate(cemal) : null;
   const cemalRestricao = filterRestricoesForDate(
      restricoesDerivadas,
      new Date()
   ).find((restricao) => restricao.origem === "cemal");
   const isValid = !cemalRestricao;

   return (
      <div
         className={clsx(
            "rounded border p-3 text-center",
            isValid
               ? "border-emerald-200 bg-emerald-50"
               : cemalDate
                 ? "border-purple-200 bg-purple-50"
                 : "border-slate-200 bg-gray-50"
         )}
      >
         <p className="text-xs font-medium text-gray-500 uppercase">CEMAL</p>
         <p
            className={clsx(
               "mt-1 text-sm font-bold",
               isValid
                  ? "text-emerald-700"
                  : cemalDate
                    ? "text-purple-700"
                    : "text-gray-600"
            )}
         >
            {cemalDate ? formatDateFull(cemal) : "Sem registro"}
         </p>
         <p
            className={clsx(
               "text-xs",
               isValid
                  ? "text-emerald-600"
                  : cemalDate
                    ? "text-purple-600"
                    : "text-gray-500"
            )}
         >
            {isValid ? "Válido" : cemalDate ? "Expirado" : "Não informado"}
         </p>
      </div>
   );
}

export function UltVooCard({
   dataUltVoo,
   elegivelDesadaptacao,
   restricoesDerivadas,
}: {
   dataUltVoo: string | null;
   elegivelDesadaptacao: boolean;
   restricoesDerivadas: RestricaoDerivada[];
}) {
   const ultVooDate = dataUltVoo ? isoStrToDate(dataUltVoo) : null;
   const restricoesHoje = filterRestricoesForDate(
      restricoesDerivadas,
      new Date()
   );
   const desadaptado = restricoesHoje.some(
      (restricao) => restricao.codigo === "desadaptacao"
   );
   const days = daysSinceLastFlight(ultVooDate, new Date());

   const cardClass = !elegivelDesadaptacao
      ? "border-slate-200 bg-gray-50"
      : desadaptado
        ? "border-slate-200 bg-slate-50"
        : ultVooDate
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-200 bg-gray-50";

   const textClass = !elegivelDesadaptacao
      ? "text-gray-600"
      : desadaptado
        ? "text-slate-700"
        : ultVooDate
          ? "text-emerald-700"
          : "text-gray-600";

   const subTextClass = !elegivelDesadaptacao
      ? "text-gray-500"
      : desadaptado
        ? "text-slate-600"
        : ultVooDate
          ? "text-emerald-600"
          : "text-gray-500";

   const statusText = !elegivelDesadaptacao
      ? "Não elegível"
      : desadaptado
        ? `Desadaptado (${days}d)`
        : days !== null
          ? `${days} dia${days !== 1 ? "s" : ""} atrás`
          : "Sem dados";

   return (
      <div className={clsx("rounded border p-3 text-center", cardClass)}>
         <p className="text-xs font-medium text-gray-500 uppercase">
            Último Voo
         </p>
         <p className={clsx("mt-1 text-sm font-bold", textClass)}>
            {ultVooDate ? formatDateFull(dataUltVoo) : "Sem registro"}
         </p>
         <p className={clsx("text-xs", subTextClass)}>{statusText}</p>
      </div>
   );
}
