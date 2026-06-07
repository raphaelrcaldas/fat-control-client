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
   Spinner,
} from "flowbite-react";
import { HiSearch, HiUserGroup, HiX } from "react-icons/hi";
import { Pagination } from "@/components/Pagination";
import { postoGradRecords } from "services/routes/postos";
import { FUNC_LABELS_SHORT, OPER_LABELS } from "@/constants/tripulantes";
import { SearchUser } from "./components/searchUserTrip";
import { TripRow } from "./components/TripRow";
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
      <div className="h-full w-full overflow-auto p-1">
         {/* Header da Página */}
         <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="rounded-lg bg-red-100 p-2">
                  <HiUserGroup className="h-6 w-6 text-red-600" />
               </div>
               <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                     Tripulantes
                  </h1>
               </div>
            </div>
         </div>

         {/* Card da Tabela */}
         <div className="relative overflow-hidden bg-white shadow-md sm:rounded-lg">
            {/* Barra de Busca e Filtros */}
            <div className="border-b border-gray-200 p-4">
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

                  {/* Botão Adicionar */}
                  <PermBased resource={"trips"} requiredPerm={"create"}>
                     <SearchUser />
                  </PermBased>
               </div>

               {/* Linha 2: Filtros Avançados */}
               <div className="mt-3 flex flex-wrap items-center gap-3">
                  {/* Limpar Filtros */}
                  {hasActiveFilters && (
                     <Button
                        color="red"
                        size="sm"
                        outline
                        onClick={handleClearFilters}
                     >
                        <HiX className="mr-1 h-4 w-4" />
                        Limpar Filtros
                     </Button>
                  )}
               </div>
            </div>

            {/* Conteúdo */}
            {!loading && trips.length === 0 ? (
               <div className="flex h-64 flex-col items-center justify-center">
                  <div className="mb-4 rounded-full bg-gray-100 p-4">
                     <HiUserGroup className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                     {hasActiveFilters
                        ? "Nenhum tripulante encontrado"
                        : "Nenhum tripulante cadastrado"}
                  </h3>
                  <p className="mb-4 max-w-md text-center text-gray-500">
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
               <div className="relative">
                  {/* Loading Overlay - isFetching inclui paginacao e refetch */}
                  {isFetching && (
                     <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                        <div className="flex flex-col items-center gap-3 rounded-lg bg-white px-6 py-4 shadow-lg">
                           <Spinner color="failure" size="lg" />
                           <p className="text-sm text-gray-600">
                              Carregando tripulantes...
                           </p>
                        </div>
                     </div>
                  )}

                  {/* Tabela */}
                  <div className="min-h-96 overflow-x-auto">
                     <Table hoverable>
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
                              <TableHeadCell className="text-center">
                                 Status
                              </TableHeadCell>
                              <TableHeadCell>
                                 <span className="sr-only">Ações</span>
                              </TableHeadCell>
                           </TableRow>
                        </TableHead>
                        <TableBody className="divide-y">
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
                        <span className="text-sm font-normal text-gray-500">
                           Mostrando{" "}
                           <span className="font-semibold text-gray-900">
                              {(currentPage - 1) * perPage + 1}-
                              {Math.min(currentPage * perPage, totalTrips)}
                           </span>{" "}
                           de{" "}
                           <span className="font-semibold text-gray-900">
                              {totalTrips}
                           </span>
                        </span>
                        <div className="flex items-center gap-2">
                           <label
                              htmlFor="perPage"
                              className="text-sm text-gray-500"
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
