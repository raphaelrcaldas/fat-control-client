"use client";
import { Label, Select } from "flowbite-react";
import clsx from "clsx";
import { getOperSigla } from "@/constants/tripulantes/operacionalidade";
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
   opBa: boolean;
   setOpBa: (value: boolean) => void;
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
   filters,
}: {
   filters: FilterPanelProps;
}) {
   const {
      seboFunc,
      setSeboFunc,
      opIn,
      setOpIn,
      opOp,
      setOpOp,
      opBa,
      setOpBa,
      opAl,
      setOpAl,
      soO3,
      setSoO3,
      ano,
      setAno,
      infoCols,
      setInfoCols,
   } = filters;
   const isPilot = seboFunc === "pil";

   // Operacionalidade: cores semânticas alinhadas aos badges da tabela.
   // O valor filtrado continua sendo `op` — piloto só exibe a sigla PO.
   const operControls = [
      {
         id: "in",
         checked: opIn,
         set: setOpIn,
         activeClass: "bg-red-600 text-white",
      },
      {
         id: "op",
         checked: opOp,
         set: setOpOp,
         activeClass: "bg-yellow-400 text-slate-900",
      },
      {
         id: "ba",
         checked: opBa,
         set: setOpBa,
         activeClass: "bg-orange-500 text-slate-900",
      },
      {
         id: "al",
         checked: opAl,
         set: setOpAl,
         activeClass: "bg-green-600 text-white",
      },
   ];

   const visibleCols = INFO_COLUMNS_CONFIG.filter(
      (c) => isPilot || !c.pilotOnly
   );

   const selectTheme = {
      field: { select: { sizes: { md: "h-10 py-0 pl-3 pr-8 text-sm" } } },
   };

   return (
      <section
         aria-label="Filtros do Pau de Sebo"
         className="min-w-0 rounded border border-slate-200 bg-white p-3 shadow-sm"
      >
         <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:gap-4">
            {/* Função + Ano formam um par até o xl: no tablet a linha não
                comporta os quatro grupos e o Ano, empurrado à direita, caía
                sozinho numa segunda linha. No xl o par se desfaz e o Ano
                volta ao canto direito. */}
            <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-3 sm:grid-cols-[9rem_6rem] sm:gap-4 xl:contents">
               <div className="min-w-0 space-y-2 xl:w-36 xl:flex-none">
                  <Label
                     htmlFor="seboFunc"
                     className="block text-xs font-medium text-slate-600"
                  >
                     Função
                  </Label>
                  <Select
                     id="seboFunc"
                     value={seboFunc}
                     onChange={(e) => setSeboFunc(e.target.value)}
                     theme={selectTheme}
                     clearTheme={{ field: { select: { sizes: { md: true } } } }}
                  >
                     {FUNC_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                           {option.label}
                        </option>
                     ))}
                  </Select>
               </div>
               <div className="min-w-0 space-y-2 xl:order-last xl:ml-auto xl:w-24 xl:flex-none">
                  <Label
                     htmlFor="seboAno"
                     className="block text-xs font-medium text-slate-600"
                  >
                     Ano
                  </Label>
                  <Select
                     id="seboAno"
                     value={ano}
                     onChange={(e) => setAno(Number(e.target.value))}
                     theme={selectTheme}
                     clearTheme={{ field: { select: { sizes: { md: true } } } }}
                  >
                     {YEAR_OPTIONS.map((year) => (
                        <option key={year} value={year}>
                           {year}
                        </option>
                     ))}
                  </Select>
               </div>
            </div>

            <div className="flex shrink-0 items-start gap-3">
               <div
                  role="group"
                  aria-labelledby="sebo-oper-label"
                  className="space-y-2"
               >
                  <span
                     id="sebo-oper-label"
                     className="block text-xs font-medium text-slate-600"
                  >
                     Operacionalidade
                  </span>
                  <div className="flex gap-1">
                     {operControls.map((filter) => (
                        <ToggleChip
                           key={filter.id}
                           active={filter.checked}
                           onToggle={() => filter.set(!filter.checked)}
                           activeClass={filter.activeClass}
                           className="w-10"
                        >
                           {getOperSigla(filter.id, isPilot)}
                        </ToggleChip>
                     ))}
                  </div>
               </div>
               {isPilot && (
                  <div
                     role="group"
                     aria-labelledby="sebo-oe-label"
                     className="space-y-2"
                  >
                     <span
                        id="sebo-oe-label"
                        className="block text-xs font-medium text-slate-600"
                     >
                        OE
                     </span>
                     <ToggleChip
                        active={soO3}
                        onToggle={() => setSoO3(!soO3)}
                        className="w-10"
                     >
                        O3
                     </ToggleChip>
                  </div>
               )}
            </div>

            <div
               role="group"
               aria-labelledby="sebo-cartoes-label"
               className="min-w-0 space-y-2"
            >
               <span
                  id="sebo-cartoes-label"
                  className="block text-xs font-medium text-slate-600"
               >
                  Cartões
               </span>
               <div
                  className={clsx(
                     "grid w-fit gap-1 sm:flex sm:flex-wrap",
                     isPilot ? "grid-cols-4" : "grid-cols-3"
                  )}
               >
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
                        // Coluna ligada é preferência de exibição, não
                        // filtro: tom claro para não se confundir com o IN
                        // sólido (perigo) ao lado, que na 11GT tem a mesma cor.
                        activeClass="border border-primary-300 bg-primary-50 text-primary-700 hover:bg-primary-100"
                        className="w-16"
                     >
                        {col.label}
                     </ToggleChip>
                  ))}
               </div>
            </div>
         </div>
      </section>
   );
}
