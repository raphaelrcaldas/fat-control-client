"use client";

import { Badge, Button } from "flowbite-react";
import {
   HiX,
   HiDocumentText,
   HiHashtag,
   HiClipboardList,
   HiUser,
   HiLocationMarker,
   HiCalendar,
   HiTag,
   HiFilter,
} from "react-icons/hi";
import { formatDateFull } from "@/../utils/dateHandler";
import { useEtiquetasMissoes } from "@/hooks/queries/useEtiquetasMissoes";
import {
   defaultFim,
   defaultIni,
   RegistrosFilters,
} from "../hooks/useRegistrosFilters";

type Props = {
   filters: RegistrosFilters;
   filtersExpanded: boolean;
   onToggleFilters: () => void;
};

export function ActiveFiltersBar({
   filters,
   filtersExpanded,
   onToggleFilters,
}: Props) {
   const { data: etiquetasDisponiveis = [] } = useEtiquetasMissoes();
   const {
      tipoDoc,
      nDoc,
      selectedTipo,
      userSearch,
      citySearch,
      dataInicio,
      dataFim,
      selectedEtiquetaIds,
      activeFilterCount,
      hasActiveFilters,
      clearFilters,
      removeTipoDoc,
      removeNDoc,
      removeSelectedTipo,
      removeUserSearch,
      removeCitySearch,
      removeDataInicio,
      removeDataFim,
      removeEtiqueta,
   } = filters;

   return (
      /* Filtros ativos (esquerda) + toggle (direita) — igual Pagamentos. Chips
         ocultos no mobile (o badge de contagem no botão "Filtros" já sinaliza
         filtros ativos); reaparecem no sm+. */
      <section className="order-1 flex shrink-0 items-start justify-end gap-3 sm:justify-between">
         <div className="hidden flex-wrap items-center gap-2 sm:flex">
            <span className="text-xs font-medium text-gray-600">
               Filtros ativos:
            </span>

            {tipoDoc.map((tipo) => (
               <Badge key={tipo} color="primary">
                  <div className="flex items-center gap-1.5">
                     <HiDocumentText className="h-3 w-3" />
                     <span>Ordem: {tipo === "om" ? "Missão" : "Serviço"}</span>
                     <button
                        onClick={() => removeTipoDoc(tipo)}
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

            {selectedTipo.map((tipo) => (
               <Badge key={tipo} color="primary">
                  <div className="flex items-center gap-1.5">
                     <HiClipboardList className="h-3 w-3" />
                     <span>Tipo: {tipo.toUpperCase()}</span>
                     <button
                        onClick={() => removeSelectedTipo(tipo)}
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

            {citySearch && (
               <Badge color="primary">
                  <div className="flex items-center gap-1.5">
                     <HiLocationMarker className="h-3 w-3" />
                     <span>Cidade: {citySearch}</span>
                     <button
                        onClick={removeCitySearch}
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

            {selectedEtiquetaIds.map((id) => {
               const etiqueta = etiquetasDisponiveis.find((e) => e.id === id);
               if (!etiqueta) return null;
               return (
                  <span
                     key={id}
                     className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white"
                     style={{ backgroundColor: etiqueta.cor }}
                  >
                     <HiTag className="h-3 w-3" />
                     {etiqueta.nome}
                     <button
                        onClick={() => removeEtiqueta(id)}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-white/20"
                     >
                        <HiX className="h-3 w-3" />
                     </button>
                  </span>
               );
            })}

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
               {filtersExpanded ? "Ocultar" : "Filtros"}
            </span>
            {activeFilterCount > 0 && (
               <Badge color="gray" size="sm" className="ml-2">
                  {activeFilterCount}
               </Badge>
            )}
         </Button>
      </section>
   );
}
