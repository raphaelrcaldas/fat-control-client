"use client";

import { useState } from "react";
import { TextInput, Badge, Spinner } from "flowbite-react";
import { HiSearch, HiX, HiPlus, HiOfficeBuilding } from "react-icons/hi";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useDadosBancarios } from "@/hooks/queries";
import clsx from "clsx";
import ListDadosBancarios from "./components/listDadosBancarios";
import DetailDadosBancarios from "./components/detailDadosBancarios";
import { RoleBasedRoute } from "../../hooks/useRoleBased";

export default function DadosBancariosPage() {
   const [searchUser, setSearchUser] = useState("");
   const [showCreate, setShowCreate] = useState(false);

   const debouncedSearch = useDebouncedValue(searchUser, 500);

   const {
      data: dadosBancarios = [],
      isLoading,
      isFetching,
   } = useDadosBancarios({
      search: debouncedSearch || undefined,
   });

   const hasActiveFilters = !!searchUser;

   const clearFilters = () => {
      setSearchUser("");
   };

   return (
      <div className="flex flex-col gap-3">
         {/* Header Section */}
         <section className="shrink-0">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
               <div className="px-6 py-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                     {/* Title Section */}
                     <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-red-50 p-2.5 dark:bg-red-900/20">
                           <HiOfficeBuilding className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                           <h5 className="text-xl font-bold text-gray-900 dark:text-white">
                              Dados Bancários
                           </h5>
                           <p className="text-sm text-gray-600 dark:text-gray-400">
                              Gerencie contas correntes dos militares
                           </p>
                        </div>
                     </div>

                     {/* Action Button */}
                     <RoleBasedRoute requiredRoles={["apoio_avancado"]}>
                        <button
                           type="button"
                           onClick={() => setShowCreate(true)}
                           className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                        >
                           <HiPlus className="h-4 w-4" />
                           <span className="">Cadastrar</span>
                        </button>
                     </RoleBasedRoute>
                  </div>

                  {/* Search Bar */}
                  <div className="mt-4">
                     <div className="relative">
                        <HiSearch className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                        <TextInput
                           id="search"
                           type="text"
                           placeholder="Buscar por nome de guerra ou nome completo..."
                           value={searchUser}
                           onChange={(e) => setSearchUser(e.target.value)}
                           className="pl-10"
                        />
                     </div>
                  </div>
               </div>

               {/* Stats Bar */}
               {!isLoading && (
                  <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-900">
                     <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                           <span className="text-gray-600 dark:text-gray-400">
                              Total:{" "}
                              <strong className="text-gray-900 dark:text-white">
                                 {dadosBancarios.length}
                              </strong>
                           </span>
                           {isFetching && <Spinner color="failure" size="sm" />}
                        </div>
                        {hasActiveFilters && (
                           <button
                              onClick={clearFilters}
                              className="flex items-center gap-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                           >
                              <HiX className="h-4 w-4" />
                              <span>Limpar filtros</span>
                           </button>
                        )}
                     </div>
                  </div>
               )}
            </div>
         </section>

         {/* Active Filters Tags */}
         {hasActiveFilters && (
            <section className="transition-all duration-300">
               <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                     Filtros ativos:
                  </span>
                  {searchUser && (
                     <Badge color="failure">
                        <div className="flex items-center gap-1.5">
                           <span>Busca: {searchUser}</span>
                           <button
                              onClick={() => setSearchUser("")}
                              className="rounded-full p-0.5 hover:bg-red-200"
                           >
                              <HiX className="h-3 w-3" />
                           </button>
                        </div>
                     </Badge>
                  )}
               </div>
            </section>
         )}

         {/* Content Section */}
         <section
            className={clsx(
               "flex-1 overflow-auto transition-opacity",
               isFetching && !isLoading && "opacity-50"
            )}
         >
            {isLoading ? (
               <div className="flex h-64 items-center justify-center">
                  <Spinner color="failure" size="xl" />
               </div>
            ) : dadosBancarios.length === 0 ? (
               <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800">
                  <HiOfficeBuilding className="mb-4 h-16 w-16 text-gray-400" />
                  <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
                     {searchUser
                        ? "Nenhum resultado encontrado"
                        : "Nenhum dado bancário cadastrado"}
                  </p>
                  {searchUser && (
                     <button
                        onClick={clearFilters}
                        className="mt-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                     >
                        Limpar busca
                     </button>
                  )}
               </div>
            ) : (
               <ListDadosBancarios dados={dadosBancarios} />
            )}
         </section>

         {/* Modal de criação */}
         {showCreate && (
            <DetailDadosBancarios
               show={showCreate}
               onClose={() => setShowCreate(false)}
            />
         )}
      </div>
   );
}
