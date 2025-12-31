"use client";

import { useState, useEffect } from "react";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";
import clsx from "clsx";
import { FiltrosOrdem } from "../types";
import { statusOptions, statusLabels, StatusType } from "../constants";
import { MultiSelect } from "./MultiSelect";
import { listEtiquetas } from "services/routes/etiquetas";
import { Etiqueta } from "../types";

// Status disponíveis para filtro (sem rascunho, pois tem tab própria)
const statusOptionsAprovadas = statusOptions.filter((s) => s !== "rascunho");

interface FiltrosOrdemProps {
   filtros: FiltrosOrdem;
   onFiltrosChange: (filtros: FiltrosOrdem) => void;
   onClearFiltros: () => void;
}

// Formata data para exibição (DD/MM)
const formatDateShort = (dateStr: string) => {
   if (!dateStr) return "";
   const [year, month, day] = dateStr.split("-");
   return `${day}/${month}/${year}`;
};

export function FiltrosOrdemComponent({
   filtros,
   onFiltrosChange,
   onClearFiltros,
}: FiltrosOrdemProps) {
   const [expanded, setExpanded] = useState(false);
   const [allowOverflow, setAllowOverflow] = useState(false);
   const [allLabels, setAllLabels] = useState<Etiqueta[]>([]);

   useEffect(() => {
      const fetchLabels = async () => {
         try {
            const data = await listEtiquetas();
            setAllLabels(data);
         } catch (error) {
            console.error("Erro ao carregar etiquetas para filtro:", error);
         }
      };
      fetchLabels();
   }, []);

   // Libera o overflow após a animação de expansão terminar
   useEffect(() => {
      if (expanded) {
         const timer = setTimeout(() => setAllowOverflow(true), 300);
         return () => clearTimeout(timer);
      } else {
         setAllowOverflow(false);
      }
   }, [expanded]);

   // Lista de filtros ativos para exibição
   const activeFilters: string[] = [];
   if (filtros.busca) activeFilters.push(`"${filtros.busca}"`);
   if (filtros.status.length > 0) activeFilters.push(filtros.status.join(", "));
   if (filtros.tipo) activeFilters.push(`Desc: ${filtros.tipo}`);
   if (filtros.dataInicio || filtros.dataFim) {
      const inicio = formatDateShort(filtros.dataInicio) || "...";
      const fim = formatDateShort(filtros.dataFim) || "...";
      activeFilters.push(`${inicio} → ${fim}`);
   }
   if (filtros.etiquetas_ids?.length > 0) {
      const names = allLabels
         .filter((l) => filtros.etiquetas_ids.includes(l.id))
         .map((l) => l.nome)
         .join(", ");
      if (names) activeFilters.push(`Etiquetas: ${names}`);
   }

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
               {activeFilters.map((filter, idx) => (
                  <span
                     key={idx}
                     className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600"
                  >
                     {filter}
                  </span>
               ))}
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
               <div className="grid grid-cols-1 gap-4 px-5 pb-5 md:grid-cols-2 lg:grid-cols-7">
                  {/* Campo de Busca - ocupa 2 colunas em lg */}
                  <div className="min-w-0 lg:col-span-2">
                     <label className="mb-1 block text-xs font-medium text-gray-500">
                        Busca
                     </label>
                     <input
                        type="text"
                        placeholder="Número ou código ICAO..."
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

                  {/* Status - MultiSelect */}
                  <div className="min-w-0">
                     <label className="mb-1 block text-xs font-medium text-gray-500">
                        Status
                     </label>
                     <MultiSelect
                        options={statusOptionsAprovadas.map((s) => ({
                           value: s,
                           label: statusLabels[s as StatusType],
                        }))}
                        selected={filtros.status}
                        onChange={(values) =>
                           onFiltrosChange({ ...filtros, status: values })
                        }
                        placeholder="Todos"
                     />
                  </div>

                  {/* Tipo/Descrição - Text Input */}
                  <div className="min-w-0">
                     <label className="mb-1 block text-xs font-medium text-gray-500">
                        Descrição
                     </label>
                     <input
                        type="text"
                        placeholder="Filtrar..."
                        value={filtros.tipo}
                        onChange={(e) =>
                           onFiltrosChange({ ...filtros, tipo: e.target.value })
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

                  {/* Etiquetas - MultiSelect */}
                  <div className="min-w-0">
                     <label className="mb-1 block text-xs font-medium text-gray-500">
                        Etiquetas
                     </label>
                     <MultiSelect
                        options={allLabels.map((l) => ({
                           value: String(l.id),
                           label: l.nome,
                        }))}
                        selected={filtros.etiquetas_ids.map(String)}
                        onChange={(values) =>
                           onFiltrosChange({
                              ...filtros,
                              etiquetas_ids: values.map(Number),
                           })
                        }
                        placeholder="Todas"
                     />
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
