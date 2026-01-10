"use client";

import { useState, useEffect } from "react";
import { Select } from "flowbite-react";
import { HiSearch, HiUserGroup, HiX } from "react-icons/hi";
import { Spinner } from "@/components/Spinner";
import { Pagination } from "@/components/Pagination";
import { postoGradRecords } from "services/routes/postos";
import { FUNC_LABELS, OPER_LABELS } from "@/constants/tripulantes";
import { SearchUser } from "./components/searchUserTrip";
import { TripRow } from "./components/TripRow";
import { MultiSelect } from "@/components/MultiSelect";
import { PermBased } from "../../hooks/usePermBased";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useTripList } from "./hooks/useTripList";
import type { FuncType, OperType } from "./types/trip.types";

export default function TripPage() {
   const [uae] = useState("11gt");
   const [active] = useState(true);
   const [filterName, setFilterName] = useState("");
   const debouncedFilter = useDebouncedValue(filterName, 350);

   const {
      trips,
      filterTrips,
      loading,
      refetch,
      filters,
      updateFilter,
      clearFilters,
      currentPage,
      perPage,
      totalPages,
      totalTrips,
      handlePageChange,
      handlePerPageChange,
      PER_PAGE_OPTIONS,
   } = useTripList({
      uae,
      active,
   });

   useEffect(() => {
      updateFilter("name", debouncedFilter);
   }, [debouncedFilter]);

   const hasActiveFilters =
      filters.p_g.length > 0 ||
      filters.func.length > 0 ||
      filters.oper.length > 0 ||
      filters.name !== "";

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
            {/* Barra de Busca, Filtros e Botão Adicionar */}
            <div className="flex flex-col gap-3 p-4 md:flex-row">
               {/* Busca */}
               <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                     <HiSearch className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                     type="text"
                     className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500"
                     placeholder="Buscar por trigrama, nome de guerra ou nome completo..."
                     value={filterName}
                     onChange={(e) => setFilterName(e.target.value)}
                  />
               </div>

               {/* Filtro P/G */}
               <div className="w-52">
                  <MultiSelect
                     options={postoGradRecords.map((posto) => ({
                        value: posto.short,
                        label: posto.mid,
                     }))}
                     selected={filters.p_g}
                     onChange={(values) => updateFilter("p_g", values)}
                     placeholder="P/G"
                  />
               </div>

               {/* Filtro Função */}
               <div className="w-52">
                  <MultiSelect
                     options={Object.entries(FUNC_LABELS).map(
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
               <div className="w-52">
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

               {/* Limpar Filtros */}
               {hasActiveFilters && (
                  <button
                     onClick={() => {
                        clearFilters();
                        setFilterName("");
                     }}
                     className="flex items-center gap-1 rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                  >
                     <HiX className="h-4 w-4" />
                     Limpar
                  </button>
               )}

               {/* Botão Adicionar */}
               <PermBased resource={"trips"} requiredPerm={"create"}>
                  <SearchUser uae={uae} trips={trips} updateTrips={refetch} />
               </PermBased>
            </div>

            {/* Conteúdo */}
            {!loading && filterTrips.length === 0 ? (
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
                     <button
                        onClick={() => {
                           clearFilters();
                           setFilterName("");
                        }}
                        className="text-sm text-red-600 hover:text-red-700"
                     >
                        Limpar Filtros
                     </button>
                  )}
               </div>
            ) : (
               <div className="relative">
                  {/* Loading Overlay */}
                  {loading && (
                     <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                        <div className="flex flex-col items-center gap-3 rounded-lg bg-white px-6 py-4 shadow-lg">
                           <Spinner size="lg" />
                           <p className="text-sm text-gray-600">
                              Carregando tripulantes...
                           </p>
                        </div>
                     </div>
                  )}

                  {/* Tabela */}
                  <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm text-gray-500">
                        <thead className="bg-gray-50 text-center text-xs text-gray-700 uppercase">
                           <tr>
                              <th scope="col" className="px-4 py-3">
                                 P/G
                              </th>
                              <th
                                 scope="col"
                                 className="hidden px-4 py-3 lg:table-cell"
                              >
                                 Especialidade
                              </th>
                              <th
                                 scope="col"
                                 className="hidden px-4 py-3 md:table-cell"
                              >
                                 Nome de Guerra
                              </th>
                              <th
                                 scope="col"
                                 className="hidden px-4 py-3 md:table-cell"
                              >
                                 Nome Completo
                              </th>
                              <th scope="col" className="px-4 py-3">
                                 Trigrama
                              </th>
                              <th scope="col" className="px-4 py-3">
                                 Funções
                              </th>
                              <th scope="col" className="px-4 py-3">
                                 <span className="sr-only">Ações</span>
                              </th>
                           </tr>
                        </thead>
                        <tbody>
                           {filterTrips.map((trip) => (
                              <TripRow
                                 key={trip.id}
                                 trip={trip}
                                 update={refetch}
                              />
                           ))}
                        </tbody>
                     </table>
                  </div>

                  {/* Footer com Paginação */}
                  <nav
                     className={`flex flex-col items-start justify-between space-y-3 p-4 md:flex-row md:items-center md:space-y-0 ${loading ? "pointer-events-none opacity-50" : "opacity-100"} transition-opacity duration-200`}
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
