"use client";
import { Label, Select } from "flowbite-react";
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

   const visibleCols = INFO_COLUMNS_CONFIG.filter(
      (c) => seboFunc === "pil" || !c.pilotOnly
   );

   return (
      <div className="rounded border border-slate-200 bg-white p-3 shadow-sm">
         <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start">
            {/* Selects: no mobile, Função + Ano dividem a mesma linha.
                No desktop o wrapper vira `contents` e os filhos voltam ao
                flex pai — Ano é empurrado para a direita (sm:ml-auto). */}
            <div className="flex gap-4 sm:contents">
               {/* Função */}
               <div className="flex-1 sm:w-36 sm:flex-none">
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

               {/* Ano — no mobile ao lado da Função; no desktop à direita */}
               <div className="flex-1 sm:order-last sm:ml-auto sm:w-24 sm:flex-none">
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

            {/* Operacionalidade + OE — agrupados para fluírem juntos */}
            <div className="flex flex-wrap gap-4">
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
                           className="h-10"
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
                     <ToggleChip
                        active={soO3}
                        onToggle={() => setSoO3(!soO3)}
                        className="h-10"
                     >
                        O3
                     </ToggleChip>
                  </div>
               )}
            </div>

            {/* Cartões */}
            <div>
               <span className="mb-2 block text-center text-sm font-medium text-slate-700">
                  Cartões
               </span>
               <div className="grid grid-cols-4 gap-1 xl:flex xl:flex-wrap">
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
                        className="h-10 w-16"
                     >
                        {col.label}
                     </ToggleChip>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );
}
