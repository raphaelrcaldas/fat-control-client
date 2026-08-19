"use client";

import { Badge, Button } from "flowbite-react";
import {
   HiDocumentText,
   HiFilter,
   HiX,
   HiHashtag,
   HiClipboardList,
   HiUser,
   HiCalendar,
   HiTag,
} from "react-icons/hi";
import { formatDateFull } from "@/../utils/dateHandler";
import {
   defaultFim,
   defaultIni,
   PagamentosFilters,
} from "../hooks/usePagamentosFilters";

type Props = {
   filters: PagamentosFilters;
   showFilters: boolean;
   onToggleFilters: () => void;
};

export function ActiveFiltersBar({
   filters,
   showFilters,
   onToggleFilters,
}: Props) {
   const {
      tipoDoc,
      nDoc,
      selectedTipo,
      selectedSit,
      userSearch,
      dataInicio,
      dataFim,
      setTipoDoc,
      setSelectedTipo,
      setSelectedSit,
      hasActiveFilters,
      activeFiltersCount,
      clearFilters,
      removeNDoc,
      removeUserSearch,
      removeDataInicio,
      removeDataFim,
   } = filters;

   return (
      /* Chips ocultos no mobile (poluíam e quebravam a linha); o badge de
         contagem no botão "Filtros" já sinaliza que há filtros ativos.
         Reaparecem no sm+. */
      <section className="flex items-start justify-end gap-3 sm:justify-between">
         <div className="hidden flex-wrap items-center gap-2 sm:flex">
            <span className="text-xs font-medium text-gray-600">
               Filtros ativos:
            </span>

            {tipoDoc?.map((td) => (
               <Badge key={`tipoDoc-${td}`} color="primary">
                  <div className="flex items-center gap-1.5">
                     <HiDocumentText className="h-3 w-3" />
                     <span>Ordem: {td === "om" ? "Missão" : "Serviço"}</span>
                     <button
                        onClick={() =>
                           setTipoDoc(tipoDoc.filter((v) => v !== td))
                        }
                        className="ml-1 hover:text-red-600"
                     >
                        <HiX className="h-3 w-3" />
                     </button>
                  </div>
               </Badge>
            ))}

            {nDoc && (
               <Badge color="primary">
                  <div className="flex items-center gap-1.5">
                     <HiHashtag className="h-3 w-3" />
                     <span>Nº {nDoc}</span>
                     <button
                        onClick={removeNDoc}
                        className="ml-1 hover:text-red-600"
                     >
                        <HiX className="h-3 w-3" />
                     </button>
                  </div>
               </Badge>
            )}

            {selectedTipo?.map((tipo) => (
               <Badge key={`tipo-${tipo}`} color="primary">
                  <div className="flex items-center gap-1.5">
                     <HiClipboardList className="h-3 w-3" />
                     <span>Tipo: {tipo.toUpperCase()}</span>
                     <button
                        onClick={() =>
                           setSelectedTipo(
                              selectedTipo.filter((v) => v !== tipo)
                           )
                        }
                        className="ml-1 hover:text-red-600"
                     >
                        <HiX className="h-3 w-3" />
                     </button>
                  </div>
               </Badge>
            ))}

            {selectedSit?.map((sit) => (
               <Badge key={`sit-${sit}`} color="primary">
                  <div className="flex items-center gap-1.5">
                     <HiTag className="h-3 w-3" />
                     <span>
                        Situação:{" "}
                        {sit === "d"
                           ? "Diária"
                           : sit === "c"
                             ? "Comissionado"
                             : "Grat Rep"}
                     </span>
                     <button
                        onClick={() =>
                           setSelectedSit(selectedSit.filter((v) => v !== sit))
                        }
                        className="ml-1 hover:text-red-600"
                     >
                        <HiX className="h-3 w-3" />
                     </button>
                  </div>
               </Badge>
            ))}

            {userSearch && (
               <Badge color="primary">
                  <div className="flex items-center gap-1.5">
                     <HiUser className="h-3 w-3" />
                     <span>Militar: {userSearch}</span>
                     <button
                        onClick={removeUserSearch}
                        className="ml-1 hover:text-red-600"
                     >
                        <HiX className="h-3 w-3" />
                     </button>
                  </div>
               </Badge>
            )}

            <Badge color="primary">
               <div className="flex items-center gap-1.5">
                  <HiCalendar className="h-3 w-3" />
                  <span>Afastamento: {formatDateFull(dataInicio)}</span>
                  {dataInicio !== defaultIni && (
                     <button
                        onClick={removeDataInicio}
                        className="ml-1 hover:text-red-600"
                     >
                        <HiX className="h-3 w-3" />
                     </button>
                  )}
               </div>
            </Badge>

            <Badge color="primary">
               <div className="flex items-center gap-1.5">
                  <HiCalendar className="h-3 w-3" />
                  <span>Regresso: {formatDateFull(dataFim)}</span>
                  {dataFim !== defaultFim && (
                     <button
                        onClick={removeDataFim}
                        className="ml-1 hover:text-red-600"
                     >
                        <HiX className="h-3 w-3" />
                     </button>
                  )}
               </div>
            </Badge>

            {hasActiveFilters && (
               <button
                  onClick={clearFilters}
                  className="text-xs text-gray-500 underline hover:text-gray-700"
               >
                  Limpar todos
               </button>
            )}
         </div>
         <Button
            color="light"
            size="sm"
            onClick={onToggleFilters}
            className="shrink-0"
         >
            <HiFilter className="mr-2 h-4 w-4" />
            <span className="w-11 text-left">
               {showFilters ? "Ocultar" : "Filtros"}
            </span>
            {hasActiveFilters && (
               <Badge color="gray" size="sm" className="ml-2">
                  {activeFiltersCount}
               </Badge>
            )}
         </Button>
      </section>
   );
}
