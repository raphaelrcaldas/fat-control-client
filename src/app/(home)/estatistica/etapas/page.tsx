"use client";

import { Button, Badge } from "flowbite-react";
import { MdBarChart } from "react-icons/md";
import { HiFilter, HiPlus } from "react-icons/hi";
import { CiPaperplane } from "react-icons/ci";
import Link from "next/link";
import { useState, useCallback, useMemo } from "react";
import { EtapasTable } from "./components/EtapasTable/EtapasTable";
import { EtapasTableSkeleton } from "./components/EtapasTable/EtapasTableSkeleton";
import { EtapasFilterPanel } from "./components/EtapasFilterPanel";
import { ActiveFilterTags } from "./components/ActiveFilterTags";
import { EtapasPendentesAlert } from "./components/EtapasPendentesAlert";
import { MissaoDeleteModal } from "./components/MissaoDeleteModal";
import { ExportColumnsModal } from "@/components/export/ExportColumnsModal";
import { EtapasSelectionBar } from "./components/EtapasSelectionBar";
import { ResultadosInfo } from "./components/ResultadosInfo";
import { useEtapasFilters } from "./hooks/useEtapasFilters";
import { useEtapaSelection } from "./hooks/useEtapaSelection";
import { etapasExportColumns, sortEtapasForExport } from "./exportColumns";
import type { MissaoComEtapas } from "services/routes/estatistica/etapas";
import clsx from "clsx";
import { PermBased } from "../../hooks/usePermBased";

export default function EtapasPage() {
   const [showFilters, setShowFilters] = useState(false);

   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [deletingMissao, setDeletingMissao] = useState<MissaoComEtapas | null>(
      null
   );
   const [showExportModal, setShowExportModal] = useState(false);

   const filters = useEtapasFilters();
   const {
      cart,
      selectedIds,
      visibleSelectedCount,
      allSelected,
      toggleEtapa,
      toggleMissao,
      toggleAll,
   } = useEtapaSelection(filters.missoes);

   const handleDeleteMissao = useCallback((missao: MissaoComEtapas) => {
      setDeletingMissao(missao);
      setShowDeleteModal(true);
   }, []);

   const etapasParaExportar = useMemo(
      () => sortEtapasForExport(cart.items),
      [cart.items]
   );

   return (
      // Reserva estavel para a barra: selecionar a primeira etapa nao deve
      // reduzir de repente a area util da listagem.
      <div className="flex flex-1 flex-col overflow-hidden pb-24">
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
                  <PermBased
                     resource="estatistica.etapas"
                     requiredPerm="create"
                  >
                     {/* No mobile fica só o ícone, para a linha do masthead
                         caber sem quebrar. O rótulo continua no DOM sob
                         `sr-only`, e não removido: sem ele o botão perde o
                         nome acessível e o leitor de tela anuncia só "botão".
                         A margem do ícone acompanha — `mr-2` com o texto
                         escondido deixaria o glifo fora do eixo. */}
                     <Button
                        as={Link}
                        href="/estatistica/etapas/missao/nova"
                        color="primary"
                        size="sm"
                     >
                        <HiPlus className="h-4 w-4 sm:mr-2" />
                        <span className="sr-only sm:not-sr-only">Missao</span>
                     </Button>
                  </PermBased>
                  <Button
                     color="light"
                     size="sm"
                     onClick={() => setShowFilters((v) => !v)}
                     aria-expanded={showFilters}
                     aria-controls="filtros-panel"
                  >
                     <HiFilter className="h-4 w-4 sm:mr-2" />
                     <span className="sr-only sm:not-sr-only">Filtros</span>
                     {/* A contagem fica visível também no mobile: ela é o
                         único sinal de que há filtro ativo quando o painel
                         está fechado. */}
                     {filters.hasActiveFilters && (
                        <Badge color="primary" size="sm" className="ml-2">
                           {filters.activeFilterCount}
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

         {/* Só quem edita etapa pode resolver a pendência — para os demais o
             aviso seria ruído sem ação possível. O PermBased também é o que
             impede a busca de disparar (o componente nem monta). */}
         <PermBased resource="estatistica.etapas" requiredPerm="update">
            <EtapasPendentesAlert
               dataIni={filters.urlDataIni}
               dataFim={filters.urlDataFim}
            />
         </PermBased>

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
            {filters.loading && <EtapasTableSkeleton />}

            {!filters.loading && filters.missoes.length === 0 && (
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

            {filters.missoes.length > 0 && (
               <div
                  className={clsx(
                     "transition-opacity duration-200",
                     filters.isRefetching && "pointer-events-none opacity-40"
                  )}
               >
                  <EtapasTable
                     missoes={filters.missoes}
                     loading={filters.isRefetching}
                     selectedIds={selectedIds}
                     onToggleEtapa={toggleEtapa}
                     onToggleMissao={toggleMissao}
                     onToggleAll={toggleAll}
                     allSelected={allSelected}
                     onDeleteMissao={handleDeleteMissao}
                  />
               </div>
            )}

            {filters.missoes.length > 0 && (
               <div
                  className={clsx(
                     "mt-4 rounded-lg border border-gray-200 bg-white px-4 py-3",
                     "transition-opacity duration-200",
                     filters.isRefetching && "pointer-events-none opacity-50"
                  )}
               >
                  <ResultadosInfo
                     totalMissoes={filters.totalMissoes}
                     totalEtapas={filters.totalEtapas}
                  />
               </div>
            )}
         </div>

         <MissaoDeleteModal
            show={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            missao={deletingMissao}
         />

         <EtapasSelectionBar
            cart={cart}
            visibleSelectedCount={visibleSelectedCount}
            onExport={() => setShowExportModal(true)}
            hidden={showExportModal}
         />

         <ExportColumnsModal
            show={showExportModal}
            onClose={() => setShowExportModal(false)}
            rows={etapasParaExportar}
            columns={etapasExportColumns}
            storageKey="export:estatistica-etapas:columns"
            fileBaseName="etapas"
            sheetName="Etapas"
         />
      </div>
   );
}
