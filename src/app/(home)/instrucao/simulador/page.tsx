"use client";

import { useState } from "react";
import { Alert, Button } from "flowbite-react";
import clsx from "clsx";
import { MdFlightTakeoff } from "react-icons/md";
import { useSimuladorFilters } from "./hooks/useSimuladorFilters";
import { useSimuladorActions } from "./hooks/useSimuladorActions";
import SimuladorHeader from "./components/SimuladorHeader";
import { SimuladorFilterPanel } from "./components/SimuladorFilterPanel";
import { ActiveFilterTags } from "./components/ActiveFilterTags";
import { DuplasList } from "./components/DuplasList/DuplasList";
import { DuplasListSkeleton } from "./components/DuplasList/DuplasListSkeleton";

export default function SimuladorPage() {
   const [showFilters, setShowFilters] = useState(false);

   const filters = useSimuladorFilters();
   const { deleteDupla, isDeletingDupla } = useSimuladorActions();

   return (
      <div className="space-y-2">
         <SimuladorHeader
            showFilters={showFilters}
            activeFilterCount={filters.activeFilterCount}
            anoRef={filters.anoRef}
            onToggleFilters={() => setShowFilters((visible) => !visible)}
         >
            <SimuladorFilterPanel
               anoRef={filters.anoRef}
               yearOptions={filters.yearOptions}
               filterPiloto={filters.filterPiloto}
               onAnoChange={filters.handleAnoChange}
               onPilotoChange={filters.setFilterPiloto}
            />
         </SimuladorHeader>

         <ActiveFilterTags
            anoRef={filters.anoRef}
            anoActive={filters.anoActive}
            piloto={filters.urlPiloto}
            pilotoActive={filters.pilotoActive}
            onRemoveAno={filters.removeAnoFilter}
            onRemovePiloto={filters.removePilotoFilter}
            onClearAll={filters.clearFilters}
         />

         {filters.isError && (
            <Alert color="failure">
               Erro ao carregar as sessões do simulador. Verifique a conexão e
               tente novamente.
            </Alert>
         )}

         {filters.isLoading && <DuplasListSkeleton />}

         {!filters.isLoading &&
            !filters.isError &&
            filters.totalDuplas === 0 && (
               <div className="flex h-64 flex-col items-center justify-center rounded border border-gray-200 bg-white px-4 text-center shadow-sm">
                  <div className="mb-4 rounded-full bg-gray-100 p-4">
                     <MdFlightTakeoff className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="mb-2 text-lg font-semibold text-gray-900">
                     {filters.hasActiveFilters
                        ? "Nenhuma dupla encontrada"
                        : "Nenhuma dupla disponível"}
                  </p>
                  <p className="max-w-md text-sm text-gray-500">
                     {filters.hasActiveFilters
                        ? "Não foram encontrados resultados com os filtros aplicados."
                        : "Crie uma nova dupla para registrar a primeira sessão de simulador."}
                  </p>
                  {filters.hasActiveFilters && (
                     <Button
                        color="light"
                        size="sm"
                        onClick={filters.clearFilters}
                        className="mt-3"
                     >
                        Limpar filtros
                     </Button>
                  )}
               </div>
            )}

         {!filters.isError && filters.duplas.length > 0 && (
            <div
               className={clsx(
                  "transition-opacity duration-200",
                  filters.isRefetching && "pointer-events-none opacity-50"
               )}
            >
               <DuplasList
                  duplas={filters.duplas}
                  onDeleteDupla={deleteDupla}
                  isDeletingDupla={isDeletingDupla}
               />
            </div>
         )}
      </div>
   );
}
