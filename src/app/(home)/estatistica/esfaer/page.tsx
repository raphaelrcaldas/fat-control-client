"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { Button } from "flowbite-react";
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

   const { data, isLoading, isFetching, isError, error, refetch } =
      useEsfAerResumo(anoRef, showSimulador);
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
         ) : isError && items.length === 0 ? (
            <div
               role="alert"
               className="flex flex-col items-center justify-center gap-1 rounded border border-slate-200 bg-white px-6 py-16 text-center shadow-sm"
            >
               <p className="text-sm font-semibold text-red-800">
                  Não foi possível carregar o esforço aéreo
               </p>
               <p className="max-w-md text-xs text-slate-500">
                  {error instanceof Error ? error.message : "Erro desconhecido"}
               </p>
               <Button
                  color="light"
                  size="sm"
                  className="mt-3"
                  onClick={() => refetch()}
                  disabled={isFetching}
               >
                  Tentar novamente
               </Button>
            </div>
         ) : items.length === 0 ? (
            <div className="flex items-center justify-center rounded border border-slate-200 bg-white py-16 shadow-sm">
               <p className="text-sm text-gray-500">
                  Nenhum esforço aéreo alocado ou voado para {anoRef}.
               </p>
            </div>
         ) : (
            <>
               {isError && (
                  <div
                     role="status"
                     className="flex flex-wrap items-center justify-between gap-2 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800"
                  >
                     <span>
                        Não foi possível atualizar o esforço aéreo. Exibindo a
                        última consulta.
                     </span>
                     <Button
                        color="light"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isFetching}
                     >
                        Tentar novamente
                     </Button>
                  </div>
               )}
               <div
                  className={clsx(
                     "grid justify-items-center gap-2 overflow-hidden transition-opacity duration-200",
                     isRefetching && "pointer-events-none opacity-50"
                  )}
               >
                  <PermBased
                     resource="estatistica.esf_aer"
                     requiredPerm="update"
                  >
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
            </>
         )}

         <ImportModal
            show={showImportModal}
            setShow={setShowImportModal}
            anoRef={anoRef}
         />
      </div>
   );
}
