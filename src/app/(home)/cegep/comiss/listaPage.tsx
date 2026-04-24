"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Label, Select, TextInput, Badge, Spinner } from "flowbite-react";
import { TableComiss } from "./components/tableComiss";
import { RoleBasedRoute } from "../../hooks/useRoleBased";

import { HiFilter, HiX } from "react-icons/hi";
import { useComissList } from "@/hooks/queries";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { MultiSelect } from "@/components/MultiSelect";
import { postoGradRecords } from "@/constants/militar";
import {
   useSearchParamsUpdater,
   getStringParam,
   getArrayParam,
   serializeArray,
   serializeString,
} from "@/hooks/useSearchParamsState";

const PG_OPTIONS = postoGradRecords.map((pg) => ({
   value: pg.short,
   label: pg.mid,
}));

export function ListaPage() {
   const router = useRouter();
   const { searchParams, setParams } = useSearchParamsUpdater();

   // Ler filtros da URL
   const statusComis = getStringParam(searchParams, "status", "aberto");
   const urlSearch = getStringParam(searchParams, "search");
   const filterPG = getArrayParam(searchParams, "pg");
   const filterTipo = getStringParam(searchParams, "tipo");
   const filterModulo = getStringParam(searchParams, "modulo");

   // Estado local para input de texto (debounce)
   const [searchUser, setSearchUser] = useState(urlSearch);
   const deferredSearch = useDebouncedValue(searchUser, 500);

   // Sync debounced search -> URL
   useEffect(() => {
      if (deferredSearch !== urlSearch) {
         setParams({ search: deferredSearch || undefined });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [deferredSearch]);

   // Sync URL -> local state (navegação externa)
   useEffect(() => {
      if (urlSearch !== searchUser && urlSearch !== deferredSearch) {
         setSearchUser(urlSearch);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [urlSearch]);

   const [filtersExpanded, setFiltersExpanded] = useState(false);

   // Animação suave do painel de filtros
   const filtersRef = useRef<HTMLDivElement>(null);
   const [filtersHeight, setFiltersHeight] = useState(0);

   useEffect(() => {
      if (filtersRef.current) {
         setFiltersHeight(filtersRef.current.scrollHeight);
      }
   }, [filtersExpanded, filterPG, filterTipo, filterModulo]);

   // Handlers de filtros -> URL
   const setStatusComis = useCallback(
      (v: string) => setParams({ status: serializeString(v, "aberto") }),
      [setParams]
   );
   const setFilterPG = useCallback(
      (v: string[]) => setParams({ pg: serializeArray(v) }),
      [setParams]
   );
   const setFilterTipo = useCallback(
      (v: string) => setParams({ tipo: v || undefined }),
      [setParams]
   );
   const setFilterModulo = useCallback(
      (v: string) => setParams({ modulo: v || undefined }),
      [setParams]
   );

   // React Query
   const {
      data: cmtosRaw,
      isLoading,
      isFetching,
   } = useComissList({
      status: statusComis,
      search: deferredSearch,
      pg: filterPG,
      tipo: filterTipo,
      modulo: filterModulo,
   });

   const cmtos = cmtosRaw || [];

   const loading = isLoading;
   const hasActiveFilters = !!(
      searchUser ||
      statusComis !== "aberto" ||
      filterPG.length > 0 ||
      filterTipo ||
      filterModulo
   );

   const activeFilterCount = [
      searchUser,
      statusComis !== "aberto" ? statusComis : null,
      filterPG.length > 0 ? filterPG : null,
      filterTipo,
      filterModulo,
   ].filter((v) => v).length;

   const clearFilters = useCallback(() => {
      setSearchUser("");
      setParams({
         status: undefined,
         search: undefined,
         pg: undefined,
         tipo: undefined,
         modulo: undefined,
      });
   }, [setParams]);

   return (
      <div className="flex flex-col gap-3">
         {/* Header Section */}
         <section className="shrink-0">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
               <div className="px-5 py-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                     {/* Title Section */}
                     <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-red-50 p-2.5">
                           <svg
                              className="h-5 w-5 text-red-600"
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
                           <h5 className="text-lg font-bold text-gray-900">
                              Registros Ativos
                           </h5>
                           <p className="text-sm text-gray-600">
                              Gerencie registros abertos ou fechados
                           </p>
                        </div>
                     </div>

                     {/* Action Buttons */}
                     <div className="flex items-center gap-2">
                        <button
                           type="button"
                           onClick={() => setFiltersExpanded(!filtersExpanded)}
                           className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                        >
                           <HiFilter className="h-4 w-4" />
                           <span className="hidden sm:inline">
                              {filtersExpanded ? "Ocultar" : "Filtros"}
                           </span>
                           {hasActiveFilters && (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                                 {activeFilterCount}
                              </span>
                           )}
                        </button>
                        <RoleBasedRoute requiredRoles={["apoio_avancado"]}>
                           <button
                              type="button"
                              onClick={() => router.push("/cegep/comiss/new")}
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
                           <span>Militar: {searchUser}</span>
                           <button
                              onClick={() => setSearchUser("")}
                              className="ml-1 hover:text-red-600"
                           >
                              <HiX className="h-3 w-3" />
                           </button>
                        </div>
                     </Badge>
                  )}

                  {statusComis !== "aberto" && (
                     <Badge color="failure">
                        <div className="flex items-center gap-1.5">
                           <span>Situação: Fechado</span>
                           <button
                              onClick={() => setStatusComis("aberto")}
                              className="ml-1 hover:text-red-600"
                           >
                              <HiX className="h-3 w-3" />
                           </button>
                        </div>
                     </Badge>
                  )}

                  {filterPG.length > 0 && (
                     <Badge color="failure">
                        <div className="flex items-center gap-1.5">
                           <span>
                              P/G:{" "}
                              {filterPG
                                 .map(
                                    (pg) =>
                                       PG_OPTIONS.find((o) => o.value === pg)
                                          ?.label || pg
                                 )
                                 .join(", ")}
                           </span>
                           <button
                              onClick={() => setFilterPG([])}
                              className="ml-1 hover:text-red-600"
                           >
                              <HiX className="h-3 w-3" />
                           </button>
                        </div>
                     </Badge>
                  )}

                  {filterTipo && (
                     <Badge color="failure">
                        <div className="flex items-center gap-1.5">
                           <span>
                              Tipo:{" "}
                              {filterTipo === "periodo"
                                 ? "Período"
                                 : "Comparativo"}
                           </span>
                           <button
                              onClick={() => setFilterTipo("")}
                              className="ml-1 hover:text-red-600"
                           >
                              <HiX className="h-3 w-3" />
                           </button>
                        </div>
                     </Badge>
                  )}

                  {filterModulo && (
                     <Badge color="failure">
                        <div className="flex items-center gap-1.5">
                           <span>
                              Módulo: {filterModulo === "sim" ? "Sim" : "Não"}
                           </span>
                           <button
                              onClick={() => setFilterModulo("")}
                              className="ml-1 hover:text-red-600"
                           >
                              <HiX className="h-3 w-3" />
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

         {/* Filters Section - Smooth Transition */}
         <section
            className="shrink-0 overflow-hidden transition-all duration-300 ease-in-out"
            style={{
               maxHeight: filtersExpanded ? `${filtersHeight + 16}px` : "0px",
               opacity: filtersExpanded ? 1 : 0,
            }}
         >
            <div
               ref={filtersRef}
               className="rounded-lg border border-gray-200 bg-white p-4"
            >
               <div className="mb-4 flex items-center justify-between">
                  <h6 className="text-sm font-medium text-gray-700">Filtros</h6>
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

               <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
                        sizing="sm"
                     >
                        <option value="aberto">Aberto</option>
                        <option value="fechado">Fechado</option>
                     </Select>
                  </div>

                  {/* P/G */}
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
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                           />
                        </svg>
                        Posto/Graduação
                     </Label>
                     <MultiSelect
                        options={PG_OPTIONS}
                        selected={filterPG}
                        onChange={setFilterPG}
                        placeholder="Todos"
                        sizing="sm"
                     />
                  </div>

                  {/* Tipo */}
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
                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                           />
                        </svg>
                        Tipo
                     </Label>
                     <Select
                        value={filterTipo}
                        onChange={(e) => setFilterTipo(e.target.value)}
                        sizing="sm"
                     >
                        <option value="">Todos</option>
                        <option value="periodo">Período</option>
                        <option value="comparativo">Comparativo</option>
                     </Select>
                  </div>

                  {/* Módulo */}
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
                        Módulo
                     </Label>
                     <Select
                        value={filterModulo}
                        onChange={(e) => setFilterModulo(e.target.value)}
                        sizing="sm"
                     >
                        <option value="">Todos</option>
                        <option value="sim">Sim</option>
                        <option value="nao">Não</option>
                     </Select>
                  </div>
               </div>
            </div>
         </section>

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
   );
}
