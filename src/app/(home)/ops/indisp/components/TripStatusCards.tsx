"use client";

import clsx from "clsx";
import { isoStrToDate, formatDateFull } from "utils/dateHandler";
import { CrewIndisp } from "services/routes/indisps";
import {
   isCemalValid,
   isDesadaptado,
   isElegivelDesadapta,
   daysSinceLastFlight,
} from "../utils/indispStatus";

export function CemalCard({ cemal }: { cemal: string | null }) {
   const cemalDate = cemal ? isoStrToDate(cemal) : null;
   const isValid = cemalDate ? isCemalValid(cemalDate, new Date()) : false;

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
   trip,
}: {
   dataUltVoo: string | null;
   trip: CrewIndisp;
}) {
   const ultVooDate = dataUltVoo ? isoStrToDate(dataUltVoo) : null;
   const isEligible = isElegivelDesadapta(trip);
   const days = daysSinceLastFlight(ultVooDate, new Date());
   const desadaptado = isDesadaptado(ultVooDate, new Date(), trip);

   const cardClass = !isEligible
      ? "border-slate-200 bg-gray-50"
      : desadaptado
        ? "border-slate-200 bg-slate-50"
        : ultVooDate
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-200 bg-gray-50";

   const textClass = !isEligible
      ? "text-gray-600"
      : desadaptado
        ? "text-slate-700"
        : ultVooDate
          ? "text-emerald-700"
          : "text-gray-600";

   const subTextClass = !isEligible
      ? "text-gray-500"
      : desadaptado
        ? "text-slate-600"
        : ultVooDate
          ? "text-emerald-600"
          : "text-gray-500";

   const statusText = !isEligible
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
