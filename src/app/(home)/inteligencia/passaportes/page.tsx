"use client";

import { useState, useMemo, useCallback } from "react";
import { MdPolicy } from "react-icons/md";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { usePassaportes } from "@/hooks/queries";
import type { TripPassaporteOut } from "services/routes/inteligencia/passaportes";
import type { SortField, SortDirection, StatusFilter } from "./types";
import { getDateStatus, getWorstStatus } from "./utils/dateStatus";
import StatCardsGrid from "./components/StatCards";
import Filters from "./components/Filters";
import PassaportesTable from "./components/PassaportesTable";
import EditPassaporteDrawer from "./components/EditPassaporteDrawer";

export default function PassaportesPage() {
   const [search, setSearch] = useState("");
   const [filterPG, setFilterPG] = useState<string[]>([]);
   const [filterFunc, setFilterFunc] = useState<string[]>([]);
   const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
   const [sortField, setSortField] = useState<SortField | null>(null);
   const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
   const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
   const [showDrawer, setShowDrawer] = useState(false);

   const debouncedSearch = useDebouncedValue(search, 400);

   const {
      data: passaportesData = [],
      isLoading,
      isFetching,
   } = usePassaportes({
      p_g: filterPG.length > 0 ? filterPG.join(",") : undefined,
      funcao: filterFunc.length > 0 ? filterFunc.join(",") : undefined,
   });

   // Filtro de busca (client-side)
   const filteredBySearch = useMemo(() => {
      if (!debouncedSearch) return passaportesData;
      const q = debouncedSearch.toLowerCase();
      return passaportesData.filter(
         (item) =>
            item.nome_guerra.toLowerCase().includes(q) ||
            (item.nome_completo?.toLowerCase().includes(q) ?? false)
      );
   }, [passaportesData, debouncedSearch]);

   // Filtro de status (client-side) — usa o pior status entre passaporte e visa
   const filteredByStatus = useMemo(() => {
      if (statusFilter === "all") return filteredBySearch;
      return filteredBySearch.filter((item) => {
         const worst = getWorstStatus(
            item.passaporte?.validade_passaporte,
            item.passaporte?.validade_visa
         );
         return worst === statusFilter;
      });
   }, [filteredBySearch, statusFilter]);

   // Sort (null = ordem da API — antiguidade)
   const sortedData = useMemo(() => {
      if (!sortField) return filteredByStatus;

      const sorted = [...filteredByStatus];
      sorted.sort((a, b) => {
         let comparison = 0;
         switch (sortField) {
            case "militar":
               comparison = `${a.p_g} ${a.nome_guerra}`.localeCompare(
                  `${b.p_g} ${b.nome_guerra}`
               );
               break;
            case "validade_passaporte":
            case "validade_visa": {
               const dateA = a.passaporte?.[sortField] || "";
               const dateB = b.passaporte?.[sortField] || "";
               if (!dateA && !dateB) return 0;
               if (!dateA) return 1;
               if (!dateB) return -1;
               comparison = dateA.localeCompare(dateB);
               break;
            }
         }
         return sortDirection === "asc" ? comparison : -comparison;
      });
      return sorted;
   }, [filteredByStatus, sortField, sortDirection]);

   const handleSort = useCallback(
      (field: SortField) => {
         if (sortField === field) {
            if (sortDirection === "desc") {
               setSortField(null);
               setSortDirection("asc");
            } else {
               setSortDirection("desc");
            }
         } else {
            setSortField(field);
            setSortDirection("asc");
         }
      },
      [sortField, sortDirection]
   );

   const selectedItem = useMemo(
      () =>
         passaportesData.find((item) => item.trip_id === selectedTripId) ??
         null,
      [passaportesData, selectedTripId]
   );

   const handleRowClick = useCallback((item: TripPassaporteOut) => {
      setSelectedTripId(item.trip_id);
      setShowDrawer(true);
   }, []);

   const handleCloseDrawer = useCallback(() => {
      setShowDrawer(false);
      setSelectedTripId(null);
   }, []);

   const hasActiveFilters =
      !!debouncedSearch ||
      filterPG.length > 0 ||
      filterFunc.length > 0 ||
      statusFilter !== "all";

   const clearFilters = useCallback(() => {
      setSearch("");
      setFilterPG([]);
      setFilterFunc([]);
      setStatusFilter("all");
   }, []);

   // Stats — iteracao unica
   const { passaporteStats, visaStats } = useMemo(() => {
      const passaporte = { valid: 0, warning: 0, critical: 0, expired: 0 };
      const visa = { valid: 0, warning: 0, critical: 0, expired: 0 };
      let passaporteTotal = 0;
      let visaTotal = 0;

      for (const item of passaportesData) {
         const pStatus = getDateStatus(item.passaporte?.validade_passaporte);
         if (pStatus !== "empty") {
            passaporte[pStatus]++;
            passaporteTotal++;
         }

         const vStatus = getDateStatus(item.passaporte?.validade_visa);
         if (vStatus !== "empty") {
            visa[vStatus]++;
            visaTotal++;
         }
      }

      return {
         passaporteStats: { counts: passaporte, total: passaporteTotal },
         visaStats: { counts: visa, total: visaTotal },
      };
   }, [passaportesData]);

   return (
      <div className="flex flex-col gap-4 p-1">
         {/* Header */}
         <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-100 p-2">
               <MdPolicy className="h-6 w-6 text-red-600" />
            </div>
            <div>
               <h1 className="text-xl font-semibold text-gray-900">
                  Passaportes
               </h1>
               <p className="text-sm text-gray-500">
                  Controle de validade de passaportes e vistos
               </p>
            </div>
         </div>

         {/* Stat Cards */}
         {!isLoading && passaportesData.length > 0 && (
            <StatCardsGrid
               passaporteStats={passaporteStats}
               visaStats={visaStats}
            />
         )}

         {/* Filtros + Tabela */}
         <div className="relative overflow-hidden bg-white shadow-md sm:rounded-lg">
            <Filters
               search={search}
               onSearchChange={setSearch}
               filterPG={filterPG}
               onFilterPGChange={setFilterPG}
               filterFunc={filterFunc}
               onFilterFuncChange={setFilterFunc}
               statusFilter={statusFilter}
               onStatusFilterChange={setStatusFilter}
               totalCount={passaportesData.length}
               filteredCount={sortedData.length}
               isLoading={isLoading}
               isFetching={isFetching}
               hasActiveFilters={hasActiveFilters}
               onClearFilters={clearFilters}
            />

            <PassaportesTable
               data={sortedData}
               isLoading={isLoading}
               sortField={sortField}
               sortDirection={sortDirection}
               onSort={handleSort}
               onRowClick={handleRowClick}
               hasActiveFilters={hasActiveFilters}
               onClearFilters={clearFilters}
            />
         </div>

         {/* Edit Drawer */}
         {showDrawer && selectedItem && (
            <EditPassaporteDrawer
               show={showDrawer}
               onClose={handleCloseDrawer}
               item={selectedItem}
            />
         )}
      </div>
   );
}
