"use client";

import { useState } from "react";
import clsx from "clsx";
import { Checkbox, Label, Select, TextInput } from "flowbite-react";
import { FaChevronDown, FaTimes } from "react-icons/fa";
import { isoStrToDate } from "utils/dateHandler";
import { INDISP_OPTIONS } from "@/constants/ops/indisponibilidades";
import type { UseIndispFilters } from "../hooks/useIndispFilters";

function formatBr(iso: string): string {
   return isoStrToDate(iso).toLocaleDateString("pt-BR");
}

interface TripIndispFiltersProps {
   filters: UseIndispFilters;
   isFetching: boolean;
}

export function TripIndispFilters({
   filters,
   isFetching,
}: TripIndispFiltersProps) {
   const [showFilters, setShowFilters] = useState(false);
   const {
      dateFrom,
      dateTo,
      mtv,
      showFuture,
      setDateFrom,
      setDateTo,
      setMtv,
      setShowFuture,
      hasCustomFilters,
      reset,
   } = filters;

   return (
      <div className="mb-4">
         {/* Toggle */}
         <button
            onClick={() => setShowFilters((s) => !s)}
            className={clsx(
               "flex w-full items-center justify-between rounded border bg-white p-3 transition-all duration-200 hover:bg-gray-50",
               showFilters
                  ? "rounded-b-none border-red-200"
                  : "border-slate-200"
            )}
         >
            <div className="flex items-center gap-2">
               <span className="text-sm font-medium text-gray-700">
                  Filtros
               </span>
               {hasCustomFilters && (
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                     Personalizado
                  </span>
               )}
            </div>
            <FaChevronDown
               className={clsx(
                  "h-4 w-4 text-gray-400 transition-transform duration-200",
                  showFilters && "rotate-180"
               )}
            />
         </button>

         {/* Painel expansível */}
         <div
            className={clsx(
               "grid transition-all duration-300 ease-in-out",
               showFilters ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            )}
         >
            <div className="overflow-hidden">
               <div className="space-y-4 rounded-b border border-t-0 border-slate-200 bg-gray-50 p-4">
                  <div className="grid grid-cols-2 gap-3">
                     <div>
                        <Label
                           htmlFor="filtro-inicio"
                           className="mb-1.5 block text-xs text-gray-500"
                        >
                           Data início
                        </Label>
                        <TextInput
                           id="filtro-inicio"
                           type="date"
                           sizing="sm"
                           value={dateFrom}
                           max={showFuture ? undefined : dateTo}
                           onChange={(e) => setDateFrom(e.target.value)}
                        />
                     </div>
                     <div>
                        <Label
                           htmlFor="filtro-fim"
                           className="mb-1.5 block text-xs text-gray-500"
                        >
                           Data fim
                        </Label>
                        <TextInput
                           id="filtro-fim"
                           type="date"
                           sizing="sm"
                           value={dateTo}
                           min={dateFrom}
                           disabled={showFuture}
                           onChange={(e) => setDateTo(e.target.value)}
                        />
                     </div>
                  </div>

                  <Label className="flex cursor-pointer items-center gap-3 select-none">
                     <Checkbox
                        checked={showFuture}
                        onChange={(e) => setShowFuture(e.target.checked)}
                     />
                     <span className="text-sm text-gray-600">
                        Exibir futuras
                     </span>
                  </Label>

                  <div>
                     <Label
                        htmlFor="filtro-tipo"
                        className="mb-1.5 block text-xs text-gray-500"
                     >
                        Tipo de indisponibilidade
                     </Label>
                     <Select
                        id="filtro-tipo"
                        sizing="sm"
                        value={mtv}
                        onChange={(e) => setMtv(e.target.value)}
                     >
                        <option value="">Todos os tipos</option>
                        {INDISP_OPTIONS.map((opt) => (
                           <option key={opt.value} value={opt.value}>
                              {opt.label}
                           </option>
                        ))}
                     </Select>
                  </div>

                  {hasCustomFilters && (
                     <div className="flex justify-end">
                        <button
                           onClick={reset}
                           className="flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                        >
                           <FaTimes className="h-3 w-3" />
                           Restaurar padrão
                        </button>
                     </div>
                  )}

                  {isFetching && (
                     <div className="flex items-center justify-center gap-2 py-2 text-sm text-gray-500">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                        Atualizando...
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Chips quando fechado */}
         {!showFilters && (
            <div className="mt-2 flex items-center gap-2 overflow-x-auto">
               <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs whitespace-nowrap text-gray-600">
                  {showFuture ? "A partir de:" : "De:"} {formatBr(dateFrom)}
               </span>
               {!showFuture && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs whitespace-nowrap text-gray-600">
                     Até: {formatBr(dateTo)}
                  </span>
               )}
               {mtv && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs whitespace-nowrap text-red-600">
                     {INDISP_OPTIONS.find((o) => o.value === mtv)?.label}
                  </span>
               )}
               {hasCustomFilters && (
                  <button
                     onClick={reset}
                     className="ml-auto text-xs font-medium whitespace-nowrap text-red-600"
                  >
                     Limpar
                  </button>
               )}
            </div>
         )}
      </div>
   );
}
