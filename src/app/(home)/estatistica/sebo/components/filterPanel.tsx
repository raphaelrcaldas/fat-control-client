"use client";
import { useMemo } from "react";
import { Select } from "flowbite-react";
import { INFO_COLUMNS, PILOT_ONLY_COLUMNS, type InfoColumn } from "../page";

const INFO_LABELS: Record<InfoColumn, string> = {
   cemal: "CEMAL",
   tovn: "TOVN",
   imae: "IMAE",
   crm: "CRM",
   val_pass: "PASS",
   val_visa: "VISA",
   cvi: "CVI",
   ptai: "PTAI",
};

interface FilterPanelProps {
   seboFunc: string;
   setSeboFunc: (value: string) => void;
   opIn: boolean;
   setOpIn: (value: boolean) => void;
   opOp: boolean;
   setOpOp: (value: boolean) => void;
   opAl: boolean;
   setOpAl: (value: boolean) => void;
   soO3: boolean;
   setSoO3: (value: boolean) => void;
   ano: number;
   setAno: (value: number) => void;
   totalResults: number;
   isLoading: boolean;
   infoCols: Record<InfoColumn, boolean>;
   setInfoCols: (value: Record<InfoColumn, boolean>) => void;
}

const FilterPanel = ({
   seboFunc,
   setSeboFunc,
   opIn,
   setOpIn,
   opOp,
   setOpOp,
   opAl,
   setOpAl,
   soO3,
   setSoO3,
   ano,
   setAno,
   totalResults,
   isLoading,
   infoCols,
   setInfoCols,
}: FilterPanelProps) => {
   const currentYear = new Date().getFullYear();
   const yearOptions = useMemo(() => {
      const years: number[] = [];
      for (let y = currentYear; y >= 2020; y--) {
         years.push(y);
      }
      return years;
   }, [currentYear]);

   const funcOptions = [
      { value: "pil", label: "Piloto", icon: "✈️" },
      { value: "mc", label: "Mecânico", icon: "🔧" },
      { value: "lm", label: "LoadMaster", icon: "📦" },
      { value: "tf", label: "Comissário", icon: "👔" },
      { value: "os", label: "Obs SAR", icon: "🔍" },
      { value: "oe", label: "OE", icon: "⚙️" },
   ];

   const operationFilters = [
      {
         id: "IN",
         label: "IN",
         checked: opIn,
         onChange: setOpIn,
         color: "red",
      },
      {
         id: "OP",
         label: "OP",
         checked: opOp,
         onChange: setOpOp,
         color: "yellow",
      },
      {
         id: "AL",
         label: "AL",
         checked: opAl,
         onChange: setOpAl,
         color: "green",
      },
   ];

   const getActiveFilters = () => {
      const filters: string[] = [];
      if (opIn) filters.push("IN");
      if (opOp) filters.push("OP");
      if (opAl) filters.push("AL");
      return filters;
   };

   return (
      <div className="space-y-4 rounded-xl bg-white p-3 shadow-lg">
         <div className="flex flex-wrap gap-3">
            <div className="w-36">
               <label className="mb-2 block text-center text-sm font-medium text-gray-700">
                  Função
               </label>
               <Select
                  value={seboFunc}
                  onChange={(e) => setSeboFunc(e.target.value)}
                  className=""
               >
                  {funcOptions.map((option) => (
                     <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                     </option>
                  ))}
               </Select>
            </div>
            <div>
               <label className="mb-3 block text-center text-sm font-medium text-gray-700">
                  Operacionalidade
               </label>
               <div className="flex flex-wrap gap-1">
                  {operationFilters.map((filter) => (
                     <button
                        key={filter.id}
                        onClick={() => filter.onChange(!filter.checked)}
                        className={`rounded-lg px-2 py-1.5 font-medium transition-all duration-200 ${
                           filter.checked
                              ? filter.color === "red"
                                 ? "bg-red-500 text-white shadow-md hover:bg-red-600"
                                 : filter.color === "yellow"
                                   ? "bg-yellow-400 text-gray-800 shadow-md hover:bg-yellow-500"
                                   : "bg-green-500 text-white shadow-md hover:bg-green-600"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        } transform hover:scale-105 active:scale-95`}
                     >
                        <span className="w-8 gap-1 p-1 text-center">
                           {/* {filter.checked ? (
                              <svg
                                 className="h-5 w-5"
                                 fill="currentColor"
                                 viewBox="0 0 20 20"
                              >
                                 <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                 />
                              </svg>
                           ) : (
                              <svg
                                 className="h-5 w-5"
                                 fill="none"
                                 stroke="currentColor"
                                 viewBox="0 0 24 24"
                              >
                                 <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                 />
                              </svg>
                           )} */}
                           {filter.label}
                        </span>
                     </button>
                  ))}
               </div>
            </div>

            {/* Toggle O3 - apenas para pilotos */}
            {seboFunc === "pil" && (
               <div className="flex w-fit flex-col items-center">
                  <label className="mb-3 block text-sm font-medium text-gray-700">
                     OE
                  </label>
                  <button
                     onClick={() => setSoO3(!soO3)}
                     className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                        soO3
                           ? "bg-blue-500 text-white shadow-md hover:bg-blue-600"
                           : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                     } transform hover:scale-105 active:scale-95`}
                  >
                     {soO3 ? (
                        <svg
                           className="h-5 w-5"
                           fill="currentColor"
                           viewBox="0 0 20 20"
                        >
                           <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                           />
                        </svg>
                     ) : (
                        <svg
                           className="h-5 w-5"
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24"
                        >
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                           />
                        </svg>
                     )}
                  </button>
               </div>
            )}

            {/* Colunas Info */}
            <div className="hidden sm:block">
               <label className="mb-3 block text-center text-sm font-medium text-gray-700">
                  Cartões
               </label>
               <div className="flex flex-wrap gap-1">
                  {INFO_COLUMNS.filter(
                     (col) =>
                        seboFunc === "pil" || !PILOT_ONLY_COLUMNS.includes(col)
                  ).map((col) => (
                     <button
                        key={col}
                        onClick={() =>
                           setInfoCols({ ...infoCols, [col]: !infoCols[col] })
                        }
                        className={`rounded-lg px-3 py-2 text-sm font-medium uppercase transition-all duration-200 ${
                           infoCols[col]
                              ? "bg-cyan-500 text-white shadow-md hover:bg-cyan-600"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        } transform hover:scale-105 active:scale-95`}
                     >
                        {INFO_LABELS[col]}
                     </button>
                  ))}
               </div>
            </div>

            {/* Ano - alinhado à direita */}
            <div className="min-w-24 sm:ml-auto">
               <label className="mb-2 block text-center text-sm font-medium text-gray-700">
                  Ano
               </label>
               <Select
                  value={ano}
                  onChange={(e) => setAno(Number(e.target.value))}
               >
                  {yearOptions.map((y) => (
                     <option key={y} value={y}>
                        {y}
                     </option>
                  ))}
               </Select>
            </div>
         </div>

         {/* Results Summary */}
         <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
               <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
               >
                  <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth={2}
                     d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
               </svg>
               <span>
                  Filtros ativos:{" "}
                  <span className="font-semibold">
                     {getActiveFilters().join(", ") || "Nenhum"}
                  </span>
               </span>
            </div>
            <div className="text-sm">
               {isLoading ? (
                  <span className="animate-pulse text-gray-500">
                     Carregando...
                  </span>
               ) : (
                  <span className="font-semibold text-gray-900">
                     {totalResults}{" "}
                     {totalResults === 1 ? "resultado" : "resultados"}
                  </span>
               )}
            </div>
         </div>
      </div>
   );
};

export default FilterPanel;
