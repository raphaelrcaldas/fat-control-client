"use client";

import { useState, useMemo, useCallback } from "react";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useCrm } from "@/hooks/queries";
import type { TripCrmOut } from "services/routes/seg-voo/crm";
import type { SortField, SortDirection, StatusFilter } from "./types";
import { getDateStatus } from "@/app/(home)/aeromedica/cartoes-saude/utils/dateStatus";
import StatCards from "./components/StatCards";
import Filters from "./components/Filters";
import CrmTable from "./components/CrmTable";
import EditCrmDrawer from "./components/EditCrmDrawer";

export default function CrmPage() {
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
      data: crmData = [],
      isLoading,
      isFetching,
   } = useCrm({
      p_g: filterPG.length > 0 ? filterPG.join(",") : undefined,
      funcao: filterFunc.length > 0 ? filterFunc.join(",") : undefined,
   });

   const filteredBySearch = useMemo(() => {
      if (!debouncedSearch) return crmData;
      const q = debouncedSearch.toLowerCase();
      return crmData.filter(
         (item) =>
            item.nome_guerra.toLowerCase().includes(q) ||
            (item.nome_completo?.toLowerCase().includes(q) ?? false)
      );
   }, [crmData, debouncedSearch]);

   const filteredByStatus = useMemo(() => {
      if (statusFilter === "all") return filteredBySearch;
      return filteredBySearch.filter(
         (item) => getDateStatus(item.crm?.data_validade) === statusFilter
      );
   }, [filteredBySearch, statusFilter]);

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
            case "validade": {
               const dateA = a.crm?.data_validade || "";
               const dateB = b.crm?.data_validade || "";
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
      () => crmData.find((item) => item.trip_id === selectedTripId) ?? null,
      [crmData, selectedTripId]
   );

   const handleRowClick = useCallback((item: TripCrmOut) => {
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

   return (
      <div className="flex flex-col gap-4 p-1">
         <div className="rounded-2xl border border-red-100 bg-white p-4 shadow shadow-red-100">
            <h1 className="mb-1 text-2xl font-bold text-red-900">
               CRM — Crew Resource Management
            </h1>
            <p className="text-xs font-bold tracking-[0.2em] text-red-400 uppercase">
               O Homem · O Meio · A Máquina
            </p>
         </div>

         {!isLoading && crmData.length > 0 && <StatCards data={crmData} />}

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
               totalCount={crmData.length}
               filteredCount={sortedData.length}
               isLoading={isLoading}
               isFetching={isFetching}
               hasActiveFilters={hasActiveFilters}
               onClearFilters={clearFilters}
            />

            <CrmTable
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

         {showDrawer && selectedItem && (
            <EditCrmDrawer
               show={showDrawer}
               onClose={handleCloseDrawer}
               item={selectedItem}
            />
         )}
      </div>
   );
}
