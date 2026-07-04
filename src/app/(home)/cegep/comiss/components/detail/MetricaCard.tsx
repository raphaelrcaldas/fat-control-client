"use client";

import { Popover } from "flowbite-react";
import clsx from "clsx";
import { realCurrency } from "utils/financeiro";
import { DIARIA_MINIMA, MetricaConfig } from "./metricas";

/** Uma célula da grade de métricas. Substitui os 3 Popovers duplicados. */
export function MetricaCard({ config }: { config: MetricaConfig }) {
   const { label, hasPopover } = config;
   const negativo = hasPopover
      ? (config.valor ?? 0) < 0
      : (config.dias ?? 0) < 0;
   const valorClass = clsx(
      "font-bold",
      negativo ? "text-red-600" : "text-gray-900"
   );

   return (
      <div className="text-center">
         {hasPopover ? (
            <Popover
               content={<PopoverContent label={label} valor={config.valor!} />}
               trigger="hover"
            >
               <div className={clsx("cursor-help", valorClass)}>
                  {realCurrency(config.valor!)}
                  <div className="text-xs font-normal text-gray-500">
                     ~{(config.valor! / DIARIA_MINIMA).toFixed(1)} dias
                  </div>
               </div>
            </Popover>
         ) : (
            <div className={valorClass}>
               <span>
                  {config.dias}
                  <span className="ml-1 text-sm font-normal text-gray-500">
                     dias
                  </span>
               </span>
            </div>
         )}
         <div className="mt-1 text-xs tracking-wide text-gray-500 uppercase">
            {label}
         </div>
      </div>
   );
}

function PopoverContent({ label, valor }: { label: string; valor: number }) {
   return (
      <div className="max-w-xs p-3">
         <p className="mb-2 text-sm font-semibold text-gray-900">
            Valor {label}
         </p>
         <div className="space-y-1 text-sm text-gray-700">
            <p>
               <span className="font-medium">Valor:</span> {realCurrency(valor)}
            </p>
            <p>
               <span className="font-medium">Equivalente:</span> ~
               {(valor / DIARIA_MINIMA).toFixed(1)} dias
            </p>
            <p className="mt-2 text-xs text-gray-500">
               (baseado em {realCurrency(DIARIA_MINIMA)} por diaria)
            </p>
         </div>
      </div>
   );
}
