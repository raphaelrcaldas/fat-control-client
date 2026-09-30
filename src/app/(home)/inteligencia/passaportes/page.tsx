"use client";

import { useCallback, useState } from "react";
import { FaPassport } from "react-icons/fa";
import clsx from "clsx";
import { Button } from "flowbite-react";
import { usePassaportes, usePassaportesOrfaos } from "@/hooks/queries";
import type { TripPassaporteOut } from "services/routes/inteligencia/passaportes";
import { usePassaportesFilters } from "./hooks/usePassaportesFilters";
import { usePassaportesView } from "./hooks/usePassaportesView";
import SummaryBar from "./components/SummaryBar";
import SummaryBarSkeleton from "./components/SummaryBarSkeleton";
import Filters from "./components/Filters";
import PassaportesTable from "./components/PassaportesTable";
import PassaportesTableSkeleton from "./components/PassaportesTableSkeleton";
import PassaportesCardList from "./components/PassaportesCardList";
import PassaportesCardListSkeleton from "./components/PassaportesCardListSkeleton";
import EditPassaporteModal from "./components/EditPassaporteModal";
import OrfaosAlert from "./components/OrfaosAlert";
import { PermBased, usePermBased } from "@/app/(home)/hooks/usePermBased";

export default function PassaportesPage() {
   const filters = usePassaportesFilters();

   const {
      data: passaportesData = [],
      isLoading,
      isFetching,
      isError,
      error,
      refetch,
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
   // passaportes, a inserção empurra o resumo + lista já pintados (CLS > 0.1 no
   // mobile). Por isso o boot espera as duas queries e troca skeleton →
   // conteúdo num único commit. Só o alerta, o resumo e a lista esperam: os
   // Filters ficam sempre montados no mesmo ponto da árvore (como em
   // cartoes-saude e crm), com a barra de contagem em skeleton durante o boot.
   const { hasPerm } = usePermBased();
   const canCleanOrfaos = hasPerm("inteligencia.passaportes", "delete");
   const orfaosQuery = usePassaportesOrfaos(canCleanOrfaos);
   const booting = isLoading || (canCleanOrfaos && orfaosQuery.isLoading);

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
            <SummaryBarSkeleton />
         ) : (
            <>
               {/* Limpeza de registros de militares inativos (só quem pode remover) */}
               <PermBased
                  resource="inteligencia.passaportes"
                  requiredPerm="delete"
               >
                  <OrfaosAlert />
               </PermBased>

               {/* Resumo por documento — também é o filtro de status */}
               {passaportesData.length > 0 && (
                  <div
                     className={clsx(
                        "transition-opacity",
                        isFetching && "opacity-50"
                     )}
                  >
                     <SummaryBar
                        passaporteStats={passaporteStats}
                        visaStats={visaStats}
                        validadeFilter={filters.validadeFilter}
                        onValidadeFilterChange={filters.setValidadeFilter}
                     />
                  </div>
               )}
            </>
         )}

         {/* Filtros + lista (cards no mobile, tabela no desktop) */}
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
               isLoading={booting}
               hasActiveFilters={filters.hasActiveFilters}
               onClearFilters={filters.clearFilters}
            />

            {booting ? (
               <>
                  <div className="md:hidden">
                     <PassaportesCardListSkeleton />
                  </div>
                  <div className="hidden md:block">
                     <PassaportesTableSkeleton />
                  </div>
               </>
            ) : isError && passaportesData.length === 0 ? (
               <div
                  role="alert"
                  className="flex flex-col items-center justify-center gap-1 px-6 py-12 text-center"
               >
                  <p className="text-sm font-semibold text-red-800">
                     Não foi possível carregar os passaportes
                  </p>
                  <p className="max-w-md text-xs text-slate-500">
                     {error instanceof Error
                        ? error.message
                        : "Erro desconhecido"}
                  </p>
                  <Button
                     color="light"
                     size="sm"
                     className="mt-3"
                     onClick={() => refetch()}
                     disabled={isFetching}
                  >
                     Tentar novamente
                  </Button>
               </div>
            ) : (
               <>
                  {isError && (
                     <div
                        role="status"
                        className="flex flex-wrap items-center justify-between gap-2 border-t border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800"
                     >
                        <span>
                           Não foi possível atualizar os passaportes. Exibindo a
                           última consulta.
                        </span>
                        <Button
                           color="light"
                           size="xs"
                           onClick={() => refetch()}
                           disabled={isFetching}
                        >
                           Tentar novamente
                        </Button>
                     </div>
                  )}
                  <div
                     className={clsx(
                        "transition-opacity",
                        isFetching && "pointer-events-none opacity-50"
                     )}
                  >
                     <div className="md:hidden">
                        <PassaportesCardList
                           data={sortedData}
                           onCardClick={handleRowClick}
                           hasActiveFilters={filters.hasActiveFilters}
                           onClearFilters={filters.clearFilters}
                        />
                     </div>
                     <div className="hidden md:block">
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
