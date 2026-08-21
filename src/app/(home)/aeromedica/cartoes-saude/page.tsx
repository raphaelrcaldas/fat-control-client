"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MdHealthAndSafety } from "react-icons/md";
import clsx from "clsx";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useCartoesSaude } from "@/hooks/queries";
import type { UserCartaoSaude } from "services/routes/aeromedica/cartoesSaude";
import type {
   SortField,
   SortDirection,
   TripFilter,
   StatusFilter,
} from "./types";
import {
   getCemalStatus,
   getDateStatus,
   getWorstStatus,
} from "./utils/dateStatus";
import { compareByAntiguidade } from "utils/sortByAntiguidade";
import StatCardsGrid from "./components/StatCards";
import StatCardsSkeleton from "./components/StatCardsSkeleton";
import Filters, { STATUS_VALUES } from "./components/Filters";
import CartoesSaudeTable from "./components/CartoesSaudeTable";
import CartoesSaudeTableSkeleton from "./components/CartoesSaudeTableSkeleton";
import EditCartaoDrawer from "./components/EditCartaoDrawer";
import OrfaosAlert from "./components/OrfaosAlert";
import { PermBased } from "../../hooks/usePermBased";

// Helper: parse comma-separated URL param into array
function parseCommaSeparated(value: string | null): string[] {
   if (!value) return [];
   return value.split(",").filter(Boolean);
}

const TRIP_VALUES: TripFilter[] = ["all", "trip", "naoTrip"];

export default function CartoesSaudePage() {
   const searchParams = useSearchParams();
   const router = useRouter();

   // --- Leitura dos filtros da URL ---
   const urlSearch = searchParams.get("search") ?? "";
   const filterPG = parseCommaSeparated(searchParams.get("pg"));
   const filterFunc = parseCommaSeparated(searchParams.get("func"));
   // Validados contra os valores conhecidos: `?status=xyz` na URL deixava a
   // tabela vazia enquanto o seletor continuava exibindo "Todos".
   const tripParamRaw = searchParams.get("trip");
   const tripFilter: TripFilter = TRIP_VALUES.includes(
      tripParamRaw as TripFilter
   )
      ? (tripParamRaw as TripFilter)
      : "all";

   const statusParamRaw = searchParams.get("status");
   const statusFilter: StatusFilter = STATUS_VALUES.includes(
      statusParamRaw as StatusFilter
   )
      ? (statusParamRaw as StatusFilter)
      : "all";

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
      // O filtro seleciona pelo mesmo farol exibido na linha (pior status
      // entre as datas preenchidas) — senão "Regular" devolveria militar com
      // bolinha vermelha por causa de TOVN/IMAE.
      return cartoesSaude.filter(
         (item) => getWorstStatus(item) === statusFilter
      );
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
               // Datas ausentes vão sempre para o fim, independente da
               // direção — não competem na ordenação cronológica.
               if (!dateA && !dateB) comparison = 0;
               else if (!dateA) return 1;
               else if (!dateB) return -1;
               else comparison = dateA.localeCompare(dateB);
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
   const { cemalStats, tovnStats, imaeStats } = useMemo(() => {
      const cemal = { valid: 0, warning: 0, critical: 0, expired: 0, empty: 0 };
      const tovn = { valid: 0, warning: 0, critical: 0, expired: 0, empty: 0 };
      const imae = { valid: 0, warning: 0, critical: 0, expired: 0, empty: 0 };
      let cemalTotal = 0;
      let tovnTotal = 0;
      let imaeTotal = 0;

      for (const item of cartoesSaude) {
         const c = item.cartao;
         const cemalStatus = getCemalStatus(item);
         cemal[cemalStatus]++;
         if (cemalStatus !== "empty") cemalTotal++;

         const tovnStatus = getDateStatus(c?.tovn);
         tovn[tovnStatus]++;
         if (tovnStatus !== "empty") tovnTotal++;

         const imaeStatus = getDateStatus(c?.imae);
         imae[imaeStatus]++;
         if (imaeStatus !== "empty") imaeTotal++;
      }

      return {
         cemalStats: { counts: cemal, total: cemalTotal },
         tovnStats: { counts: tovn, total: tovnTotal },
         imaeStats: { counts: imae, total: imaeTotal },
      };
   }, [cartoesSaude]);

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
                     <MdHealthAndSafety className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                     <span className="text-primary-600 block font-mono text-[10px] font-bold tracking-[0.3em] uppercase">
                        Aeromédica
                     </span>
                     <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                        Cartões de Saúde
                     </h1>
                  </div>
               </div>
            </div>
         </header>

         {/* Documentos de usuários inativos (gated por permissão de remoção) */}
         <PermBased resource="aeromedica.cartoes" requiredPerm="delete">
            <OrfaosAlert />
         </PermBased>

         {/* Stat Cards */}
         {isLoading ? (
            <StatCardsSkeleton />
         ) : (
            cartoesSaude.length > 0 && (
               <div
                  className={clsx(
                     "transition-opacity",
                     isFetching && "opacity-50"
                  )}
               >
                  <StatCardsGrid
                     cemalStats={cemalStats}
                     imaeStats={imaeStats}
                     tovnStats={tovnStats}
                  />
               </div>
            )
         )}

         {/* Filtros + Tabela — sem `overflow-hidden`: o Dropdown do Flowbite
             0.12.17 não usa portal e o recorte do card comia as opções do menu
             de status (no mobile, "Todos" ficava fora da vista). O canto
             arredondado da base fica por conta do wrapper da tabela. */}
         <div className="relative rounded border border-slate-200 bg-white shadow-sm">
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

            {isLoading ? (
               <CartoesSaudeTableSkeleton />
            ) : (
               <div
                  className={clsx(
                     "transition-opacity",
                     isFetching && "pointer-events-none opacity-50"
                  )}
               >
                  <CartoesSaudeTable
                     data={sortedData}
                     sortField={sortField}
                     sortDirection={sortDirection}
                     onSort={handleSort}
                     onRowClick={handleRowClick}
                     hasActiveFilters={hasActiveFilters}
                     searchTerm={urlSearch}
                  />
               </div>
            )}
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
