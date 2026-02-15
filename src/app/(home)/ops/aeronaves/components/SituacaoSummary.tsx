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
      iconColor: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
   },
   {
      sit: "DO",
      label: "Com Restrição",
      icon: MdWarning,
      iconColor: "text-yellow-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-700",
   },
   {
      sit: "IN",
      label: "Indisponíveis",
      icon: MdCancel,
      iconColor: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-700",
   },
   {
      sit: "IS",
      label: "Em Inspeção",
      icon: MdBuild,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
   },
] as const;

interface SituacaoSummaryProps {
   aeronaves: AeronavePublic[];
}

export function SituacaoSummary({ aeronaves }: SituacaoSummaryProps) {
   const activeAeronaves = aeronaves.filter((a) => a.active);
   const counts = SITUACAO_CARDS.map((card) => ({
      ...card,
      count: activeAeronaves.filter((a) => a.sit === card.sit).length,
   }));

   const totalActive = activeAeronaves.length;
   const totalInactive = aeronaves.length - totalActive;

   return (
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
         {/* Total */}
         <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
            <div className="rounded-lg bg-gray-100 p-2">
               <MdFlightTakeoff className="h-5 w-5 text-gray-600" />
            </div>
            <div>
               <p className="text-2xl font-bold text-gray-900">{totalActive}</p>
               <p className="text-xs text-gray-500">
                  Ativas
                  {totalInactive > 0 &&
                     ` (${totalInactive} inativa${totalInactive > 1 ? "s" : ""})`}
               </p>
            </div>
         </div>

         {/* Per situation */}
         {counts.map((item) => {
            const Icon = item.icon;
            return (
               <div
                  key={item.sit}
                  className={`flex items-center gap-3 rounded-lg border ${item.borderColor} ${item.bgColor} p-3 shadow-sm`}
               >
                  <div className={`rounded-lg bg-white/70 p-2`}>
                     <Icon className={`h-5 w-5 ${item.iconColor}`} />
                  </div>
                  <div>
                     <p className={`text-2xl font-bold ${item.textColor}`}>
                        {item.count}
                     </p>
                     <p className="text-xs text-gray-600">{item.label}</p>
                  </div>
               </div>
            );
         })}
      </div>
   );
}
