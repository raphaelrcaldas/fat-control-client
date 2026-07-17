"use client";

import { useCallback, useState } from "react";
import { FaPassport } from "react-icons/fa";
import clsx from "clsx";
import { usePassaportes, usePassaportesOrfaos } from "@/hooks/queries";
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
import { PermBased, usePermBased } from "@/app/(home)/hooks/usePermBased";

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

   // O alerta de órfãos entra em cima da página; se ele resolver depois dos
   // passaportes, a inserção empurra cards + tabela já pintados (CLS > 0.1 no
   // mobile). Por isso o boot espera as duas queries e troca skeleton →
   // conteúdo num único commit, remontando a região inteira de uma vez.
   const { hasPerm } = usePermBased();
   const canCleanOrfaos = hasPerm("passaportes", "delete");
   const orfaosQuery = usePassaportesOrfaos(canCleanOrfaos);
   const booting = isLoading || (canCleanOrfaos && orfaosQuery.isLoading);

   const filtersEl = (
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
   );

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
                     <FaPassport className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                     <span className="text-primary-600 block font-mono text-[10px] font-bold tracking-[0.3em] uppercase">
                        Inteligência
                     </span>
                     <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                        Passaportes
                     </h1>
                  </div>
               </div>
            </div>
         </header>

         {booting ? (
            <>
               <StatCardsSkeleton />
               <div className="relative overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
                  {filtersEl}
                  <PassaportesTableSkeleton />
               </div>
            </>
         ) : (
            <>
               {/* Limpeza de registros de militares inativos (só quem pode remover) */}
               <PermBased resource="passaportes" requiredPerm="delete">
                  <OrfaosAlert />
               </PermBased>

               {/* Stat Cards */}
               {passaportesData.length > 0 && (
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
               )}

               {/* Filtros + Tabela */}
               <div className="relative overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
                  {filtersEl}
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
               </div>
            </>
         )}

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
