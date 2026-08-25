"use client";

import { useCallback, useState } from "react";
import { MdGroups } from "react-icons/md";
import clsx from "clsx";
import { useCrm } from "@/hooks/queries";
import type { TripCrmOut } from "services/routes/seg-voo/crm";
import { useCrmFilters } from "./hooks/useCrmFilters";
import { useCrmView } from "./hooks/useCrmView";
import SummaryBar from "./components/SummaryBar";
import SummaryBarSkeleton from "./components/SummaryBarSkeleton";
import Filters from "./components/Filters";
import CrmTable from "./components/CrmTable";
import CrmTableSkeleton from "./components/CrmTableSkeleton";
import CrmCardList from "./components/CrmCardList";
import CrmCardListSkeleton from "./components/CrmCardListSkeleton";
import EditCrmModal from "./components/EditCrmModal";
import OrfaosAlert from "./components/OrfaosAlert";
import { PermBased } from "../../hooks/usePermBased";

export default function CrmPage() {
   const filters = useCrmFilters();

   const {
      data: crmData = [],
      isLoading,
      isFetching,
   } = useCrm(filters.queryParams);

   const { sortedData, stats } = useCrmView(crmData, filters);

   // Snapshot estável do item ao abrir — desacopla o modal de crmData,
   // evitando que um refetch em background desmonte o modal ou resete o form.
   const [selectedItem, setSelectedItem] = useState<TripCrmOut | null>(null);
   const [showModal, setShowModal] = useState(false);

   const handleRowClick = useCallback((item: TripCrmOut) => {
      setSelectedItem(item);
      setShowModal(true);
   }, []);

   const handleCloseModal = useCallback(() => {
      setShowModal(false);
      setSelectedItem(null);
   }, []);

   return (
      <div className="flex flex-col space-y-2">
         {/* Masthead */}
         <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
            <span
               aria-hidden
               className="bg-primary-600 absolute top-0 left-0 h-full w-1"
            />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
               <div className="flex min-w-0 items-center gap-4">
                  <div className="bg-primary-50 text-primary-600 ring-primary-100 grid h-12 w-12 shrink-0 place-items-center rounded-md ring-1 ring-inset">
                     <MdGroups className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                     <span className="text-primary-600 block font-mono text-[10px] font-bold tracking-[0.3em] uppercase">
                        Segurança de Voo
                     </span>
                     <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                        CRM
                     </h1>
                  </div>
               </div>
            </div>
         </header>

         {/* Documentos de inativos (gated por permissão de remoção) */}
         <PermBased resource="seg_voo.crm" requiredPerm="delete">
            <OrfaosAlert />
         </PermBased>

         {/* Resumo — os contadores são o filtro de status */}
         {isLoading ? (
            <SummaryBarSkeleton />
         ) : (
            crmData.length > 0 && (
               <div
                  className={clsx(
                     "transition-opacity",
                     // `pointer-events-none` junto do esmaecimento: a 50% o
                     // controle sinaliza "desabilitado", então não pode
                     // continuar respondendo ao clique (mesma regra da lista).
                     isFetching && "pointer-events-none opacity-50"
                  )}
               >
                  <SummaryBar
                     stats={stats}
                     statusFilter={filters.statusFilter}
                     onStatusFilterChange={filters.setStatusFilter}
                  />
               </div>
            )
         )}

         {/* Filtros + Tabela */}
         <div className="relative overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
            <Filters
               search={filters.search}
               onSearchChange={filters.setSearch}
               filterPG={filters.filterPG}
               onFilterPGChange={filters.setFilterPG}
               filterFunc={filters.filterFunc}
               onFilterFuncChange={filters.setFilterFunc}
               totalCount={crmData.length}
               filteredCount={sortedData.length}
               isLoading={isLoading}
               isFetching={isFetching}
               hasActiveFilters={filters.hasActiveFilters}
               onClearFilters={filters.clearFilters}
            />

            {isLoading ? (
               <>
                  <div className="md:hidden">
                     <CrmCardListSkeleton />
                  </div>
                  <div className="hidden md:block">
                     <CrmTableSkeleton />
                  </div>
               </>
            ) : (
               <div
                  className={clsx(
                     "transition-opacity",
                     isFetching && "pointer-events-none opacity-50"
                  )}
               >
                  {/* Cards no dedo, tabela no mouse. As duas árvores ficam
                      montadas e só uma é exibida (o `client` não tem hook de
                      media query): evita o flash de remontagem ao girar o
                      aparelho, ao custo de DOM extra. */}
                  <div className="md:hidden">
                     <CrmCardList
                        data={sortedData}
                        onCardClick={handleRowClick}
                        hasActiveFilters={filters.hasActiveFilters}
                        searchTerm={filters.debouncedSearch}
                     />
                  </div>
                  <div className="hidden md:block">
                     <CrmTable
                        data={sortedData}
                        sortField={filters.sortField}
                        sortDirection={filters.sortDirection}
                        onSort={filters.handleSort}
                        onRowClick={handleRowClick}
                        hasActiveFilters={filters.hasActiveFilters}
                        searchTerm={filters.debouncedSearch}
                     />
                  </div>
               </div>
            )}
         </div>

         {/* Edit Modal */}
         {showModal && selectedItem && (
            <EditCrmModal
               show={showModal}
               onClose={handleCloseModal}
               item={selectedItem}
            />
         )}
      </div>
   );
}
