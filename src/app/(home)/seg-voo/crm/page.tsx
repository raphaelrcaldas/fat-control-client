"use client";

import { useCallback, useState } from "react";
import { MdGroups } from "react-icons/md";
import clsx from "clsx";
import { useCrm } from "@/hooks/queries";
import type { TripCrmOut } from "services/routes/seg-voo/crm";
import { useCrmFilters } from "./hooks/useCrmFilters";
import { useCrmView } from "./hooks/useCrmView";
import StatCards from "./components/StatCards";
import StatCardsSkeleton from "./components/StatCardsSkeleton";
import Filters from "./components/Filters";
import CrmTable from "./components/CrmTable";
import CrmTableSkeleton from "./components/CrmTableSkeleton";
import EditCrmModal from "./components/EditCrmModal";
import OrfaosAlert from "./components/OrfaosAlert";

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
               className="absolute top-0 left-0 h-full w-1 bg-red-600"
            />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
               <div className="flex min-w-0 items-center gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-red-50 text-red-600 ring-1 ring-red-100 ring-inset">
                     <MdGroups className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                     <span className="block font-mono text-[10px] font-bold tracking-[0.3em] text-red-500 uppercase">
                        Segurança de Voo
                     </span>
                     <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                        CRM
                     </h1>
                  </div>
               </div>
            </div>
         </header>

         <OrfaosAlert />

         {/* Stat Cards */}
         {isLoading ? (
            <StatCardsSkeleton />
         ) : (
            crmData.length > 0 && (
               <div
                  className={clsx(
                     "transition-opacity",
                     isFetching && "opacity-50"
                  )}
               >
                  <StatCards stats={stats} />
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
               statusFilter={filters.statusFilter}
               onStatusFilterChange={filters.setStatusFilter}
               totalCount={crmData.length}
               filteredCount={sortedData.length}
               isLoading={isLoading}
               isFetching={isFetching}
               hasActiveFilters={filters.hasActiveFilters}
               onClearFilters={filters.clearFilters}
            />

            {isLoading ? (
               <CrmTableSkeleton />
            ) : (
               <div
                  className={clsx(
                     "transition-opacity",
                     isFetching && "pointer-events-none opacity-50"
                  )}
               >
                  <CrmTable
                     data={sortedData}
                     sortField={filters.sortField}
                     sortDirection={filters.sortDirection}
                     onSort={filters.handleSort}
                     onRowClick={handleRowClick}
                     hasActiveFilters={filters.hasActiveFilters}
                     onClearFilters={filters.clearFilters}
                  />
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
