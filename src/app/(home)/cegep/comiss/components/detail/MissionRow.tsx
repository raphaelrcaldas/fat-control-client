"use client";

import { Button } from "flowbite-react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { HiExternalLink, HiExclamation } from "react-icons/hi";
import { realCurrency } from "utils/financeiro";
import { formatNaiveDate } from "utils/dateHandler";
import { Missao } from "services/routes/cegep/missoes";
import { PermBased } from "@/app/(home)/hooks/usePermBased";

interface MissionRowProps {
   mis: Missao;
   diasPrev: number | null;
   onShowDetail: () => void;
   onNavigate: () => void;
}

export function MissionRow({
   mis,
   diasPrev,
   onShowDetail,
   onNavigate,
}: MissionRowProps) {
   const ini = formatNaiveDate(mis.afast);
   const fim = formatNaiveDate(mis.regres);

   return (
      <div className="flex flex-col gap-3 p-4 transition-colors duration-200 hover:bg-gray-50 sm:flex-row sm:items-center sm:gap-4">
         {/* Linha 1 (mobile): documento + acoes | Desktop: itens viram colunas da linha */}
         <div className="flex items-center justify-between gap-2 sm:contents">
            <div className="w-20 shrink-0">
               <span className="font-mono text-sm font-semibold text-gray-900 uppercase">
                  {mis.tipo_doc} {mis.n_doc}
               </span>
            </div>
            <div className="flex shrink-0 gap-1 sm:order-last">
               <Button
                  size="sm"
                  color="light"
                  className="transition-colors duration-200 hover:bg-gray-100"
                  onClick={onShowDetail}
               >
                  <IoMdInformationCircleOutline size={18} />
               </Button>
               <PermBased resource={"comiss"} requiredPerm={"create"}>
                  <Button
                     size="sm"
                     color="light"
                     className="transition-colors duration-200 hover:bg-slate-100"
                     onClick={onNavigate}
                     title="Abrir missao"
                  >
                     <HiExternalLink size={18} />
                  </Button>
               </PermBased>
            </div>
         </div>

         <div className="min-w-0 flex-1">
            <span className="block truncate text-sm text-gray-700 uppercase">
               {mis.desc}
            </span>
         </div>

         {/* Linha 2 (mobile): datas + dias/valor | Desktop: itens viram colunas da linha */}
         <div className="flex items-center justify-between gap-2 sm:contents">
            <div className="flex shrink-0 gap-2">
               <span className="rounded border border-current/30 bg-emerald-50 px-2 py-1 font-mono text-sm text-gray-600">
                  {ini}
               </span>
               <span className="rounded border border-current/30 bg-orange-50 px-2 py-1 font-mono text-sm text-gray-600">
                  {fim}
               </span>
            </div>
            <div className="shrink-0 text-right sm:w-24">
               <span className="inline-flex items-center justify-end gap-1 text-sm font-semibold text-gray-900">
                  {mis.custo_inconsistente && (
                     <span title="Custo possivelmente desatualizado. Reabra e salve a missão para recalcular.">
                        <HiExclamation className="h-4 w-4 text-amber-500" />
                     </span>
                  )}
                  {diasPrev
                     ? `${mis.dias ?? 0} dia${(mis.dias ?? 0) > 1 ? "s" : ""}`
                     : realCurrency(mis.valor_total ?? 0)}
               </span>
            </div>
         </div>
      </div>
   );
}
