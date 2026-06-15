"use client";

import {
   MdCheckCircle,
   MdWarning,
   MdCancel,
   MdBuild,
   MdFlightTakeoff,
} from "react-icons/md";
import type { AeronavePublic } from "services/routes/aeronaves";

const SITUACAO_CARDS = [
   {
      sit: "DI",
      label: "Disponíveis",
      icon: MdCheckCircle,
      accent: "bg-emerald-500",
      iconColor: "text-emerald-500",
   },
   {
      sit: "DO",
      label: "C/ Restrição",
      icon: MdWarning,
      accent: "bg-orange-500",
      iconColor: "text-orange-500",
   },
   {
      sit: "IN",
      label: "Indisponíveis",
      icon: MdCancel,
      accent: "bg-red-500",
      iconColor: "text-red-500",
   },
   {
      sit: "IS",
      label: "Em Inspeção",
      icon: MdBuild,
      accent: "bg-gray-400",
      iconColor: "text-gray-500",
   },
] as const;

interface SituacaoSummaryProps {
   aeronaves: AeronavePublic[];
}

export function SituacaoSummary({ aeronaves }: SituacaoSummaryProps) {
   const activeAeronaves = aeronaves.filter((a) => a.active);
   const totalActive = activeAeronaves.length;
   const totalInactive = aeronaves.length - totalActive;

   const counts = SITUACAO_CARDS.map((card) => ({
      ...card,
      count: activeAeronaves.filter((a) => a.sit === card.sit).length,
   }));

   return (
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
         {/* Total */}
         <div className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
            <div className="min-w-0">
               <p className="text-[11px] font-medium tracking-wide text-gray-500 uppercase">
                  Ativas
               </p>
               <p className="mt-0.5 text-2xl font-semibold text-gray-900">
                  {totalActive}
                  {totalInactive > 0 && (
                     <span className="ml-1 text-sm font-normal text-gray-400">
                        / {aeronaves.length}
                     </span>
                  )}
               </p>
            </div>
            <MdFlightTakeoff className="h-5 w-5 shrink-0 text-gray-400" />
         </div>

         {/* Per situation */}
         {counts.map((item) => {
            const Icon = item.icon;
            return (
               <div
                  key={item.sit}
                  className="relative flex items-center justify-between overflow-hidden rounded border border-slate-200 bg-white px-3 py-2.5 shadow-sm"
               >
                  <span
                     className={`absolute top-0 bottom-0 left-0 w-1 ${item.accent}`}
                     aria-hidden="true"
                  />
                  <div className="min-w-0 pl-1">
                     <p className="text-[11px] font-medium tracking-wide text-gray-500 uppercase">
                        {item.label}
                     </p>
                     <p className="mt-0.5 text-2xl font-semibold text-gray-900">
                        {item.count}
                     </p>
                  </div>
                  <Icon className={`h-5 w-5 shrink-0 ${item.iconColor}`} />
               </div>
            );
         })}
      </div>
   );
}
