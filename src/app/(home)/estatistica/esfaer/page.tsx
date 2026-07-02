"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { useEsfAerResumo } from "@/hooks/queries";
import { getGroupSummaries } from "./utils";
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

   // Flag do simulador espelhada na URL (compartilhável); presente apenas
   // quando ligada — o padrão (desligada) mantém a URL limpa.
   const searchParams = useSearchParams();
   const router = useRouter();
   const showSimulador = searchParams.get("simulador") === "true";

   const setShowSimulador = useCallback(
      (value: boolean) => {
         const params = new URLSearchParams(searchParams.toString());
         if (value) {
            params.set("simulador", "true");
         } else {
            params.delete("simulador");
         }
         const qs = params.toString();
         router.replace(qs ? `?${qs}` : "?", { scroll: false });
      },
      [searchParams, router]
   );

   const { data, isLoading, isFetching } = useEsfAerResumo(
      anoRef,
      showSimulador
   );
   const isRefetching = !isLoading && isFetching;

   // O backend ja devolve itens e totais consistentes com a flag do
   // simulador; o front apenas exibe e deriva o agrupamento por grupo.
   const items = data?.items ?? [];
   const totalAlocado = data?.total_alocado ?? 0;
   const totalVoado = data?.total_voado ?? 0;
   const totalSaldo = data?.total_saldo ?? 0;
   const totalMesesVoados = data?.total_meses_voados ?? Array(12).fill(0);
   const groupSummaries = useMemo(() => getGroupSummaries(items), [items]);

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
