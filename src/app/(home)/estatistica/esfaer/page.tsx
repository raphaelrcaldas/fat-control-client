"use client";

import { useMemo, useState } from "react";
import { Select, Spinner, Label, Button, Checkbox } from "flowbite-react";
import clsx from "clsx";
import { useEsfAerResumo } from "@/hooks/queries";
import { YEAR_OPTIONS } from "./constants";
import { getGroupSummaries } from "./utils";
import { EsfAerGroupCards } from "./components/EsfAerGroupCards";
import { EsfAerTable } from "./components/EsfAerTable";
import { EsfAerAlertTable } from "./components/EsfAerAlertTable";
import { EsfAerChartLine, EsfAerChartTable } from "./components/EsfAerChart";
import { ImportModal } from "./components/ImportModal";
import { PermBased } from "../../hooks/usePermBased";

export default function EsfAerPage() {
   const currentYear = new Date().getFullYear();
   const [anoRef, setAnoRef] = useState(currentYear);
   const [showImportModal, setShowImportModal] = useState(false);
   const [showSimulador, setShowSimulador] = useState(false);

   const { data, isLoading, isFetching } = useEsfAerResumo(anoRef);

   const isRefetching = !isLoading && isFetching;

   const allItems = data?.items ?? [];

   const { items, totalAlocado, totalVoado, totalSaldo, totalMesesVoados } =
      useMemo(() => {
         const filtered = showSimulador
            ? allItems
            : allItems.filter((i) => !i.descricao.includes("SML"));

         const zeros = () => Array(12).fill(0) as number[];

         return {
            items: filtered,
            totalAlocado: filtered.reduce((s, i) => s + i.alocado, 0),
            totalVoado: filtered.reduce((s, i) => s + i.voado, 0),
            totalSaldo: filtered.reduce((s, i) => s + i.saldo, 0),
            totalMesesVoados: filtered.reduce((acc, i) => {
               i.meses_voados.forEach((v, idx) => (acc[idx] += v));
               return acc;
            }, zeros()),
         };
      }, [allItems, showSimulador]);

   const groupSummaries = getGroupSummaries(items);

   if (isLoading) {
      return (
         <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
               <Spinner size="lg" color="failure" />
               <p className="text-sm text-gray-600">Carregando dados...</p>
            </div>
         </div>
      );
   }

   return (
      <div>
         {/* Header */}
         <div className="mb-2 flex shrink-0 items-center justify-between p-2">
            <h1 className="text-xl font-semibold text-gray-900">
               Esforço Aéreo
            </h1>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1.5">
                  <Checkbox
                     id="showSimulador"
                     checked={showSimulador}
                     color="red"
                     onChange={(e) => setShowSimulador(e.target.checked)}
                  />
                  <Label
                     htmlFor="showSimulador"
                     className="cursor-pointer text-sm text-gray-600"
                  >
                     Exibir simulador
                  </Label>
               </div>

               <PermBased resource="esfaer" requiredPerm="create">
                  <Button
                     color="red"
                     size="sm"
                     onClick={() => setShowImportModal(true)}
                  >
                     Importar
                  </Button>
               </PermBased>

               <Label htmlFor="anoRef" className="font-medium text-gray-700">
                  Ano Referência:
               </Label>
               <Select
                  id="anoRef"
                  value={anoRef}
                  onChange={(e) => setAnoRef(Number(e.target.value))}
                  className="w-24"
               >
                  {YEAR_OPTIONS.map((year) => (
                     <option key={year} value={year}>
                        {year}
                     </option>
                  ))}
               </Select>
            </div>
         </div>

         {/* Content */}
         {items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-gray-200 bg-white">
               <p className="text-sm text-gray-500">
                  Nenhum esforco aereo alocado ou voado para {anoRef}.
               </p>
            </div>
         ) : (
            <div
               className={clsx(
                  "grid justify-items-center gap-4 overflow-hidden transition-opacity duration-200",
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
