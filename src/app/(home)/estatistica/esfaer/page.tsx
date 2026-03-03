"use client";

import { useState } from "react";
import { Select, Spinner, Label } from "flowbite-react";
import clsx from "clsx";
import { useEsfAerResumo } from "@/hooks/queries";
import { YEAR_OPTIONS } from "./constants";
import { getGroupSummaries } from "./utils";
import { EsfAerGroupCards } from "./components/EsfAerGroupCards";
import { EsfAerTable } from "./components/EsfAerTable";
import { EsfAerChartLine, EsfAerChartTable } from "./components/EsfAerChart";

export default function EsfAerPage() {
   const currentYear = new Date().getFullYear();
   const [anoRef, setAnoRef] = useState(currentYear);

   const { data, isLoading, isFetching } = useEsfAerResumo(anoRef);

   const isRefetching = !isLoading && isFetching;

   const items = data?.items ?? [];
   const totalAlocado = data?.total_alocado ?? 0;
   const totalVoado = data?.total_voado ?? 0;
   const totalSaldo = data?.total_saldo ?? 0;
   const totalMeses = data?.total_meses ?? Array(12).fill(0);
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
               Esforço Aereo
            </h1>
            <div className="flex items-center gap-2">
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
               <EsfAerGroupCards groups={groupSummaries} />
               <EsfAerTable
                  items={items}
                  totalAlocado={totalAlocado}
                  totalVoado={totalVoado}
                  totalSaldo={totalSaldo}
                  totalMeses={totalMeses}
               />
               <div className="col-span-full grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                     <EsfAerChartLine
                        totalAlocado={totalAlocado}
                        totalMeses={totalMeses}
                     />
                  </div>
                  <div className="lg:col-span-1">
                     <EsfAerChartTable
                        totalAlocado={totalAlocado}
                        totalMeses={totalMeses}
                     />
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
