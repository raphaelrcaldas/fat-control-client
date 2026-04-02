"use client";

import { useState } from "react";
import { Select, Spinner, Label } from "flowbite-react";
import clsx from "clsx";
import { useHorasAnv } from "@/hooks/queries";
import { YEAR_OPTIONS } from "../esfaer/constants";
import { HorasAnvTable } from "./components/HorasAnvTable";

export default function HorasAnvPage() {
   const currentYear = new Date().getFullYear();
   const [anoRef, setAnoRef] = useState(currentYear);

   const { data, isLoading, isFetching } = useHorasAnv(anoRef);

   const isRefetching = !isLoading && isFetching;

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
         <div className="mb-2 flex shrink-0 items-center justify-between px-4 py-2">
            <div>
               <h1 className="text-xl font-semibold text-gray-900">
                  Horas por Aeronave
               </h1>
               <h2 className="text-gray-400">Voadas pelo 1º/1º GT</h2>
            </div>
            <div className="flex items-center gap-4">
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

         {!data || data.items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-gray-200 bg-white p-8">
               <p className="text-sm text-gray-500">
                  Nenhum dado encontrado para {anoRef}.
               </p>
            </div>
         ) : (
            <div
               className={clsx(
                  "p-6 transition-opacity duration-200",
                  isRefetching && "pointer-events-none opacity-50"
               )}
            >
               <HorasAnvTable data={data} />
            </div>
         )}
      </div>
   );
}
