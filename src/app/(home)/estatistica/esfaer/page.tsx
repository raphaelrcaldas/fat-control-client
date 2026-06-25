"use client";

import { useState } from "react";
import clsx from "clsx";
import { useEsfAerResumo } from "@/hooks/queries";
import { useEsfAerTotals } from "./hooks/useEsfAerTotals";
import { EsfAerHeader } from "./components/EsfAerHeader";
import { EsfAerSkeleton } from "./components/EsfAerSkeleton";
import { EsfAerGroupCards } from "./components/EsfAerGroupCards";
import { EsfAerTable } from "./components/EsfAerTable";
import { EsfAerAlertTable } from "./components/EsfAerAlertTable";
import { EsfAerChartLine } from "./components/EsfAerChartLine";
import { EsfAerChartTable } from "./components/EsfAerChartTable";
import { ImportModal } from "./components/import/ImportModal";
import { PermBased } from "../../hooks/usePermBased";

export default function EsfAerPage() {
   const currentYear = new Date().getFullYear();
   const [anoRef, setAnoRef] = useState(currentYear);
   const [showImportModal, setShowImportModal] = useState(false);
   const [showSimulador, setShowSimulador] = useState(false);

   const { data, isLoading, isFetching } = useEsfAerResumo(anoRef);
   const isRefetching = !isLoading && isFetching;

   const {
      items,
      totalAlocado,
      totalVoado,
      totalSaldo,
      totalMesesVoados,
      groupSummaries,
   } = useEsfAerTotals(data?.items ?? [], showSimulador);

   return (
      <div className="space-y-2">
         <EsfAerHeader
            anoRef={anoRef}
            onAnoRefChange={setAnoRef}
            showSimulador={showSimulador}
            onShowSimuladorChange={setShowSimulador}
            onImport={() => setShowImportModal(true)}
         />

         {isLoading ? (
            <EsfAerSkeleton />
         ) : items.length === 0 ? (
            <div className="flex items-center justify-center rounded border border-slate-200 bg-white py-16 shadow-sm">
               <p className="text-sm text-gray-500">
                  Nenhum esforço aéreo alocado ou voado para {anoRef}.
               </p>
            </div>
         ) : (
            <div
               className={clsx(
                  "grid justify-items-center gap-2 overflow-hidden transition-opacity duration-200",
                  isRefetching && "pointer-events-none opacity-50"
               )}
            >
               <PermBased resource="esfaer" requiredPerm="create">
                  <EsfAerAlertTable items={items} />
               </PermBased>
               <EsfAerTable
                  items={items}
                  totalAlocado={totalAlocado}
                  totalVoado={totalVoado}
                  totalSaldo={totalSaldo}
                  totalMesesVoados={totalMesesVoados}
               />
               <EsfAerGroupCards groups={groupSummaries} />

               <div className="col-span-full hidden grid-cols-1 gap-4 lg:grid lg:grid-cols-3">
                  <div className="lg:col-span-2">
                     <EsfAerChartLine
                        totalAlocado={totalAlocado}
                        totalMeses={totalMesesVoados}
                     />
                  </div>
                  <div className="lg:col-span-1">
                     <EsfAerChartTable
                        totalAlocado={totalAlocado}
                        totalMeses={totalMesesVoados}
                     />
                  </div>
               </div>
            </div>
         )}

         <ImportModal
            show={showImportModal}
            setShow={setShowImportModal}
            anoRef={anoRef}
         />
      </div>
   );
}
