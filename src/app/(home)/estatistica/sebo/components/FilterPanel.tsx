"use client";
import { Label, Select } from "flowbite-react";
import { TbFilter } from "react-icons/tb";
import { FUNC_OPTIONS, INFO_COLUMNS_CONFIG, YEAR_OPTIONS } from "../constants";
import type { InfoColumn } from "../types";
import { ToggleChip } from "./ToggleChip";

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

export default function FilterPanel({
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
}: FilterPanelProps) {
   // Operacionalidade: cores semânticas alinhadas aos badges da tabela.
   const operControls = [
      {
         label: "IN",
         checked: opIn,
         set: setOpIn,
         activeClass: "bg-red-600 text-white",
      },
      {
         label: "OP",
         checked: opOp,
         set: setOpOp,
         activeClass: "bg-yellow-400 text-slate-900",
      },
      {
         label: "AL",
         checked: opAl,
         set: setOpAl,
         activeClass: "bg-green-600 text-white",
      },
   ];

   const activeFilters = operControls
      .filter((o) => o.checked)
      .map((o) => o.label);

   const visibleCols = INFO_COLUMNS_CONFIG.filter(
      (c) => seboFunc === "pil" || !c.pilotOnly
   );

   return (
      <div className="space-y-4 rounded border border-slate-200 bg-white p-3 shadow-sm">
         <div className="flex flex-wrap gap-4">
            {/* Função */}
            <div className="w-36">
               <Label
                  htmlFor="seboFunc"
                  className="mb-2 block text-center text-sm font-medium text-slate-700"
               >
                  Função
               </Label>
               <Select
                  id="seboFunc"
                  value={seboFunc}
                  onChange={(e) => setSeboFunc(e.target.value)}
               >
                  {FUNC_OPTIONS.map((option) => (
                     <option key={option.value} value={option.value}>
                        {option.label}
                     </option>
                  ))}
               </Select>
            </div>

            {/* Operacionalidade */}
            <div>
               <span className="mb-2 block text-center text-sm font-medium text-slate-700">
                  Operacionalidade
               </span>
               <div className="flex flex-wrap gap-1">
                  {operControls.map((filter) => (
                     <ToggleChip
                        key={filter.label}
                        active={filter.checked}
                        onToggle={() => filter.set(!filter.checked)}
                        activeClass={filter.activeClass}
                     >
                        {filter.label}
                     </ToggleChip>
                  ))}
               </div>
            </div>

            {/* OE — apenas para pilotos */}
            {seboFunc === "pil" && (
               <div>
                  <span className="mb-2 block text-center text-sm font-medium text-slate-700">
                     OE
                  </span>
                  <ToggleChip active={soO3} onToggle={() => setSoO3(!soO3)}>
                     O3
                  </ToggleChip>
               </div>
            )}

            {/* Cartões */}
            <div className="hidden sm:block">
               <span className="mb-2 block text-center text-sm font-medium text-slate-700">
                  Cartões
               </span>
               <div className="flex flex-wrap gap-1">
                  {visibleCols.map((col) => (
                     <ToggleChip
                        key={col.key}
                        active={infoCols[col.key]}
                        onToggle={() =>
                           setInfoCols({
                              ...infoCols,
                              [col.key]: !infoCols[col.key],
                           })
                        }
                     >
                        {col.label}
                     </ToggleChip>
                  ))}
               </div>
            </div>

            {/* Ano — alinhado à direita */}
            <div className="min-w-24 sm:ml-auto">
               <Label
                  htmlFor="seboAno"
                  className="mb-2 block text-center text-sm font-medium text-slate-700"
               >
                  Ano
               </Label>
               <Select
                  id="seboAno"
                  value={ano}
                  onChange={(e) => setAno(Number(e.target.value))}
               >
                  {YEAR_OPTIONS.map((y) => (
                     <option key={y} value={y}>
                        {y}
                     </option>
                  ))}
               </Select>
            </div>
         </div>

         {/* Resumo */}
         <div className="flex items-center justify-between border-t border-slate-200 pt-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
               <TbFilter aria-hidden className="h-5 w-5" />
               <span>
                  Filtros ativos:{" "}
                  <span className="font-semibold">
                     {activeFilters.join(", ") || "Nenhum"}
                  </span>
               </span>
            </div>
            <div className="text-sm">
               {isLoading ? (
                  <span className="animate-pulse text-slate-500">
                     Carregando...
                  </span>
               ) : (
                  <span className="font-semibold text-slate-900">
                     {totalResults}{" "}
                     {totalResults === 1 ? "resultado" : "resultados"}
                  </span>
               )}
            </div>
         </div>
      </div>
   );
}
