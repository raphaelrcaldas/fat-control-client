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
import { MultiSelect } from "@/components/MultiSelect";

// Status disponíveis para filtro (sem rascunho, pois tem tab própria)
const statusOptionsAprovadas = statusOptions.filter((s) => s !== "rascunho");

interface FiltrosOrdemProps {
   filtros: FiltrosOrdem;
   onFiltrosChange: (filtros: FiltrosOrdem) => void;
   onClearFiltros: () => void;
   // Valores default de período — não contam como filtro ativo
   defaultDates?: { dataInicio: string; dataFim: string };
}

export function FiltrosOrdemComponent({
   filtros,
   onFiltrosChange,
   onClearFiltros,
   defaultDates,
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

   // Datas iguais ao default não contam como filtro ativo
   const isDataInicioCustom =
      !!filtros.dataInicio && filtros.dataInicio !== defaultDates?.dataInicio;
   const isDataFimCustom =
      !!filtros.dataFim && filtros.dataFim !== defaultDates?.dataFim;

   // Fim antes do início retorna lista vazia sem explicação — avisar
   const intervaloInvalido =
      !!filtros.dataInicio &&
      !!filtros.dataFim &&
      filtros.dataInicio > filtros.dataFim;

   // Lista de filtros ativos para badges
   const hasActiveFilters = !!(
      filtros.busca ||
      filtros.status.length > 0 ||
      isDataInicioCustom ||
      isDataFimCustom ||
      filtros.etiquetas_ids.length > 0
   );

   return (
      <div
         className={clsx(
            "rounded border border-gray-200 bg-white shadow",
            allowOverflow ? "overflow-visible" : "overflow-hidden"
         )}
      >
         <div className="flex w-full items-center justify-between p-4">
            <button
               type="button"
               onClick={() => setExpanded(!expanded)}
               className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-left transition-colors"
            >
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

                     {isDataInicioCustom && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                           Início:{" "}
                           {new Date(
                              filtros.dataInicio + "T00:00:00"
                           ).toLocaleDateString("pt-BR")}
                        </span>
                     )}

                     {isDataFimCustom && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                           Fim:{" "}
                           {new Date(
                              filtros.dataFim + "T00:00:00"
                           ).toLocaleDateString("pt-BR")}
                        </span>
                     )}

                     {/* Status selecionados */}
                     {filtros.status.map((s) => (
                        <span
                           key={s}
                           className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600"
                        >
                           {statusLabels[s as StatusType] || s}
                        </span>
                     ))}

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
            </button>
            <div className="flex shrink-0 items-center gap-3">
               {hasActiveFilters && (
                  <button
                     type="button"
                     onClick={onClearFiltros}
                     className="text-xs text-gray-400 transition-colors hover:text-red-600"
                  >
                     Limpar
                  </button>
               )}
               <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  aria-label={
                     expanded ? "Recolher filtros" : "Expandir filtros"
                  }
               >
                  {expanded ? (
                     <HiChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                     <HiChevronDown className="h-5 w-5 text-gray-400" />
                  )}
               </button>
            </div>
         </div>

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
                  <div className="min-w-0 md:col-span-2 lg:col-span-2">
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
                        className="w-full rounded border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-red-500"
                     />
                  </div>

                  {/* Status */}
                  <div className="min-w-0">
                     <label className="mb-1 block text-xs font-medium text-gray-500">
                        Status
                     </label>
                     <MultiSelect
                        options={statusOptionsAprovadas.map((s) => ({
                           value: s,
                           label: statusLabels[s],
                        }))}
                        selected={filtros.status}
                        onChange={(values) =>
                           onFiltrosChange({
                              ...filtros,
                              status: values,
                           })
                        }
                        placeholder="Todos"
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
                        max={filtros.dataFim || undefined}
                        onChange={(e) =>
                           onFiltrosChange({
                              ...filtros,
                              dataInicio: e.target.value,
                           })
                        }
                        className={clsx(
                           "w-full rounded border bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-red-500",
                           intervaloInvalido
                              ? "border-red-300"
                              : "border-gray-300"
                        )}
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
                        min={filtros.dataInicio || undefined}
                        onChange={(e) =>
                           onFiltrosChange({
                              ...filtros,
                              dataFim: e.target.value,
                           })
                        }
                        className={clsx(
                           "w-full rounded border bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-red-500",
                           intervaloInvalido
                              ? "border-red-300"
                              : "border-gray-300"
                        )}
                     />
                     {intervaloInvalido && (
                        <p className="mt-1 text-xs text-red-500">
                           Data fim anterior à data início
                        </p>
                     )}
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
