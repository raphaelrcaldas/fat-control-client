"use client";

import { HiPencil } from "react-icons/hi";
import type { AeronavePublic } from "services/routes/aeronaves";
import { PermBased } from "@/app/(home)/hooks/usePermBased";
import clsx from "clsx";

interface AeronaveCardProps {
   aeronave: AeronavePublic;
   onEdit: (aeronave: AeronavePublic) => void;
}

const SIT_COLORS: Record<string, string> = {
   DI: "bg-emerald-500",
   DO: "bg-orange-500",
   IN: "bg-red-500",
   IS: "bg-gray-400",
};

export function AeronaveCard({ aeronave, onEdit }: AeronaveCardProps) {
   return (
      <div
         className={clsx(
            "rounded border border-slate-200 shadow-sm",
            aeronave.active ? "bg-white" : "bg-gray-50/60"
         )}
      >
         <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
               <span
                  className={clsx(
                     "inline-flex w-12 shrink-0 items-center justify-center rounded py-1 text-sm font-bold tracking-wide text-white",
                     SIT_COLORS[aeronave.sit]
                  )}
               >
                  {aeronave.sit}
               </span>
               <div className="min-w-0">
                  <div className="flex items-center gap-2">
                     <span
                        className={clsx(
                           "font-mono text-lg font-semibold tracking-wider",
                           aeronave.active
                              ? "text-gray-900"
                              : "text-gray-400 line-through"
                        )}
                     >
                        {aeronave.matricula}
                     </span>
                     {aeronave.is_sim && (
                        <span className="inline-flex items-center rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-purple-700 uppercase ring-1 ring-purple-200 ring-inset">
                           SIM
                        </span>
                     )}
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-gray-600">
                     {aeronave.proj.modelo}{" "}
                     <span className="text-gray-400">
                        ({aeronave.proj.id_projeto})
                     </span>
                     {!aeronave.active && (
                        <span className="text-gray-500"> · Inativa</span>
                     )}
                  </p>
               </div>
            </div>
            <PermBased resource={"aeronaves"} requiredPerm={"update"}>
               <button
                  onClick={() => onEdit(aeronave)}
                  className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  aria-label={`Editar aeronave ${aeronave.matricula}`}
               >
                  <HiPencil className="h-4 w-4" />
               </button>
            </PermBased>
         </div>

         {aeronave.obs && (
            <div className="border-t border-slate-100 px-4 py-2.5">
               <p className="text-sm whitespace-pre-line text-gray-600">
                  {aeronave.obs}
               </p>
            </div>
         )}
      </div>
   );
}
