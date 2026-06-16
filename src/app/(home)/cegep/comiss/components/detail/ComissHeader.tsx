"use client";

import { Button } from "flowbite-react";
import { HiArrowLeft, HiDocumentText, HiExclamation } from "react-icons/hi";
import { RiFileExcel2Fill } from "react-icons/ri";
import { ComissWithMiss } from "services/routes/cegep/comiss";
import { PermBased } from "@/app/(home)/hooks/usePermBased";
import { formatSaram } from "@/constants";

interface ComissHeaderProps {
   comiss: ComissWithMiss;
   isBusy: boolean;
   onClose: () => void;
   onExportSheet: () => void;
   onExportDocx: () => void;
}

export function ComissHeader({
   comiss,
   isBusy,
   onClose,
   onExportSheet,
   onExportDocx,
}: ComissHeaderProps) {
   const semMissoes = !comiss.missoes?.length;

   return (
      <>
         {/* Header: voltar + nome do militar + exportações */}
         <div className="flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-4 shadow-sm sm:gap-4 sm:px-4">
            <button
               onClick={onClose}
               className="flex shrink-0 items-center gap-2 rounded px-2 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:px-3"
            >
               <HiArrowLeft className="h-4 w-4" />
               <span className="hidden sm:inline">Voltar</span>
            </button>

            {/* Nome do militar — ocupa o centro e trunca */}
            <div className="min-w-0 flex-1 text-center">
               <h3 className="truncate text-base font-bold tracking-wide text-gray-900 uppercase sm:text-lg">
                  {comiss.user.posto.mid} {comiss.user.nome_guerra}
               </h3>
               <p className="truncate text-sm text-gray-600 capitalize">
                  {comiss.user.nome_completo} ({formatSaram(comiss.user.saram)})
               </p>
            </div>

            {/* Botões de exportação */}
            <PermBased resource={"comiss"} requiredPerm={"create"}>
               <div className="flex shrink-0 gap-2">
                  <Button
                     color="light"
                     onClick={onExportSheet}
                     disabled={semMissoes || isBusy}
                     className="bg-white transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
                  >
                     <div className="flex items-center gap-2">
                        <RiFileExcel2Fill className="size-5 text-green-600" />
                        <span className="hidden font-semibold sm:inline">
                           Planilha
                        </span>
                     </div>
                  </Button>
                  <Button
                     color="light"
                     onClick={onExportDocx}
                     disabled={semMissoes || isBusy}
                     className="bg-white transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
                  >
                     <div className="flex items-center gap-2">
                        <HiDocumentText className="size-5 text-blue-600" />
                        <span className="hidden font-semibold sm:inline">
                           Apostila
                        </span>
                     </div>
                  </Button>
               </div>
            </PermBased>
         </div>

         {/* Integridade dos valores computados (verificada no backend) */}
         {comiss.cache_inconsistente && (
            <div className="flex items-start gap-2 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
               <HiExclamation className="mt-0.5 h-5 w-5 shrink-0 animate-pulse text-red-500" />
               <span>
                  Integridade comprometida: os valores computados deste
                  comissionamento podem estar desatualizados. Reabra e salve as
                  missões afetadas para recalcular.
               </span>
            </div>
         )}
      </>
   );
}
