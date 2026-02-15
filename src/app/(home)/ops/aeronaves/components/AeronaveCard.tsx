"use client";

import { HiPencil } from "react-icons/hi";
import { MdWarning } from "react-icons/md";
import { formatDateFull, isoStrToDate } from "utils/dateHandler";
import type { AeronavePublic } from "services/routes/aeronaves";

interface AeronaveCardProps {
   aeronave: AeronavePublic;
   onEdit: (aeronave: AeronavePublic) => void;
}

function isInspAlerta(dateStr: string | null): boolean {
   if (!dateStr) return false;
   const diff = isoStrToDate(dateStr).getTime() - Date.now();
   const days = diff / (1000 * 60 * 60 * 24);
   return days <= 30;
}

export function AeronaveCard({ aeronave, onEdit }: AeronaveCardProps) {
   const alerta = isInspAlerta(aeronave.prox_insp);

   return (
      <div
         className={`rounded-lg border bg-white shadow-sm ${!aeronave.active ? "border-gray-200 opacity-60" : "border-gray-200"}`}
      >
         {/* Header */}
         <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div className="flex items-center gap-3">
               <span className="text-lg font-bold text-gray-900">
                  {aeronave.matricula}
               </span>
               {aeronave.sit}
            </div>
            <button
               onClick={() => onEdit(aeronave)}
               className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
            >
               <HiPencil className="h-4 w-4" />
            </button>
         </div>

         {/* Body */}
         <div className="space-y-2 px-4 py-3">
            {aeronave.obs && (
               <p className="text-sm text-gray-600">{aeronave.obs}</p>
            )}

            <div className="flex items-center justify-between">
               {aeronave.prox_insp ? (
                  <span
                     className={`inline-flex items-center gap-1 text-sm ${
                        alerta ? "font-semibold text-red-600" : "text-gray-600"
                     }`}
                  >
                     {alerta && <MdWarning className="h-4 w-4" />}
                     Inspeção: {formatDateFull(aeronave.prox_insp)}
                  </span>
               ) : (
                  <span className="text-sm text-gray-400">
                     Sem inspeção agendada
                  </span>
               )}

               <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                     aeronave.active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                  }`}
               >
                  {aeronave.active ? "Ativa" : "Inativa"}
               </span>
            </div>
         </div>
      </div>
   );
}
