"use client";

import { Button } from "flowbite-react";
import { CardMission } from "./components/cardMission";
import { TableMission } from "./components/tableMission";
import { RegistrosSkeleton } from "./components/RegistrosSkeleton";
import { ActiveFiltersBar } from "./components/ActiveFiltersBar";
import { FiltersPanel } from "./components/FiltersPanel";
import { useMissoes } from "@/hooks/queries/useMissoes";
import { usePersistedState } from "@/hooks/usePersistedState";
import { Pagination } from "@/components/Pagination";
import { useRegistrosFilters } from "./hooks/useRegistrosFilters";
import { HiViewGrid, HiViewList } from "react-icons/hi";
import clsx from "clsx";

const perPage = 20;

export function RegisPage() {
   const [viewMode, setViewMode] = usePersistedState<"cards" | "table">(
      "missoes-view-mode",
      "cards"
   );
   const [filtersExpanded, setFiltersExpanded] = usePersistedState<boolean>(
      "missoes-filtros-expanded",
      true
   );

   const filters = useRegistrosFilters();
   const {
      tipoDoc,
      nDoc,
      selectedTipo,
      userSearch,
      citySearch,
      dataInicio,
      dataFim,
      selectedEtiquetaIds,
      currentPage,
      handlePageChange,
      hasActiveFilters,
      clearFilters,
   } = filters;

   const { data, isLoading, isFetching, isError, error, refetch } = useMissoes({
      page: currentPage,
      per_page: perPage,
      tipo_doc: tipoDoc.length > 0 ? tipoDoc.join(",") : undefined,
      n_doc: nDoc || undefined,
      tipo: selectedTipo.length > 0 ? selectedTipo.join(",") : undefined,
      ini: dataInicio || undefined,
      fim: dataFim || undefined,
      user_search: userSearch || undefined,
      city: citySearch || undefined,
      etiqueta_ids:
         selectedEtiquetaIds.length > 0
            ? selectedEtiquetaIds.join(",")
            : undefined,
   });

   const missoes = data?.items ?? null;
   const totalPages = data?.pages ?? 1;
   const total = data?.total ?? 0;

   return (
      <div className="flex h-full flex-col gap-2 overflow-hidden">
         <FiltersPanel filters={filters} show={filtersExpanded} />

         <ActiveFiltersBar
            filters={filters}
            filtersExpanded={filtersExpanded}
            onToggleFilters={() => setFiltersExpanded((v) => !v)}
         />

         {/* Results Section */}
         <section className="order-3 flex-1">
            {isLoading && !missoes ? (
               <RegistrosSkeleton viewMode={viewMode} />
            ) : isError && !missoes ? (
               <div className="flex flex-col items-center justify-center gap-3 rounded border border-red-200 bg-red-50 p-8">
                  <p className="text-sm font-medium text-red-800">
                     Erro ao carregar as missões
                  </p>
                  <p className="text-xs text-red-600">
                     {error instanceof Error
                        ? error.message
                        : "Falha na comunicação com o servidor"}
                  </p>
                  <Button color="red" size="sm" onClick={() => refetch()}>
                     Tentar novamente
                  </Button>
               </div>
            ) : (
               <div
                  className={clsx(
                     "transition-opacity",
                     isFetching && "opacity-50"
                  )}
               >
                  {/* Results Grid */}
                  {missoes?.length === 0 ? (
                     <div className="flex flex-col items-center justify-center rounded border border-slate-200 bg-gray-50 p-8">
                        <p className="mb-3 text-sm text-gray-600">
                           Nenhuma missão encontrada
                        </p>
                        {hasActiveFilters && (
                           <button
                              onClick={clearFilters}
                              className="text-primary-700 hover:text-primary-800 text-sm"
                           >
                              Limpar Filtros
                           </button>
                        )}
                     </div>
                  ) : (
                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <h3 className="text-lg font-bold text-gray-800">
                              Registros Encontrados ({total})
                           </h3>
                           <div className="flex overflow-hidden rounded border border-slate-200">
                              <button
                                 type="button"
                                 onClick={() => setViewMode("cards")}
                                 className={clsx(
                                    "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors",
                                    viewMode === "cards"
                                       ? "bg-primary-600 text-white"
                                       : "bg-white text-gray-600 hover:bg-gray-50"
                                 )}
                              >
                                 <HiViewGrid className="h-4 w-4" />
                                 <span className="hidden sm:inline">Cards</span>
                              </button>
                              <button
                                 type="button"
                                 onClick={() => setViewMode("table")}
                                 className={clsx(
                                    "flex items-center gap-1.5 border-l border-slate-200 px-3 py-1.5 text-sm font-medium transition-colors",
                                    viewMode === "table"
                                       ? "bg-primary-600 text-white"
                                       : "bg-white text-gray-600 hover:bg-gray-50"
                                 )}
                              >
                                 <HiViewList className="h-4 w-4" />
                                 <span className="hidden sm:inline">
                                    Tabela
                                 </span>
                              </button>
                           </div>
                        </div>

                        {viewMode === "cards" ? (
                           <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                              {missoes?.map((m) => (
                                 <CardMission key={m.id} missao={m} />
                              ))}
                           </div>
                        ) : (
                           <TableMission missoes={missoes ?? []} />
                        )}

                        {/* Pagination Section */}
                        {missoes && missoes.length > 0 && (
                           <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-4 sm:flex-row">
                              <p className="text-sm text-gray-600">
                                 Mostrando{" "}
                                 <span className="font-medium text-gray-900">
                                    {(currentPage - 1) * perPage + 1}
                                 </span>
                                 -
                                 <span className="font-medium text-gray-900">
                                    {Math.min(currentPage * perPage, total)}
                                 </span>{" "}
                                 de{" "}
                                 <span className="font-medium text-gray-900">
                                    {total}
                                 </span>{" "}
                                 missões
                              </p>
                              <Pagination
                                 currentPage={currentPage}
                                 totalPages={totalPages}
                                 onPageChange={handlePageChange}
                              />
                           </div>
                        )}
                     </div>
                  )}
               </div>
            )}
         </section>
      </div>
   );
}
