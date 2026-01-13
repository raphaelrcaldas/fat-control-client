"use client";

import { Button, Select, TextInput } from "flowbite-react";
import { HiSearch, HiUserAdd, HiUsers } from "react-icons/hi";
import { Spinner } from "@/components/Spinner";
import { Pagination } from "@/components/Pagination";
import { MultiSelect } from "@/components/MultiSelect";
import { useState } from "react";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { postoGradRecords } from "services/routes/postos";
import { UserCreateModal } from "./components/UserCreateModal";
import { UserTable } from "./components/UserTable";
import { UserCard } from "./components/UserCard";
import { useUsers } from "@/hooks/queries";

const PER_PAGE_OPTIONS = [10, 15, 25, 50, 100];

// Opções para os MultiSelects
const PG_OPTIONS = postoGradRecords.map((pg) => ({
   value: pg.short,
   label: pg.mid,
}));

const STATUS_OPTIONS = [
   { value: "true", label: "Ativo" },
   { value: "false", label: "Inativo" },
];

// Helper: Converte filterActive array para boolean | undefined
function getActiveFilter(active: string[]): boolean | undefined {
   if (active.length === 0 || active.length === 2) return undefined;
   if (active.includes("true")) return true;
   if (active.includes("false")) return false;
   return undefined;
}

export default function UsersPage() {
   // Filtros (client state)
   const [filterName, setFilterName] = useState("");
   const [filterPG, setFilterPG] = useState<string[]>([]);
   const [filterActive, setFilterActive] = useState<string[]>(["true"]);
   const [showCreateModal, setShowCreateModal] = useState(false);
   const [currentPage, setCurrentPage] = useState(1);
   const [perPage, setPerPage] = useState(10);

   const debouncedFilter = useDebouncedValue(filterName, 350);

   // React Query - busca usuários com filtros
   const {
      data,
      isLoading: loading,
      isFetching,
   } = useUsers({
      page: currentPage,
      per_page: perPage,
      search: debouncedFilter || undefined,
      p_g: filterPG.length > 0 ? filterPG.join(",") : undefined,
      active: getActiveFilter(filterActive),
   });

   const usuarios = data?.items ?? [];
   const totalPages = data?.pages ?? 1;
   const totalUsers = data?.total ?? 0;

   // Reset page quando filtros mudam
   const handleFilterChange = <T,>(
      setter: React.Dispatch<React.SetStateAction<T>>,
      value: T
   ) => {
      setter(value);
      setCurrentPage(1);
   };

   const hasFilters =
      debouncedFilter || filterPG.length > 0 || filterActive.length > 0;

   const showLoadingOverlay = loading || isFetching;

   return (
      <div className="h-full w-full overflow-auto p-1">
         {/* Header da Página */}
         <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="rounded-lg bg-red-100 p-2">
                  <HiUsers className="h-6 w-6 text-red-600" />
               </div>
               <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                     Usuários
                  </h1>
               </div>
            </div>
         </div>

         <div className="relative overflow-hidden bg-white shadow-md sm:rounded-lg">
            {/* Barra de Busca e Filtros */}
            <div className="flex flex-col gap-3 p-4 md:flex-row">
               {/* Busca */}
               <div className="flex-1">
                  <TextInput
                     icon={HiSearch}
                     placeholder="Buscar por nome de guerra ou nome completo..."
                     value={filterName}
                     onChange={(e) =>
                        handleFilterChange(setFilterName, e.target.value)
                     }
                     sizing="md"
                  />
               </div>

               {/* Filtros */}
               <div className="flex flex-wrap gap-2">
                  {/* Filtro P/G */}
                  <MultiSelect
                     options={PG_OPTIONS}
                     selected={filterPG}
                     onChange={(v) => handleFilterChange(setFilterPG, v)}
                     placeholder="Todos P/G"
                     className="w-48"
                  />

                  {/* Filtro Status */}
                  <MultiSelect
                     options={STATUS_OPTIONS}
                     selected={filterActive}
                     onChange={(v) => handleFilterChange(setFilterActive, v)}
                     placeholder="Todos Status"
                     className="w-48"
                  />

                  {/* Botão Novo Usuário */}
                  <Button
                     color="red"
                     onClick={() => setShowCreateModal(true)}
                     className="whitespace-nowrap"
                  >
                     <HiUserAdd className="mr-2 h-4 w-4" />
                     Novo Usuário
                  </Button>
               </div>
            </div>

            {/* Conteúdo */}
            {!loading && usuarios.length === 0 ? (
               <div className="flex h-64 flex-col items-center justify-center">
                  <div className="mb-4 rounded-full bg-gray-100 p-4">
                     <HiUsers className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                     {hasFilters
                        ? "Nenhum usuário encontrado"
                        : "Nenhum usuário cadastrado"}
                  </h3>
                  <p className="mb-4 max-w-md text-center text-gray-500">
                     {hasFilters
                        ? "Não encontramos resultados com os filtros aplicados. Tente ajustar os filtros."
                        : "Comece adicionando o primeiro usuário ao sistema."}
                  </p>
                  {!hasFilters && (
                     <Button
                        color="red"
                        onClick={() => setShowCreateModal(true)}
                     >
                        <HiUserAdd className="mr-2 h-5 w-5" />
                        Adicionar Primeiro Usuário
                     </Button>
                  )}
               </div>
            ) : (
               <div className="relative">
                  {/* Loading Overlay */}
                  {showLoadingOverlay && (
                     <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                        <div className="flex flex-col items-center gap-3 rounded-lg bg-white px-6 py-4 shadow-lg">
                           <Spinner size="lg" />
                           <p className="text-sm text-gray-600">
                              Carregando usuários...
                           </p>
                        </div>
                     </div>
                  )}

                  {/* Tabela Desktop */}
                  <UserTable usuarios={usuarios} loading={showLoadingOverlay} />

                  {/* Cards Mobile */}
                  <div
                     className={`space-y-3 p-4 md:hidden ${showLoadingOverlay ? "opacity-50" : "opacity-100"} transition-opacity duration-200`}
                  >
                     {usuarios.map((user) => (
                        <UserCard key={user.id} user={user} />
                     ))}
                  </div>

                  {/* Footer com Paginação */}
                  <nav
                     className={`flex flex-col items-start justify-between space-y-3 p-4 md:flex-row md:items-center md:space-y-0 ${showLoadingOverlay ? "pointer-events-none opacity-50" : "opacity-100"} transition-opacity duration-200`}
                     aria-label="Navegação da tabela"
                  >
                     <div className="flex items-center gap-4">
                        <span className="text-sm font-normal text-gray-500">
                           Mostrando{" "}
                           <span className="font-semibold text-gray-900">
                              {(currentPage - 1) * perPage + 1}-
                              {Math.min(currentPage * perPage, totalUsers)}
                           </span>{" "}
                           de{" "}
                           <span className="font-semibold text-gray-900">
                              {totalUsers}
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
                              onChange={(e) => {
                                 setPerPage(Number(e.target.value));
                                 setCurrentPage(1);
                              }}
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
                           onPageChange={setCurrentPage}
                        />
                     )}
                  </nav>
               </div>
            )}
         </div>

         <UserCreateModal show={showCreateModal} setShow={setShowCreateModal} />
      </div>
   );
}
