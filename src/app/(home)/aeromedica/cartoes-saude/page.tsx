"use client";

import { useState, useMemo, useCallback } from "react";
import { MdHealthAndSafety } from "react-icons/md";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useCartoesSaude } from "@/hooks/queries";
import type { UserCartaoSaude } from "services/routes/aeromedica/cartoesSaude";
import type {
   SortField,
   SortDirection,
   TripFilter,
   StatusFilter,
} from "./types";
import { getCemalStatus, countFieldStatuses } from "./utils/dateStatus";
import StatCardsGrid from "./components/StatCards";
import Filters from "./components/Filters";
import CartoesSaudeTable from "./components/CartoesSaudeTable";
import EditCartaoDrawer from "./components/editCartaoDrawer";

export default function CartoesSaudePage() {
   const [searchUser, setSearchUser] = useState("");
   const [filterPG, setFilterPG] = useState<string[]>([]);
   const [filterFunc, setFilterFunc] = useState<string[]>([]);
   const [tripFilter, setTripFilter] = useState<TripFilter>("all");
   const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
   const [sortField, setSortField] = useState<SortField | null>(null);
   const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
   const [selectedItem, setSelectedItem] = useState<UserCartaoSaude | null>(
      null
   );
   const [showDrawer, setShowDrawer] = useState(false);

   const debouncedSearch = useDebouncedValue(searchUser, 500);

   // Filtro de tripulante enviado ao backend
   const tripParam =
      tripFilter === "trip"
         ? true
         : tripFilter === "naoTrip"
           ? false
           : undefined;

   const {
      data: cartoesSaude = [],
      isLoading,
      isFetching,
   } = useCartoesSaude({
      search: debouncedSearch || undefined,
      p_g: filterPG.length > 0 ? filterPG.join(",") : undefined,
      funcao: filterFunc.length > 0 ? filterFunc.join(",") : undefined,
      tripulante: tripParam,
   });

   // Filtro de status (client-side)
   const filteredByStatus = useMemo(() => {
      if (statusFilter === "all") return cartoesSaude;
      return cartoesSaude.filter((item) => {
         const worst = getCemalStatus(item);
         return worst === statusFilter;
      });
   }, [cartoesSaude, statusFilter]);

   // Sort (null = antiguidade da API)
   const sortedData = useMemo(() => {
      if (!sortField) return filteredByStatus;

      const sorted = [...filteredByStatus];
      sorted.sort((a, b) => {
         let comparison = 0;
         switch (sortField) {
            case "militar":
               comparison =
                  `${a.user.posto.short} ${a.user.nome_guerra}`.localeCompare(
                     `${b.user.posto.short} ${b.user.nome_guerra}`
                  );
               break;
            case "cemal":
            case "tovn":
            case "imae": {
               const dateA = a.cartao?.[sortField] || "";
               const dateB = b.cartao?.[sortField] || "";
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

   const handleRowClick = (item: UserCartaoSaude) => {
      setSelectedItem(item);
      setShowDrawer(true);
   };

   const handleCloseDrawer = () => {
      setShowDrawer(false);
      setSelectedItem(null);
   };

   const hasActiveFilters =
      !!searchUser ||
      filterPG.length > 0 ||
      filterFunc.length > 0 ||
      tripFilter !== "all" ||
      statusFilter !== "all";

   const clearFilters = () => {
      setSearchUser("");
      setFilterPG([]);
      setFilterFunc([]);
      setTripFilter("all");
      setStatusFilter("all");
   };

   // Stats por campo
   const cemalStats = useMemo(
      () => countFieldStatuses(cartoesSaude, "cemal"),
      [cartoesSaude]
   );
   const cemalScheduled = useMemo(
      () => cartoesSaude.filter((i) => i.cartao?.ag_cemal).length,
      [cartoesSaude]
   );
   const tovnStats = useMemo(
      () => countFieldStatuses(cartoesSaude, "tovn"),
      [cartoesSaude]
   );
   const imaeStats = useMemo(
      () => countFieldStatuses(cartoesSaude, "imae"),
      [cartoesSaude]
   );

   return (
      <div className="flex flex-col gap-4 p-1">
         {/* Header */}
         <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-100 p-2">
               <MdHealthAndSafety className="h-6 w-6 text-red-600" />
            </div>
            <div>
               <h1 className="text-xl font-semibold text-gray-900">
                  Cartões de Saúde
               </h1>
               <p className="text-sm text-gray-500">
                  Controle de validade das inspeções
               </p>
            </div>
         </div>

         {/* Stat Cards */}
         {!isLoading && cartoesSaude.length > 0 && (
            <StatCardsGrid
               cemalStats={cemalStats}
               cemalScheduled={cemalScheduled}
               imaeStats={imaeStats}
               tovnStats={tovnStats}
            />
         )}

         {/* Filtros + Tabela */}
         <div className="relative overflow-hidden bg-white shadow-md sm:rounded-lg">
            <Filters
               searchUser={searchUser}
               onSearchChange={setSearchUser}
               filterPG={filterPG}
               onFilterPGChange={setFilterPG}
               filterFunc={filterFunc}
               onFilterFuncChange={setFilterFunc}
               tripFilter={tripFilter}
               onTripFilterChange={setTripFilter}
               statusFilter={statusFilter}
               onStatusFilterChange={setStatusFilter}
               totalCount={cartoesSaude.length}
               filteredCount={sortedData.length}
               isLoading={isLoading}
               isFetching={isFetching}
               hasActiveFilters={hasActiveFilters}
               onClearFilters={clearFilters}
            />

            <CartoesSaudeTable
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
            <EditCartaoDrawer
               show={showDrawer}
               onClose={handleCloseDrawer}
               item={selectedItem}
            />
         )}
      </div>
   );
}
