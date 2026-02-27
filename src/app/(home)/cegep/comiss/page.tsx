"use client";

import { useState, useMemo } from "react";
import { Label, Select, TextInput, Badge, Spinner } from "flowbite-react";
import { TableComiss } from "./components/tableComiss";
import { DetailComiss } from "./components/detailComiss";
import { RoleBasedRoute } from "../../hooks/useRoleBased";
import { sortByAntiguidade } from "utils/sortByAntiguidade";
import { HiFilter, HiX } from "react-icons/hi";
import { useComissList } from "@/hooks/queries";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import clsx from "clsx";

export default function ComissPage() {
   const [showFormComiss, setShowFormComiss] = useState(false);
   const [statusComis, setStatusComis] = useState("aberto");
   const [searchUser, setSearchUser] = useState("");
   const [filtersExpanded, setFiltersExpanded] = useState(false);

   const deferredSearch = useDebouncedValue(searchUser);

   // React Query
   const {
      data: cmtosRaw,
      isLoading,
      isFetching,
   } = useComissList({
      status: statusComis,
      search: deferredSearch,
   });

   // Ordenar por antiguidade
   const cmtos = useMemo(() => {
      if (!cmtosRaw) return [];
      return sortByAntiguidade(cmtosRaw);
   }, [cmtosRaw]);

   const loading = isLoading;
   const hasActiveFilters = !!(searchUser || statusComis !== "aberto");

   const clearFilters = () => {
      setSearchUser("");
      setStatusComis("aberto");
   };

   return (
      <>
         <div className="flex flex-col gap-3">
            {/* Header Section */}
            <section className="shrink-0">
               <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                  <div className="px-6 py-5">
                     <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Title Section */}
                        <div className="flex items-center gap-3">
                           <div className="rounded-lg bg-red-50 p-2.5">
                              <svg
                                 className="h-6 w-6 text-red-600"
                                 fill="none"
                                 stroke="currentColor"
                                 viewBox="0 0 24 24"
                              >
                                 <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                 />
                              </svg>
                           </div>
                           <div>
                              <h5 className="text-xl font-bold text-gray-900">
                                 Comissionamentos
                              </h5>
                              <p className="text-sm text-gray-600">
                                 Gerencie todos os comissionamentos
                              </p>
                           </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                           <button
                              type="button"
                              onClick={() =>
                                 setFiltersExpanded(!filtersExpanded)
                              }
                              className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                           >
                              <HiFilter className="h-4 w-4" />
                              <span className="hidden sm:inline">
                                 {filtersExpanded ? "Ocultar" : "Filtros"}
                              </span>
                              {hasActiveFilters && (
                                 <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                                    {
                                       Object.values({
                                          searchUser,
                                          statusComis:
                                             statusComis !== "aberto"
                                                ? statusComis
                                                : null,
                                       }).filter((v) => v).length
                                    }
                                 </span>
                              )}
                           </button>
                           <RoleBasedRoute requiredRoles={["apoio_avancado"]}>
                              <button
                                 type="button"
                                 onClick={() => setShowFormComiss(true)}
                                 className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                              >
                                 <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                 >
                                    <path
                                       strokeLinecap="round"
                                       strokeLinejoin="round"
                                       strokeWidth={2}
                                       d="M12 4v16m8-8H4"
                                    />
                                 </svg>
                                 <span className="hidden sm:inline">Novo</span>
                              </button>
                           </RoleBasedRoute>
                        </div>
                     </div>
                  </div>
               </div>
            </section>

            {/* Active Filters Tags */}
            {hasActiveFilters && (
               <section className="transition-all duration-300">
                  <div className="flex flex-wrap items-center gap-2">
                     <span className="text-xs font-medium text-gray-600">
                        Filtros ativos:
                     </span>

                     {searchUser && (
                        <Badge color="failure">
                           <div className="flex items-center gap-1.5">
                              <svg
                                 className="h-3 w-3"
                                 fill="none"
                                 stroke="currentColor"
                                 viewBox="0 0 24 24"
                              >
                                 <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                 />
                              </svg>
                              <span>Militar: {searchUser}</span>
                              <button
                                 onClick={() => setSearchUser("")}
                                 className="ml-1 hover:text-red-600"
                              >
                                 <svg
                                    className="h-3 w-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                 >
                                    <path
                                       strokeLinecap="round"
                                       strokeLinejoin="round"
                                       strokeWidth={2}
                                       d="M6 18L18 6M6 6l12 12"
                                    />
                                 </svg>
                              </button>
                           </div>
                        </Badge>
                     )}

                     {statusComis !== "aberto" && (
                        <Badge color="failure">
                           <div className="flex items-center gap-1.5">
                              <svg
                                 className="h-3 w-3"
                                 fill="none"
                                 stroke="currentColor"
                                 viewBox="0 0 24 24"
                              >
                                 <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                 />
                              </svg>
                              <span>Situação: Fechado</span>
                              <button
                                 onClick={() => setStatusComis("aberto")}
                                 className="ml-1 hover:text-red-600"
                              >
                                 <svg
                                    className="h-3 w-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                 >
                                    <path
                                       strokeLinecap="round"
                                       strokeLinejoin="round"
                                       strokeWidth={2}
                                       d="M6 18L18 6M6 6l12 12"
                                    />
                                 </svg>
                              </button>
                           </div>
                        </Badge>
                     )}

                     <button
                        onClick={clearFilters}
                        className="text-xs text-gray-500 underline hover:text-gray-700"
                     >
                        Limpar todos
                     </button>
                  </div>
               </section>
            )}

            {/* Filters Section */}
            {filtersExpanded && (
               <section className="shrink-0">
                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                     <div className="mb-4 flex items-center justify-between">
                        <h6 className="text-sm font-medium text-gray-700">
                           Filtros
                        </h6>
                        {hasActiveFilters && (
                           <button
                              onClick={clearFilters}
                              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                           >
                              <HiX />
                              Limpar
                           </button>
                        )}
                     </div>

                     <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {/* Militar */}
                        <div>
                           <Label className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-600">
                              <svg
                                 className="h-4 w-4 text-gray-500"
                                 fill="none"
                                 stroke="currentColor"
                                 viewBox="0 0 24 24"
                              >
                                 <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                 />
                              </svg>
                              Militar
                           </Label>
                           <TextInput
                              type="text"
                              value={searchUser}
                              onChange={(e) => setSearchUser(e.target.value)}
                              placeholder="Nome completo ou de guerra"
                              sizing="sm"
                           />
                        </div>

                        {/* Situação */}
                        <div>
                           <Label className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-600">
                              <svg
                                 className="h-4 w-4 text-gray-500"
                                 fill="none"
                                 stroke="currentColor"
                                 viewBox="0 0 24 24"
                              >
                                 <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                 />
                              </svg>
                              Situação
                           </Label>
                           <Select
                              value={statusComis}
                              onChange={(e) => setStatusComis(e.target.value)}
                              className="text-sm"
                              sizing="sm"
                           >
                              <option value="aberto">Aberto</option>
                              <option value="fechado">Fechado</option>
                           </Select>
                        </div>
                     </div>
                  </div>
               </section>
            )}

            {/* Results Counter */}
            {!loading && cmtos.length > 0 && (
               <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg
                     className="h-4 w-4"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                     />
                  </svg>
                  <span className="font-medium">
                     {cmtos.length}{" "}
                     {cmtos.length === 1
                        ? "comissionamento encontrado"
                        : "comissionamentos encontrados"}
                  </span>
               </div>
            )}

            {/* Content Section */}
            <div className="min-h-50 flex-1">
               {loading ? (
                  <div className="flex flex-col items-center justify-center gap-4 py-16">
                     <Spinner color="failure" size="xl" />
                     <p className="text-sm font-medium text-gray-600">
                        Carregando comissionamentos...
                     </p>
                  </div>
               ) : cmtos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-4 py-16">
                     <div className="mb-4 rounded-full bg-gray-50 p-6">
                        <svg
                           className="h-16 w-16 text-gray-400"
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24"
                        >
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                           />
                        </svg>
                     </div>
                     <h3 className="mb-1 text-lg font-semibold text-gray-900">
                        Nenhum comissionamento encontrado
                     </h3>
                     <p className="text-sm text-gray-500">
                        Tente ajustar os filtros ou adicione um novo
                        comissionamento
                     </p>
                  </div>
               ) : (
                  <div
                     className={clsx(
                        "transition-opacity",
                        isFetching && "opacity-50"
                     )}
                  >
                     <TableComiss cmtos={cmtos} />
                  </div>
               )}
            </div>
         </div>

         {showFormComiss && (
            <DetailComiss show={showFormComiss} setShow={setShowFormComiss} />
         )}
      </>
   );
}
