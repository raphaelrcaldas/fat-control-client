"use client";

import { Button, Badge, Select, Spinner } from "flowbite-react";
import { MdBarChart } from "react-icons/md";
import {
   HiFilter,
   HiDownload,
   HiPlus,
   HiViewBoards,
   HiTable,
} from "react-icons/hi";
import { Pagination } from "@/components/Pagination";
import { useState, useCallback } from "react";
import { EtapasTable } from "./components/EtapasTable";
import { EtapasFilterPanel } from "./components/EtapasFilterPanel";
import { ActiveFilterTags } from "./components/ActiveFilterTags";
import { MissaoFormModal } from "./components/MissaoFormModal";
import { MissaoDeleteModal } from "./components/MissaoDeleteModal";
import { PaginationInfo } from "./components/PaginationInfo";
import { useEtapasFilters, PER_PAGE_OPTIONS } from "./hooks/useEtapasFilters";
import { useEtapaSelection } from "./hooks/useEtapaSelection";
import type { MissaoComEtapas } from "services/routes/estatistica/etapas";
import clsx from "clsx";

export default function EtapasPage() {
   const [showFilters, setShowFilters] = useState(false);
   const [groupByMissao, setGroupByMissao] = useState(true);

   const [showMissaoModal, setShowMissaoModal] = useState(false);
   const [editingMissao, setEditingMissao] = useState<MissaoComEtapas | null>(
      null
   );
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [deletingMissao, setDeletingMissao] = useState<MissaoComEtapas | null>(
      null
   );

   const filters = useEtapasFilters(groupByMissao);
   const { selectedIds, allSelected, toggleEtapa, toggleMissao, toggleAll } =
      useEtapaSelection(filters.missoes, filters.flatEtapas);

   const handleOpenCreateMissao = useCallback(() => {
      setEditingMissao(null);
      setShowMissaoModal(true);
   }, []);

   const handleEditMissao = useCallback((missao: MissaoComEtapas) => {
      setEditingMissao(missao);
      setShowMissaoModal(true);
   }, []);

   const handleDeleteMissao = useCallback((missao: MissaoComEtapas) => {
      setDeletingMissao(missao);
      setShowDeleteModal(true);
   }, []);

   return (
      <div className="flex flex-1 flex-col overflow-hidden p-1">
         <div className="mb-4 shrink-0 rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
               <h2>Etapas</h2>
               <div className="flex items-center gap-2">
                  <Button
                     color="red"
                     size="sm"
                     onClick={handleOpenCreateMissao}
                  >
                     <HiPlus className="mr-2 h-4 w-4" />
                     Nova Missao
                  </Button>
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
                        <Badge color="red" size="sm" className="ml-2">
                           {filters.activeFilterCount}
                        </Badge>
                     )}
                  </Button>
                  <Button
                     color="light"
                     size="sm"
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
                     disabled={selectedIds.size === 0}
                  >
                     <HiDownload className="mr-2 h-4 w-4" />
                     Exportar
                     {selectedIds.size > 0 && (
                        <Badge color="red" size="sm" className="ml-2">
                           {selectedIds.size}
                        </Badge>
                     )}
                  </Button>
               </div>
            </div>

            {showFilters && (
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
                  filterEsfAer={filters.filterEsfAer}
                  setFilterEsfAer={filters.setFilterEsfAer}
                  esfAerOptions={filters.esfAerOptions}
                  aeronaveOptions={filters.aeronaveOptions}
                  tipoMissaoOptions={filters.tipoMissaoOptions}
                  onDataIniChange={filters.handleDataIniChange}
                  onDataFimChange={filters.handleDataFimChange}
                  onMultiSelectChange={filters.handleMultiSelectChange}
               />
            )}
         </div>

         {filters.hasActiveFilters && (
            <ActiveFilterTags
               urlDataIni={filters.urlDataIni}
               urlDataFim={filters.urlDataFim}
               urlAnv={filters.urlAnv}
               urlOrigem={filters.urlOrigem}
               urlDestino={filters.urlDestino}
               urlTrip={filters.urlTrip}
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
               onRemoveEsfAer={() => {
                  filters.setFilterEsfAer("");
                  filters.updateParams({ esf_aer: undefined });
               }}
               onRemoveTipoMissao={() =>
                  filters.handleMultiSelectChange("tipo_missao_cod", [])
               }
               onClearAll={filters.clearFilters}
            />
         )}

         <div className="relative flex-1 overflow-auto">
            {filters.loading && (
               <div className="flex h-64 items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                     <Spinner size="lg" color="failure" />
                     <p className="text-sm text-gray-600">
                        Carregando etapas...
                     </p>
                  </div>
               </div>
            )}

            {!filters.loading &&
               (groupByMissao
                  ? filters.missoes.length === 0
                  : filters.flatEtapas.length === 0) && (
                  <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-gray-200 bg-white">
                     <div className="mb-4 rounded-full bg-gray-100 p-4">
                        <MdBarChart className="h-12 w-12 text-gray-400" />
                     </div>
                     <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        {filters.hasActiveFilters
                           ? "Nenhuma etapa encontrada"
                           : "Nenhuma etapa disponivel"}
                     </h3>
                     <p className="max-w-md text-center text-sm text-gray-500">
                        {filters.hasActiveFilters
                           ? "Nao foram encontrados resultados com os filtros aplicados."
                           : "Utilize os filtros para visualizar as etapas."}
                     </p>
                     {filters.hasActiveFilters && (
                        <button
                           type="button"
                           onClick={filters.clearFilters}
                           className="mt-3 text-sm text-red-600 hover:text-red-700"
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
                     onEditMissao={handleEditMissao}
                     onDeleteMissao={handleDeleteMissao}
                     grouped={groupByMissao}
                  />
               </div>
            )}

            {((groupByMissao
               ? filters.missoes.length > 0
               : filters.flatEtapas.length > 0) ||
               filters.loading) && (
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
                  </div>
                  {filters.totalPages > 1 && (
                     <Pagination
                        currentPage={filters.currentPage}
                        totalPages={filters.totalPages}
                        onPageChange={filters.handlePageChange}
                     />
                  )}
               </nav>
            )}
         </div>

         <MissaoFormModal
            show={showMissaoModal}
            onClose={() => setShowMissaoModal(false)}
            editingMissao={editingMissao}
         />

         <MissaoDeleteModal
            show={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            missao={deletingMissao}
         />
      </div>
   );
}
