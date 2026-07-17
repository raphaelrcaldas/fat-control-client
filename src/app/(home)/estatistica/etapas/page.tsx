"use client";

import { Button, Badge, Select } from "flowbite-react";
import { MdBarChart } from "react-icons/md";
import {
   HiFilter,
   HiDownload,
   HiPlus,
   HiViewBoards,
   HiTable,
} from "react-icons/hi";
import { CiPaperplane } from "react-icons/ci";
import Link from "next/link";
import { Pagination } from "@/components/Pagination";
import { useState, useCallback } from "react";
import { EtapasTable } from "./components/EtapasTable/EtapasTable";
import { EtapasTableSkeleton } from "./components/EtapasTable/EtapasTableSkeleton";
import { EtapasFilterPanel } from "./components/EtapasFilterPanel";
import { ActiveFilterTags } from "./components/ActiveFilterTags";
import { MissaoDeleteModal } from "./components/MissaoDeleteModal";
import { ExportModal } from "./components/ExportModal";
import { PaginationInfo } from "./components/PaginationInfo";
import { useEtapasFilters, PER_PAGE_OPTIONS } from "./hooks/useEtapasFilters";
import { useEtapaSelection } from "./hooks/useEtapaSelection";
import type { MissaoComEtapas } from "services/routes/estatistica/etapas";
import clsx from "clsx";
import { PermBased } from "../../hooks/usePermBased";

