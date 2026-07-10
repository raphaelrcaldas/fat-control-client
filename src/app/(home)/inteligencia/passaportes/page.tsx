"use client";

import { useCallback, useState } from "react";
import { FaPassport } from "react-icons/fa";
import clsx from "clsx";
import { usePassaportes } from "@/hooks/queries";
import type { TripPassaporteOut } from "services/routes/inteligencia/passaportes";
import { usePassaportesFilters } from "./hooks/usePassaportesFilters";
import { usePassaportesView } from "./hooks/usePassaportesView";
import StatCardsGrid from "./components/StatCards";
import StatCardsSkeleton from "./components/StatCardsSkeleton";
import Filters from "./components/Filters";
import PassaportesTable from "./components/PassaportesTable";
import PassaportesTableSkeleton from "./components/PassaportesTableSkeleton";
import EditPassaporteModal from "./components/EditPassaporteModal";
import OrfaosAlert from "./components/OrfaosAlert";
import { PermBased } from "@/app/(home)/hooks/usePermBased";

export default function PassaportesPage() {
   const filters = usePassaportesFilters();

   const {
      data: passaportesData = [],
      isLoading,
      isFetching,
   } = usePassaportes(filters.queryParams);

   const { sortedData, passaporteStats, visaStats } = usePassaportesView(
      passaportesData,
      filters
   );

   // Snapshot estável do item ao abrir — desacopla o modal de passaportesData,
   // evitando que um refetch em background desmonte o modal ou resete o form.
   const [selectedItem, setSelectedItem] = useState<TripPassaporteOut | null>(
      null
   );
   const [showModal, setShowModal] = useState(false);

   const handleRowClick = useCallback((item: TripPassaporteOut) => {
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
                     <FaPassport className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                     <span className="block font-mono text-[10px] font-bold tracking-[0.3em] text-red-500 uppercase">
                        Inteligência
                     </span>
                     <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                        Passaportes
                     </h1>
                  </div>
               </div>
            </div>
         </header>

         {/* Limpeza de registros de militares inativos (só quem pode remover) */}
         <PermBased resource="passaportes" requiredPerm="delete">
            <OrfaosAlert />
         </PermBased>

         {/* Stat Cards */}
         {isLoading ? (
            <StatCardsSkeleton />
         ) : (
            passaportesData.length > 0 && (
               <div
                  className={clsx(
                     "transition-opacity",
                     isFetching && "opacity-50"
                  )}
               >
                  <StatCardsGrid
                     passaporteStats={passaporteStats}
                     visaStats={visaStats}
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
               statusFilter={filters.statusFilter}
               onStatusFilterChange={filters.setStatusFilter}
               totalCount={passaportesData.length}
               filteredCount={sortedData.length}
               isLoading={isLoading}
               isFetching={isFetching}
               hasActiveFilters={filters.hasActiveFilters}
               onClearFilters={filters.clearFilters}
            />

            {isLoading ? (
               <PassaportesTableSkeleton />
            ) : (
               <div
                  className={clsx(
                     "transition-opacity",
                     isFetching && "pointer-events-none opacity-50"
                  )}
               >
                  <PassaportesTable
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
            <EditPassaporteModal
               show={showModal}
               onClose={handleCloseModal}
               item={selectedItem}
            />
         )}
      </div>
   );
}
