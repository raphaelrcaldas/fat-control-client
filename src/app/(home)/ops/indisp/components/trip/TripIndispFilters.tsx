"use client";

import { useState } from "react";
import clsx from "clsx";
import {
   Badge,
   Button,
   Checkbox,
   Label,
   Select,
   TextInput,
} from "flowbite-react";
import { FaChevronDown, FaTimes } from "react-icons/fa";
import { formatDateFull } from "utils/dateHandler";
import { INDISP_OPTIONS } from "@/constants/ops/indisponibilidades";
import type { UseIndispFilters } from "./hooks/useIndispFilters";

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

   const typeLabel =
      INDISP_OPTIONS.find((option) => option.value === mtv)?.label ??
      "Todos os tipos";
   const periodLabel = showFuture
      ? `a partir de ${formatDateFull(dateFrom)}`
      : `de ${formatDateFull(dateFrom)} a ${formatDateFull(dateTo)}`;

   return (
      <div>
         <Button
            color="light"
            fullSized
            className={clsx("justify-between", showFilters && "rounded-b-none")}
            onClick={() => setShowFilters((visible) => !visible)}
            aria-expanded={showFilters}
            aria-controls="trip-indisp-filters"
            aria-label={`Filtros: ${typeLabel}; período ${periodLabel}`}
         >
            <span className="min-w-0 truncate text-left">
               Filtros · {typeLabel}
            </span>
            <span className="ml-2 flex shrink-0 items-center gap-2">
               <Badge color="gray" title={`Período ${periodLabel}`}>
                  +1
               </Badge>
               <FaChevronDown
                  aria-hidden
                  className={clsx(
                     "h-4 w-4 text-slate-500 transition-transform duration-200",
                     showFilters && "rotate-180"
                  )}
               />
            </span>
         </Button>

         <div
            id="trip-indisp-filters"
            className={clsx(
               "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
               showFilters ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            )}
         >
            <div className="min-h-0 overflow-hidden">
               <div
                  inert={!showFilters}
                  className="space-y-4 rounded rounded-t-none border border-slate-200 bg-gray-50 p-4"
               >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                     <div className="space-y-1.5">
                        <Label
                           htmlFor="filtro-inicio"
                           className="block text-xs text-slate-600"
                        >
                           Data início
                        </Label>
                        <TextInput
                           id="filtro-inicio"
                           type="date"
                           sizing="sm"
                           value={dateFrom}
                           max={showFuture ? undefined : dateTo}
                           onChange={(event) => setDateFrom(event.target.value)}
                        />
                     </div>
                     <div className="space-y-1.5">
                        <Label
                           htmlFor="filtro-fim"
                           className="block text-xs text-slate-600"
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
                           onChange={(event) => setDateTo(event.target.value)}
                        />
                     </div>
                  </div>

                  <Label
                     htmlFor="filtro-futuras"
                     className="flex cursor-pointer items-center gap-3 select-none"
                  >
                     <Checkbox
                        id="filtro-futuras"
                        checked={showFuture}
                        onChange={(event) =>
                           setShowFuture(event.target.checked)
                        }
                     />
                     <span className="text-sm text-gray-600">
                        Exibir futuras
                     </span>
                  </Label>

                  <div className="space-y-1.5">
                     <Label
                        htmlFor="filtro-tipo"
                        className="block text-xs text-slate-600"
                     >
                        Tipo de indisponibilidade
                     </Label>
                     <Select
                        id="filtro-tipo"
                        sizing="sm"
                        value={mtv}
                        onChange={(event) => setMtv(event.target.value)}
                     >
                        <option value="">Todos os tipos</option>
                        {INDISP_OPTIONS.map((option) => (
                           <option key={option.value} value={option.value}>
                              {option.label}
                           </option>
                        ))}
                     </Select>
                  </div>

                  {(hasCustomFilters || isFetching) && (
                     <div className="flex min-h-8 items-center justify-between gap-3">
                        <span
                           role="status"
                           aria-live="polite"
                           className="text-xs text-slate-500"
                        >
                           {isFetching ? "Atualizando…" : ""}
                        </span>
                        {hasCustomFilters && (
                           <Button color="light" size="xs" onClick={reset}>
                              <FaTimes className="mr-2 h-3 w-3" aria-hidden />
                              Restaurar padrão
                           </Button>
                        )}
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}