export default function EtapasPage() {
   const [showFilters, setShowFilters] = useState(false);
   const [groupByMissao, setGroupByMissao] = useState(true);

   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [deletingMissao, setDeletingMissao] = useState<MissaoComEtapas | null>(
      null
   );
   const [showExportModal, setShowExportModal] = useState(false);

   const filters = useEtapasFilters(groupByMissao);
   const {
      selectedIds,
      allSelected,
      toggleEtapa,
      toggleMissao,
      toggleAll,
      clearSelection,
   } = useEtapaSelection(filters.missoes, filters.flatEtapas, groupByMissao);

   const handleDeleteMissao = useCallback((missao: MissaoComEtapas) => {
      setDeletingMissao(missao);
      setShowDeleteModal(true);
   }, []);

   return (
      <div className="flex flex-1 flex-col overflow-hidden">
         <div className="mb-4 shrink-0 rounded border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
               <div className="flex flex-row gap-3">
                  <div className="bg-primary-600 flex h-11 w-11 items-center justify-center rounded-xl shadow-md">
                     <CiPaperplane className="h-6 w-6 text-white" />
                  </div>
                  <div>
                     <h1 className="text-xl font-semibold text-gray-900">
                        Etapas
                     </h1>
                     <p className="text-sm text-gray-500">Relatórios de voo</p>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <PermBased resource="etp_mis" requiredPerm="create">
                     <Button
                        as={Link}
                        href="/estatistica/etapas/missao/nova"
                        color="primary"
                        size="sm"
                     >
                        <HiPlus className="mr-2 h-4 w-4" />
                        Missao
                     </Button>
                  </PermBased>
                  <Button
                     color="light"
                     size="sm"
                     onClick={() => setShowFilters((v) => !v)}
                     aria-expanded={showFilters}
                     aria-controls="filtros-panel"
                  >
                     <HiFilter className="mr-2 h-4 w-4" />
                     Filtros
                     {filters.hasActiveFilters && (
                        <Badge color="primary" size="sm" className="ml-2">
                           {filters.activeFilterCount}
                        </Badge>
                     )}
                  </Button>
                  <Button
                     color="light"
                     size="sm"
                     className="hidden sm:flex"
                     onClick={() => {
                        setGroupByMissao((v) => !v);
                        filters.handlePageChange(1);
                     }}
                     title={
                        groupByMissao
                           ? "Exibir tabela plana"
                           : "Agrupar por missao"
                     }
                  >
                     {groupByMissao ? (
                        <HiTable className="mr-2 h-4 w-4" />
                     ) : (
                        <HiViewBoards className="mr-2 h-4 w-4" />
                     )}
                     {groupByMissao ? "Tabela plana" : "Agrupar por Missao"}
                  </Button>
                  <Button
                     color="light"
                     size="sm"
                     className="w-32"
                     disabled={selectedIds.size === 0}
                     onClick={() => setShowExportModal(true)}
                  >
                     <HiDownload className="mr-2 h-4 w-4" />
                     Exportar
                     {selectedIds.size > 0 && (
                        <Badge color="primary" size="sm" className="ml-2">
                           {selectedIds.size}
                        </Badge>
                     )}
                  </Button>
               </div>
            </div>

            <div className={clsx(showFilters ? "block" : "hidden")}>
               <EtapasFilterPanel
                  urlDataIni={filters.urlDataIni}
                  urlDataFim={filters.urlDataFim}
                  urlAnv={filters.urlAnv}
                  urlTipoMissao={filters.urlTipoMissao}
                  filterOrigem={filters.filterOrigem}
                  setFilterOrigem={filters.setFilterOrigem}
                  filterDestino={filters.filterDestino}
                  setFilterDestino={filters.setFilterDestino}
                  filterTrip={filters.filterTrip}
                  setFilterTrip={filters.setFilterTrip}
                  filterFuncao={filters.filterFuncao}
                  onFuncaoChange={filters.handleFuncaoChange}
                  filterEsfAer={filters.filterEsfAer}
                  setFilterEsfAer={filters.setFilterEsfAer}
                  esfAerOptions={filters.esfAerOptions}
                  aeronaveOptions={filters.aeronaveOptions}
                  tipoMissaoOptions={filters.tipoMissaoOptions}
                  onDataIniChange={filters.handleDataIniChange}
                  onDataFimChange={filters.handleDataFimChange}
                  onMultiSelectChange={filters.handleMultiSelectChange}
               />
            </div>
         </div>

         <ActiveFilterTags
            urlDataIni={filters.urlDataIni}
            urlDataFim={filters.urlDataFim}
            urlAnv={filters.urlAnv}
            urlOrigem={filters.urlOrigem}
            urlDestino={filters.urlDestino}
            urlTrip={filters.urlTrip}
            urlFuncao={filters.urlFuncao}
            urlEsfAer={filters.urlEsfAer}
            urlTipoMissao={filters.urlTipoMissao}
            onRemoveDataIni={() =>
               filters.updateParams({ data_ini: undefined })
            }
            onRemoveDataFim={() =>
               filters.updateParams({ data_fim: undefined })
            }
            onRemoveAnv={() => filters.handleMultiSelectChange("anv", [])}
            onRemoveOrigem={() => {
               filters.setFilterOrigem("");
               filters.updateParams({ origem: undefined });
            }}
            onRemoveDestino={() => {
               filters.setFilterDestino("");
               filters.updateParams({ destino: undefined });
            }}
            onRemoveTrip={() => {
               filters.setFilterTrip("");
               filters.updateParams({ trip_search: undefined });
            }}
            onRemoveFuncao={() => filters.handleFuncaoChange("")}
            onRemoveEsfAer={() => {
               filters.setFilterEsfAer("");
               filters.updateParams({ esf_aer: undefined });
            }}
            onRemoveTipoMissao={() =>
               filters.handleMultiSelectChange("tipo_missao_cod", [])
            }
            onClearAll={filters.clearFilters}
         />

         <div className="relative flex-1 overflow-auto">
            {filters.loading && <EtapasTableSkeleton grouped={groupByMissao} />}

            {!filters.loading &&
               (groupByMissao
                  ? filters.missoes.length === 0
                  : filters.flatEtapas.length === 0) && (
                  <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-gray-200 bg-white">
                     <div className="mb-4 rounded-full bg-gray-100 p-4">
                        <MdBarChart className="h-12 w-12 text-gray-400" />
                     </div>
                     <p className="mb-2 text-lg font-semibold text-gray-900">
                        {filters.hasActiveFilters
                           ? "Nenhuma etapa encontrada"
                           : "Nenhuma etapa disponivel"}
                     </p>
                     <p className="max-w-md text-center text-sm text-gray-500">
                        {filters.hasActiveFilters
                           ? "Nao foram encontrados resultados com os filtros aplicados."
                           : "Utilize os filtros para visualizar as etapas."}
                     </p>
                     {filters.hasActiveFilters && (
                        <button
                           type="button"
                           onClick={filters.clearFilters}
                           className="text-primary-600 hover:text-primary-700 mt-3 text-sm"
                        >
                           Limpar filtros
                        </button>
                     )}
                  </div>
               )}

            {(groupByMissao
               ? filters.missoes.length > 0
               : filters.flatEtapas.length > 0) && (
               <div
                  className={clsx(
                     "transition-opacity duration-200",
                     filters.isRefetching && "pointer-events-none opacity-40"
                  )}
               >
                  <EtapasTable
                     missoes={filters.missoes}
                     flatEtapas={filters.flatEtapas}
                     loading={filters.isRefetching}
                     selectedIds={selectedIds}
                     onToggleEtapa={toggleEtapa}
                     onToggleMissao={toggleMissao}
                     onToggleAll={toggleAll}
                     allSelected={allSelected}
                     onDeleteMissao={handleDeleteMissao}
                     grouped={groupByMissao}
                     onClearSelection={clearSelection}
                  />
               </div>
            )}

            {(groupByMissao
               ? filters.missoes.length > 0
               : filters.flatEtapas.length > 0) && (
               <nav
                  className={clsx(
                     "mt-4 flex flex-col items-start justify-between space-y-3 rounded-lg border border-gray-200 bg-white px-4 py-3 md:flex-row md:items-center md:space-y-0",
                     "transition-opacity duration-200",
                     filters.isRefetching && "pointer-events-none opacity-50"
                  )}
                  aria-label="Navegacao da tabela"
               >
                  <div className="flex items-center gap-4">
                     <PaginationInfo
                        page={filters.currentPage}
                        perPage={filters.perPage}
                        total={
                           groupByMissao
                              ? filters.totalMissoes
                              : filters.totalEtapas
                        }
                        totalItems={
                           groupByMissao ? filters.totalEtapas : undefined
                        }
                        viewMode={groupByMissao ? "grouped" : "flat"}
                     />
                     {!groupByMissao && (
                        <div className="flex items-center gap-2">
                           <label
                              htmlFor="perPage"
                              className="text-sm text-gray-500"
                           >
                              Por pagina:
                           </label>
                           <Select
                              id="perPage"
                              sizing="sm"
                              value={filters.perPage}
                              onChange={(e) =>
                                 filters.handlePerPageChange(
                                    Number(e.target.value)
                                 )
                              }
                              className="w-20"
                           >
                              {PER_PAGE_OPTIONS.map((option) => (
                                 <option key={option} value={option}>
                                    {option}
                                 </option>
                              ))}
                           </Select>
                        </div>
                     )}
                  </div>
                  {!groupByMissao && filters.totalPages > 1 && (
                     <Pagination
                        currentPage={filters.currentPage}
                        totalPages={filters.totalPages}
                        onPageChange={filters.handlePageChange}
                     />
                  )}
               </nav>
            )}
         </div>

         <MissaoDeleteModal
            show={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            missao={deletingMissao}
         />

         <ExportModal
            show={showExportModal}
            onClose={() => setShowExportModal(false)}
            selectedIds={selectedIds}
         />
      </div>
   );
}
