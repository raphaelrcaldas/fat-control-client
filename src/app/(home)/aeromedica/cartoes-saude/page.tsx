"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { getCemalStatus, getDateStatus } from "./utils/dateStatus";
import { compareByAntiguidade } from "utils/sortByAntiguidade";
import StatCardsGrid from "./components/StatCards";
import Filters from "./components/Filters";
import CartoesSaudeTable from "./components/CartoesSaudeTable";
import EditCartaoDrawer from "./components/EditCartaoDrawer";

// Helper: parse comma-separated URL param into array
function parseCommaSeparated(value: string | null): string[] {
   if (!value) return [];
   return value.split(",").filter(Boolean);
}

export default function CartoesSaudePage() {
   const searchParams = useSearchParams();
   const router = useRouter();

   // --- Leitura dos filtros da URL ---
   const urlSearch = searchParams.get("search") ?? "";
   const filterPG = parseCommaSeparated(searchParams.get("pg"));
   const filterFunc = parseCommaSeparated(searchParams.get("func"));
   const tripFilter = (searchParams.get("trip") as TripFilter) || "all";
   const statusFilter = (searchParams.get("status") as StatusFilter) || "all";

   // --- Estado local apenas para o campo de busca (feedback imediato) ---
   const [searchUser, setSearchUser] = useState(urlSearch);
   const [sortField, setSortField] = useState<SortField | null>(null);
   const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
   const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
   const [showDrawer, setShowDrawer] = useState(false);

   const debouncedSearch = useDebouncedValue(searchUser, 500);

   // --- Helper para atualizar a URL ---
   const updateParams = useCallback(
      (updates: Record<string, string | undefined>, resetPage = true) => {
         const params = new URLSearchParams(searchParams.toString());

         for (const [key, value] of Object.entries(updates)) {
            if (value === undefined || value === "" || value === "all") {
               params.delete(key);
            } else {
               params.set(key, value);
            }
         }

         if (resetPage) params.delete("page");

         const qs = params.toString();
         router.replace(qs ? `?${qs}` : "?", { scroll: false });
      },
      [searchParams, router]
   );

   // --- Sincroniza debounce do search com a URL ---
   useEffect(() => {
      if (debouncedSearch !== urlSearch) {
         updateParams({ search: debouncedSearch || undefined });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [debouncedSearch]);

   // --- Sincroniza URL de volta ao input em navegação ---
   useEffect(() => {
      if (urlSearch !== searchUser && urlSearch !== debouncedSearch) {
         setSearchUser(urlSearch);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [urlSearch]);

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
      if (statusFilter === "sem_ata") {
         return cartoesSaude.filter((item) => item.cemal_tem_ata === false);
      }
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
               comparison = compareByAntiguidade(a.user, b.user);
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

   const handleTripFilterChange = useCallback(
      (value: TripFilter) => {
         updateParams(
            value === "naoTrip"
               ? { trip: value, func: undefined }
               : { trip: value }
         );
      },
      [updateParams]
   );

   const handlePGChange = useCallback(
      (values: string[]) => {
         updateParams({ pg: values.length > 0 ? values.join(",") : undefined });
      },
      [updateParams]
   );

   const handleFuncChange = useCallback(
      (values: string[]) => {
         updateParams({
            func: values.length > 0 ? values.join(",") : undefined,
         });
      },
      [updateParams]
   );

   const handleStatusChange = useCallback(
      (value: StatusFilter) => {
         updateParams({ status: value });
      },
      [updateParams]
   );

   const selectedItem = useMemo(
      () =>
         cartoesSaude.find((item) => item.user.id === selectedUserId) ?? null,
      [cartoesSaude, selectedUserId]
   );

   const handleRowClick = useCallback((item: UserCartaoSaude) => {
      setSelectedUserId(item.user.id);
      setShowDrawer(true);
   }, []);

   const handleCloseDrawer = () => {
      setShowDrawer(false);
      setSelectedUserId(null);
   };

   const hasActiveFilters =
      !!urlSearch ||
      filterPG.length > 0 ||
      filterFunc.length > 0 ||
      tripFilter !== "all" ||
      statusFilter !== "all";

   const clearFilters = useCallback(() => {
      setSearchUser("");
      updateParams({
         search: undefined,
         pg: undefined,
         func: undefined,
         trip: undefined,
         status: undefined,
      });
   }, [updateParams]);

   // Stats por campo (iteração única)
   const { cemalStats, cemalScheduled, tovnStats, imaeStats } = useMemo(() => {
      const cemal = { valid: 0, warning: 0, critical: 0, expired: 0, empty: 0 };
      const tovn = { valid: 0, warning: 0, critical: 0, expired: 0, empty: 0 };
      const imae = { valid: 0, warning: 0, critical: 0, expired: 0, empty: 0 };
      let cemalTotal = 0;
      let tovnTotal = 0;
      let imaeTotal = 0;
      let scheduled = 0;

      for (const item of cartoesSaude) {
         const c = item.cartao;
         const cemalStatus = getCemalStatus(item);
         cemal[cemalStatus]++;
         if (cemalStatus !== "empty") cemalTotal++;

         if (c?.ag_cemal) scheduled++;

         const tovnStatus = getDateStatus(c?.tovn);
         tovn[tovnStatus]++;
         if (tovnStatus !== "empty") tovnTotal++;

         const imaeStatus = getDateStatus(c?.imae);
         imae[imaeStatus]++;
         if (imaeStatus !== "empty") imaeTotal++;
      }

      return {
         cemalStats: { counts: cemal, total: cemalTotal },
         cemalScheduled: scheduled,
         tovnStats: { counts: tovn, total: tovnTotal },
         imaeStats: { counts: imae, total: imaeTotal },
      };
   }, [cartoesSaude]);

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
               onFilterPGChange={handlePGChange}
               filterFunc={filterFunc}
               onFilterFuncChange={handleFuncChange}
               tripFilter={tripFilter}
               onTripFilterChange={handleTripFilterChange}
               statusFilter={statusFilter}
               onStatusFilterChange={handleStatusChange}
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
