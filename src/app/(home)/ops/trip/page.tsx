"use client";

import { useState, useEffect, useCallback } from "react";
import {
   Select,
   TextInput,
   Button,
   Table,
   TableHead,
   TableBody,
   TableRow,
   TableHeadCell,
} from "flowbite-react";
import { HiSearch, HiUserGroup, HiX } from "react-icons/hi";
import { Pagination } from "@/components/Pagination";
import { postoGradRecords } from "services/routes/postos";
import { FUNC_LABELS_SHORT, OPER_LABELS } from "@/constants/tripulantes";
import { SearchUser } from "./components/searchUserTrip";
import { TripRow } from "./components/TripRow";
import { TripTableSkeleton } from "./components/TripTableSkeleton";
import { MultiSelect } from "@/components/MultiSelect";
import { PermBased } from "../../hooks/usePermBased";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useTripList } from "./hooks/useTripList";
import type { FuncType, OperType } from "./types/trip.types";

export default function TripPage() {
   const {
      trips,
      loading,
      isFetching,
      filters,
      updateFilter,
      updateSearch,
      clearFilters,
      currentPage,
      perPage,
      totalPages,
      totalTrips,
      handlePageChange,
      handlePerPageChange,
      PER_PAGE_OPTIONS,
      urlSearch,
   } = useTripList();

   // Local state for search input (immediate typing feedback)
   const [filterName, setFilterName] = useState(urlSearch);
   const debouncedFilter = useDebouncedValue(filterName, 350);

   // Sync debounced search to URL
   useEffect(() => {
      if (debouncedFilter !== urlSearch) {
         updateSearch(debouncedFilter);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [debouncedFilter]);

   // Sync URL search param back to local input when navigating back
   useEffect(() => {
      if (urlSearch !== filterName && urlSearch !== debouncedFilter) {
         setFilterName(urlSearch);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [urlSearch]);

   const handleClearFilters = useCallback(() => {
      clearFilters();
      setFilterName("");
   }, [clearFilters]);

   const hasActiveFilters =
      filters.p_g.length > 0 ||
      filters.func.length > 0 ||
      filters.oper.length > 0 ||
      filters.name !== "" ||
      filters.active !== true;

   return (
      <div className="flex flex-col space-y-2">
         {/* Masthead — padrão canônico do sistema */}
         <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
            <span
               aria-hidden
               className="absolute top-0 left-0 h-full w-1 bg-red-600"
            />

            <div className="relative flex flex-wrap items-center justify-between gap-4">
               <div className="flex min-w-0 items-center gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-red-50 text-red-600 ring-1 ring-red-100 ring-inset">
                     <HiUserGroup className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                     <span className="block font-mono text-[10px] font-bold tracking-[0.3em] text-red-500 uppercase">
                        Gestão Operacional
                     </span>
                     <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                        Tripulantes
                     </h1>
                  </div>
               </div>

               <PermBased resource={"trips"} requiredPerm={"create"}>
                  <SearchUser />
               </PermBased>
            </div>
         </header>

         {/* Card da Tabela */}
         <div className="relative overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
            {/* Barra de Busca e Filtros */}
            <div className="border-b border-slate-200 p-4">
               {/* Linha 1: Busca + Toggle + Adicionar */}
               <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  {/* Busca */}
                  <div className="flex-1">
                     <TextInput
                        icon={HiSearch}
                        placeholder="Buscar por trigrama, nome de guerra ou nome completo..."
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                     />
                  </div>

                  {/* Filtro P/G */}
                  <div className="w-44">
                     <MultiSelect
                        options={postoGradRecords.map((posto) => ({
                           value: posto.short,
                           label: posto.mid,
                        }))}
                        selected={filters.p_g}
                        onChange={(values) => updateFilter("p_g", values)}
                        placeholder="Posto/Graduação"
                     />
                  </div>

                  {/* Filtro Função */}
                  <div className="w-44">
                     <MultiSelect
                        options={Object.entries(FUNC_LABELS_SHORT).map(
                           ([key, value]) => ({
                              value: key,
                              label: value,
                           })
                        )}
                        selected={filters.func}
                        onChange={(values) =>
                           updateFilter("func", values as FuncType[])
                        }
                        placeholder="Função"
                     />
                  </div>

                  {/* Filtro Operacionalidade */}
                  <div className="w-48">
                     <MultiSelect
                        options={Object.entries(OPER_LABELS).map(
                           ([key, value]) => ({
                              value: key,
                              label: value,
                           })
                        )}
                        selected={filters.oper}
                        onChange={(values) =>
                           updateFilter("oper", values as OperType[])
                        }
                        placeholder="Operacionalidade"
                     />
                  </div>

                  {/* Toggle Ativo/Inativo */}
                  <div className="flex gap-1">
                     <Button
                        color={filters.active ? "green" : "light"}
                        size="sm"
                        onClick={() => updateFilter("active", true)}
                     >
                        Ativos
                     </Button>
                     <Button
                        color={!filters.active ? "gray" : "light"}
                        size="sm"
                        onClick={() => updateFilter("active", false)}
                     >
                        Inativos
                     </Button>
                  </div>
               </div>

               {/* Limpar Filtros */}
               {hasActiveFilters && (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                     <Button
                        color="red"
                        size="sm"
                        outline
                        onClick={handleClearFilters}
                     >
                        <HiX className="mr-1 h-4 w-4" />
                        Limpar Filtros
                     </Button>
                  </div>
               )}
            </div>

            {/* Conteúdo */}
            {loading ? (
               <TripTableSkeleton />
            ) : trips.length === 0 ? (
               <div className="flex h-64 flex-col items-center justify-center px-4 text-center">
                  <h3 className="mb-2 text-lg font-semibold text-slate-700">
                     {hasActiveFilters
                        ? "Nenhum tripulante encontrado"
                        : "Nenhum tripulante cadastrado"}
                  </h3>
                  <p className="mb-4 max-w-md text-sm text-slate-500">
                     {hasActiveFilters
                        ? "Não encontramos resultados com os filtros aplicados. Tente ajustar os filtros."
                        : "Comece adicionando o primeiro tripulante ao sistema."}
                  </p>
                  {hasActiveFilters && (
                     <Button
                        color="red"
                        size="xs"
                        outline
                        onClick={handleClearFilters}
                     >
                        Limpar Filtros
                     </Button>
                  )}
               </div>
            ) : (
               <div>
                  {/* Refetch suave: mantém os dados e esmaece (keepPreviousData) */}
                  <div
                     className={`min-h-96 overflow-x-auto transition-opacity duration-200 ${isFetching ? "opacity-50" : "opacity-100"}`}
                  >
                     <Table
                        hoverable
                        theme={{ body: { cell: { base: "py-1" } } }}
                     >
                        <TableHead>
                           <TableRow>
                              <TableHeadCell>P/G</TableHeadCell>
                              <TableHeadCell className="hidden lg:table-cell">
                                 Quadro
                              </TableHeadCell>
                              <TableHeadCell className="hidden lg:table-cell">
                                 Especialidade
                              </TableHeadCell>
                              <TableHeadCell className="hidden md:table-cell">
                                 Nome de Guerra
                              </TableHeadCell>
                              <TableHeadCell className="hidden md:table-cell">
                                 Nome Completo
                              </TableHeadCell>
                              <TableHeadCell className="text-center">
                                 Trigrama
                              </TableHeadCell>
                              <TableHeadCell className="text-center">
                                 Funções
                              </TableHeadCell>
                              <TableHeadCell className="hidden text-center md:table-cell">
                                 Status
                              </TableHeadCell>
                              <TableHeadCell>
                                 <span className="sr-only">Ações</span>
                              </TableHeadCell>
                           </TableRow>
                        </TableHead>
                        <TableBody className="divide-y divide-slate-100">
                           {trips.map((trip) => (
                              <TripRow key={trip.id} trip={trip} />
                           ))}
                        </TableBody>
                     </Table>
                  </div>

                  {/* Footer com Paginação */}
                  <nav
                     className={`flex flex-col items-start justify-between space-y-3 p-4 md:flex-row md:items-center md:space-y-0 ${isFetching ? "pointer-events-none opacity-50" : "opacity-100"} transition-opacity duration-200`}
                     aria-label="Navegação da tabela"
                  >
                     <div className="flex items-center gap-4">
                        <span className="text-sm font-normal text-slate-500">
                           Mostrando{" "}
                           <span className="font-semibold text-slate-900">
                              {(currentPage - 1) * perPage + 1}-
                              {Math.min(currentPage * perPage, totalTrips)}
                           </span>{" "}
                           de{" "}
                           <span className="font-semibold text-slate-900">
                              {totalTrips}
                           </span>
                        </span>
                        <div className="flex items-center gap-2">
                           <label
                              htmlFor="perPage"
                              className="text-sm text-slate-500"
                           >
                              Por página:
                           </label>
                           <Select
                              id="perPage"
                              sizing="sm"
                              value={perPage}
                              onChange={(e) =>
                                 handlePerPageChange(Number(e.target.value))
                              }
                              className="w-20"
                           >
                              {PER_PAGE_OPTIONS.map((option) => (
                                 <option key={option} value={option}>
                                    {option}
                                 </option>
                              ))}
                           </Select>
                        </div>
                     </div>
                     {totalPages > 1 && (
                        <Pagination
                           currentPage={currentPage}
                           totalPages={totalPages}
                           onPageChange={handlePageChange}
                        />
                     )}
                  </nav>
               </div>
            )}
         </div>
      </div>
   );
}
