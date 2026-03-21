"use client";
import { useState, useMemo, useCallback } from "react";
import { useSebo } from "@/hooks/queries";
import { usePersistedState } from "@/hooks/usePersistedState";
import FilterPanel from "./components/filterPanel";
import SeboTable from "./components/seboTable";
import SeboChart from "./components/seboChart";

export const INFO_COLUMNS = ["cemal", "tovn", "imae", "crm", "val_pass", "val_visa"] as const;
export type InfoColumn = (typeof INFO_COLUMNS)[number];

const defaultInfoCols: Record<InfoColumn, boolean> = {
   cemal: true,
   tovn: true,
   imae: true,
   crm: true,
   val_pass: false,
   val_visa: false,
};

function SeboPage() {
   const [activeRow, setActiveRow] = useState(0);

   const [opIn, setOpIn] = usePersistedState("estatistica.seboOpIn", true);
   const [opOp, setOpOp] = usePersistedState("estatistica.seboOpOp", true);
   const [opAl, setOpAl] = usePersistedState("estatistica.seboOpAl", false);

   const [infoCols, setInfoCols] = usePersistedState<Record<InfoColumn, boolean>>(
      "estatistica.seboInfoCols",
      defaultInfoCols
   );

   const [seboFunc, setSeboFuncRaw] = usePersistedState(
      "estatistica.seboFunc",
      "mc"
   );

   const [soO3, setSoO3] = useState(false);
   const [ano, setAno] = useState(() => new Date().getFullYear());

   const setSeboFunc = useCallback(
      (value: string) => {
         setSeboFuncRaw(value);
         setSoO3(false);
         setActiveRow(0);
      },
      [setSeboFuncRaw]
   );

   // Build oper array from toggle states to send to the API
   const operParams = useMemo(() => {
      const oper: string[] = [];
      if (opIn) oper.push("in");
      if (opOp) oper.push("op");
      if (opAl) oper.push("al");
      return oper;
   }, [opIn, opOp, opAl]);

   // Quando todos os filtros estao ativos, nao enviar oper (retorna todos)
   const allActive = opIn && opOp && opAl;

   // func_bordo: para pilotos, toggle O3 vs demais
   const funcBordo = useMemo(() => {
      if (seboFunc !== "pil") return undefined;
      if (soO3) return ["O3"];
      return ["1P", "2P", "IN", "AL"];
   }, [seboFunc, soO3]);

   const { data: rawTrips, isLoading } = useSebo({
      func: seboFunc,
      oper: allActive || operParams.length === 0 ? undefined : operParams,
      func_bordo: funcBordo,
      ano,
   });

   // Sort by h_ano DESC (most hours first)
   const sortedTrips = useMemo(() => {
      if (!rawTrips) return [];
      return [...rawTrips].sort((a, b) => b.voo.h_ano - a.voo.h_ano);
   }, [rawTrips]);

   return (
      <div className="min-h-screen bg-gray-50 p-2">
         {/* Header Section */}
         <div className="mb-3">
            <h1 className="mb-2 text-3xl font-bold text-gray-800">
               Pau de Sebo
            </h1>
         </div>

         {/* Filter Panel */}
         <FilterPanel
            seboFunc={seboFunc}
            setSeboFunc={setSeboFunc}
            opIn={opIn}
            setOpIn={setOpIn}
            opOp={opOp}
            setOpOp={setOpOp}
            opAl={opAl}
            setOpAl={setOpAl}
            soO3={soO3}
            setSoO3={setSoO3}
            ano={ano}
            setAno={setAno}
            totalResults={sortedTrips.length}
            isLoading={isLoading}
            infoCols={infoCols}
            setInfoCols={setInfoCols}
         />

         {/* Content Flex Layout */}
         <div className="mt-3 flex flex-col gap-3 xl:flex-row">
            {/* Table Section - Width auto (only necessary) */}
            <div className="w-auto">
               <SeboTable
                  trips={sortedTrips}
                  activeRow={activeRow}
                  setRow={setActiveRow}
                  isLoading={isLoading}
                  infoCols={infoCols}
               />
            </div>

            {/* Chart Section - Occupies remaining space */}
            {!isLoading && sortedTrips.length > 0 && (
               <div className="flex-1">
                  <div className="sticky top-4 rounded-xl bg-white p-4 shadow-lg">
                     <h3 className="mb-4 text-lg font-semibold text-gray-800">
                        Grafico de Horas de Voo
                     </h3>
                     <SeboChart
                        data={sortedTrips.map((trip) => trip.voo.h_ano)}
                        categories={sortedTrips.map((trip) => trip.trig.toUpperCase())}
                        activeRow={activeRow}
                        trips={sortedTrips}
                     />
                  </div>
               </div>
            )}
         </div>

         {/* Empty State */}
         {!isLoading && sortedTrips.length === 0 && (
            <div className="mt-12 text-center">
               <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
                  <svg
                     className="h-8 w-8 text-gray-400"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                     />
                  </svg>
               </div>
               <h3 className="mb-2 text-lg font-medium text-gray-900">
                  Nenhum resultado encontrado
               </h3>
               <p className="text-gray-600">
                  Tente ajustar os filtros ou a busca para encontrar o que
                  precisa.
               </p>
            </div>
         )}
      </div>
   );
}

export default SeboPage;
