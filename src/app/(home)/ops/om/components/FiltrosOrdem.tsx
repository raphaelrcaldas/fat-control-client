"use client";

import { useState, useEffect } from "react";
import { HiChevronDown, HiChevronUp, HiTag, HiX } from "react-icons/hi";
import clsx from "clsx";
import { FiltrosOrdem } from "../types";
import {
   STATUS_OPTIONS as statusOptions,
   STATUS_LABELS as statusLabels,
   type StatusType,
} from "@/constants/ops/ordens-missao/status";
import { useEtiquetas } from "@/hooks/queries";

// Status disponíveis para filtro (sem rascunho, pois tem tab própria)
const statusOptionsAprovadas = statusOptions.filter((s) => s !== "rascunho");

interface FiltrosOrdemProps {
   filtros: FiltrosOrdem;
   onFiltrosChange: (filtros: FiltrosOrdem) => void;
   onClearFiltros: () => void;
}

export function FiltrosOrdemComponent({
   filtros,
   onFiltrosChange,
   onClearFiltros,
}: FiltrosOrdemProps) {
   const [expanded, setExpanded] = useState(false);
   const [allowOverflow, setAllowOverflow] = useState(false);

   // TanStack Query - cache automatico, staleTime de 5 min
   const etiquetasQuery = useEtiquetas();
   const allLabels = etiquetasQuery.data ?? [];

   // Libera o overflow após a animação de expansão terminar
   useEffect(() => {
      if (expanded) {
         const timer = setTimeout(() => setAllowOverflow(true), 300);
         return () => clearTimeout(timer);
      } else {
         setAllowOverflow(false);
      }
   }, [expanded]);

   // Lista de filtros ativos para badges
   const hasActiveFilters = !!(
      filtros.busca ||
      filtros.status.length > 0 ||
      filtros.dataInicio ||
      filtros.dataFim ||
      filtros.etiquetas_ids.length > 0
   );

   return (
      <div
         className={clsx(
            "mb-3 rounded-xl border border-gray-200 bg-white shadow-sm",
            allowOverflow ? "overflow-visible" : "overflow-hidden"
         )}
      >
         <button
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-between rounded-xl p-4 transition-colors"
         >
            <div className="flex flex-wrap items-center gap-2">
               <span className="text-sm font-bold tracking-wider text-gray-500 uppercase">
                  Filtros
               </span>

               {/* Active Filters Badges */}
               {hasActiveFilters && (
                  <>
                     {filtros.busca && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                           Busca: {filtros.busca}
                        </span>
                     )}

                     {filtros.dataInicio && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                           Início:{" "}
                           {new Date(
                              filtros.dataInicio + "T00:00:00"
                           ).toLocaleDateString("pt-BR")}
                        </span>
                     )}

                     {filtros.dataFim && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                           Fim:{" "}
                           {new Date(
                              filtros.dataFim + "T00:00:00"
                           ).toLocaleDateString("pt-BR")}
                        </span>
                     )}

                     {/* Etiquetas selecionadas */}
                     {filtros.etiquetas_ids.map((id) => {
                        const etiqueta = allLabels.find((e) => e.id === id);
                        if (!etiqueta) return null;
                        return (
                           <span
                              key={id}
                              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white"
                              style={{ backgroundColor: etiqueta.cor }}
                           >
                              {etiqueta.nome}
                           </span>
                        );
                     })}
                  </>
               )}
            </div>
            <div className="flex items-center gap-3">
               <span
                  onClick={(e) => {
                     e.stopPropagation();
                     onClearFiltros();
                  }}
                  className="cursor-pointer text-xs text-gray-400 transition-colors hover:text-red-600"
               >
                  Limpar
               </span>
               {expanded ? (
                  <HiChevronUp className="h-5 w-5 text-gray-400" />
               ) : (
                  <HiChevronDown className="h-5 w-5 text-gray-400" />
               )}
            </div>
         </button>

         <div
            className={clsx(
               "grid transition-all duration-300 ease-in-out",
               expanded
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
            )}
         >
            <div
               className={clsx(
                  allowOverflow ? "overflow-visible" : "overflow-hidden"
               )}
            >
               <div className="grid grid-cols-1 gap-4 px-5 pb-5 md:grid-cols-2 lg:grid-cols-5">
                  {/* Campo de Busca - ocupa 2 colunas em lg */}
                  <div className="min-w-0 md:col-span-2 lg:col-span-3">
                     <label className="mb-1 block text-xs font-medium text-gray-500">
                        Busca
                     </label>
                     <input
                        type="text"
                        placeholder="Número, ICAO, descrição ou nome de guerra..."
                        value={filtros.busca}
                        onChange={(e) =>
                           onFiltrosChange({
                              ...filtros,
                              busca: e.target.value,
                           })
                        }
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-red-500"
                     />
                  </div>

                  {/* Data Início */}
                  <div className="min-w-0">
                     <label className="mb-1 block text-xs font-medium text-gray-500">
                        Data Início
                     </label>
                     <input
                        type="date"
                        value={filtros.dataInicio}
                        onChange={(e) =>
                           onFiltrosChange({
                              ...filtros,
                              dataInicio: e.target.value,
                           })
                        }
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-red-500"
                     />
                  </div>

                  {/* Data Fim */}
                  <div className="min-w-0">
                     <label className="mb-1 block text-xs font-medium text-gray-500">
                        Data Fim
                     </label>
                     <input
                        type="date"
                        value={filtros.dataFim}
                        onChange={(e) =>
                           onFiltrosChange({
                              ...filtros,
                              dataFim: e.target.value,
                           })
                        }
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-red-500"
                     />
                  </div>

                  {/* Etiquetas - Button-based selector */}
                  {allLabels.length > 0 && (
                     <div className="min-w-0 lg:col-span-5">
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                           Etiquetas
                        </label>
                        <div className="flex flex-wrap gap-2">
                           {allLabels.map((etiqueta) => {
                              const isSelected = filtros.etiquetas_ids.includes(
                                 etiqueta.id
                              );
                              return (
                                 <button
                                    key={etiqueta.id}
                                    type="button"
                                    onClick={() => {
                                       if (isSelected) {
                                          onFiltrosChange({
                                             ...filtros,
                                             etiquetas_ids:
                                                filtros.etiquetas_ids.filter(
                                                   (id) => id !== etiqueta.id
                                                ),
                                          });
                                       } else {
                                          onFiltrosChange({
                                             ...filtros,
                                             etiquetas_ids: [
                                                ...filtros.etiquetas_ids,
                                                etiqueta.id,
                                             ],
                                          });
                                       }
                                    }}
                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                                       isSelected
                                          ? "text-white shadow-sm"
                                          : "border border-dashed"
                                    }`}
                                    style={
                                       isSelected
                                          ? {
                                               backgroundColor: etiqueta.cor,
                                            }
                                          : {
                                               borderColor: etiqueta.cor,
                                               color: etiqueta.cor,
                                               backgroundColor: `${etiqueta.cor}10`,
                                            }
                                    }
                                 >
                                    <HiTag className="h-3 w-3" />
                                    {etiqueta.nome}
                                    {isSelected && <HiX className="h-3 w-3" />}
                                 </button>
                              );
                           })}
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}
