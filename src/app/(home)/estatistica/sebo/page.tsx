"use client";
import { useState, useMemo, useCallback } from "react";
import { useSebo } from "@/hooks/queries";
import { usePersistedState } from "@/hooks/usePersistedState";
import { FUNCOES_CONFIG, type FuncType } from "@/constants/tripulantes/funcoes";
import FilterPanel from "./components/filterPanel";
import SeboTable from "./components/seboTable";
import SeboChart from "./components/seboChart";

function SeboPage() {
   const [activeRow, setActiveRow] = useState(0);

   const [opIn, setOpIn] = useState(true);
   const [opOp, setOpOp] = useState(true);
   const [opAl, setOpAl] = useState(false);

   const [seboFunc, setSeboFuncRaw] = usePersistedState(
      "estatistica.seboFunc",
      "mc"
   );

   const [selectedPosicoes, setSelectedPosicoes] = useState<string[]>(() => {
      const config = FUNCOES_CONFIG[seboFunc as FuncType];
      return config?.posicoes.map((p) => p.codigo) ?? [];
   });
   const [ano, setAno] = useState(() => new Date().getFullYear());

   const setSeboFunc = useCallback(
      (value: string) => {
         setSeboFuncRaw(value);
         const config = FUNCOES_CONFIG[value as FuncType];
         setSelectedPosicoes(config?.posicoes.map((p) => p.codigo) ?? []);
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

   // Quando todas as posicoes estao selecionadas, nao enviar func_bordo
   const allPosSelected = useMemo(() => {
      const posicoes = FUNCOES_CONFIG[seboFunc as FuncType]?.posicoes ?? [];
      return (
         posicoes.length > 0 &&
         posicoes.every((p) => selectedPosicoes.includes(p.codigo))
      );
   }, [seboFunc, selectedPosicoes]);

   const { data: rawTrips, isLoading } = useSebo({
      func: seboFunc,
      oper: allActive || operParams.length === 0 ? undefined : operParams,
      func_bordo:
         allPosSelected || selectedPosicoes.length === 0
            ? undefined
            : selectedPosicoes,
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
            selectedPosicoes={selectedPosicoes}
            setSelectedPosicoes={setSelectedPosicoes}
            ano={ano}
            setAno={setAno}
            totalResults={sortedTrips.length}
            isLoading={isLoading}
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
                        categories={sortedTrips.map((trip) => trip.trig)}
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
