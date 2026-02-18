"use client";

import { HiPencil } from "react-icons/hi";
import type { AeronavePublic } from "services/routes/aeronaves";
import { PermBased } from "@/app/(home)/hooks/usePermBased";
import clsx from "clsx";

interface AeronaveCardProps {
   aeronave: AeronavePublic;
   onEdit: (aeronave: AeronavePublic) => void;
}

export function AeronaveCard({ aeronave, onEdit }: AeronaveCardProps) {
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

               <span
                  className={clsx(
                     "grid w-10 justify-items-center rounded p-2 font-bold text-white",
                     {
                        "bg-emerald-400": aeronave.sit == "DI",
                        "bg-red-400": aeronave.sit == "IN",
                        "bg-gray-400": aeronave.sit == "IS",
                        "bg-orange-400": aeronave.sit == "DO",
                     }
                  )}
               >
                  {aeronave.sit}
               </span>
            </div>
            <PermBased resource={"aeronaves"} requiredPerm={"update"}>
               <button
                  onClick={() => onEdit(aeronave)}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
               >
                  <HiPencil className="h-4 w-4" />
               </button>
            </PermBased>
         </div>

         {/* Body */}
         <div className="space-y-2 px-4 py-3">
            {aeronave.obs && (
               <p className="text-sm whitespace-pre-line text-gray-600">
                  {aeronave.obs}
               </p>
            )}

            <div className="flex items-center justify-end">
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
