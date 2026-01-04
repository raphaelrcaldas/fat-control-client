"use client";

import { Button, Select, TextInput } from "flowbite-react";
import { HiSearch, HiUserAdd, HiUsers } from "react-icons/hi";
import { Spinner } from "@/components/Spinner";
import { Pagination } from "@/components/Pagination";
import { MultiSelect } from "@/components/MultiSelect";
import { useState, useEffect, useCallback } from "react";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { getUsers, UserPublic } from "services/routes/users";
import { postoGradRecords } from "services/routes/postos";
import { useToast } from "../../context/toast";
import { UserCreateModal } from "./components/UserCreateModal";
import { UserTable } from "./components/UserTable";
import { UserCard } from "./components/UserCard";

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

export default function UsersPage() {
   const { push } = useToast();
   const [filterName, setFilterName] = useState("");
   const [filterPG, setFilterPG] = useState<string[]>([]);
   const [filterActive, setFilterActive] = useState<string[]>(["true"]);
   const [showCreateModal, setShowCreateModal] = useState(false);
   const [usuarios, setUsuarios] = useState<UserPublic[]>([]);
   const [loading, setLoading] = useState(false);
   const [currentPage, setCurrentPage] = useState(1);
   const [perPage, setPerPage] = useState(10);
   const [totalPages, setTotalPages] = useState(1);
   const [totalUsers, setTotalUsers] = useState(0);
   const debouncedFilter = useDebouncedValue(filterName, 350);

   const updateListUsers = useCallback(
      async (
         page: number = 1,
         itemsPerPage: number = 10,
         search?: string,
         p_g?: string[],
         active?: string[],
         signal?: AbortSignal,
         onError?: (msg: string) => void
      ) => {
         setLoading(true);
         try {
            // Converte arrays de filtros para valores que a API entende
            const activeFilter = getActiveFilterFromArray(active);
            const pgFilter = p_g && p_g.length > 0 ? p_g.join(",") : undefined;

            const response = await getUsers(
               {
                  page,
                  per_page: itemsPerPage,
                  search: search || undefined,
                  p_g: pgFilter,
                  active: activeFilter,
               },
               signal
            );
            setUsuarios(response.items);
            setTotalPages(response.pages);
            setTotalUsers(response.total);
            setCurrentPage(response.page);
         } catch (err: any) {
            if (err?.name === "AbortError") return;
            const message =
               err?.message || String(err) || "Erro ao buscar usuários";
            if (onError) onError(message);
         } finally {
            setLoading(false);
         }
      },
      []
   );

   // Converte filterActive array para boolean | undefined
   const getActiveFilterFromArray = (
      active?: string[]
   ): boolean | undefined => {
      if (!active || active.length === 0) return undefined;
      if (active.length === 2) return undefined; // Ambos selecionados = todos
      if (active.includes("true")) return true;
      if (active.includes("false")) return false;
      return undefined;
   };

   // Busca quando filtros mudam
   useEffect(() => {
      const ac = new AbortController();
      setCurrentPage(1);
      updateListUsers(
         1,
         perPage,
         debouncedFilter,
         filterPG,
         filterActive,
         ac.signal,
         (msg: string) => push({ message: msg, type: "error" })
      );
      return () => ac.abort();
   }, [debouncedFilter, perPage, filterPG, filterActive]);

   const handlePageChange = (page: number) => {
      updateListUsers(
         page,
         perPage,
         debouncedFilter,
         filterPG,
         filterActive,
         undefined,
         (msg: string) => push({ message: msg, type: "error" })
      );
   };

   const handlePerPageChange = (newPerPage: number) => {
      setPerPage(newPerPage);
   };

   const refreshList = () => {
      updateListUsers(
         currentPage,
         perPage,
         debouncedFilter,
         filterPG,
         filterActive
      );
   };

   const hasFilters =
      debouncedFilter || filterPG.length > 0 || filterActive.length > 0;

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
                     onChange={(e) => setFilterName(e.target.value)}
                     sizing="md"
                  />
               </div>

               {/* Filtros */}
               <div className="flex flex-wrap gap-2">
                  {/* Filtro P/G */}
                  <MultiSelect
                     options={PG_OPTIONS}
                     selected={filterPG}
                     onChange={setFilterPG}
                     placeholder="Todos P/G"
                     className="w-48"
                  />

                  {/* Filtro Status */}
                  <MultiSelect
                     options={STATUS_OPTIONS}
                     selected={filterActive}
                     onChange={setFilterActive}
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
                  {loading && (
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
                  <UserTable
                     usuarios={usuarios}
                     loading={loading}
                     onUpdate={refreshList}
                  />

                  {/* Cards Mobile */}
                  <div
                     className={`space-y-3 p-4 md:hidden ${loading ? "opacity-50" : "opacity-100"} transition-opacity duration-200`}
                  >
                     {usuarios.map((user) => (
                        <UserCard
                           key={user.id}
                           user={user}
                           update={refreshList}
                        />
                     ))}
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

         <UserCreateModal
            show={showCreateModal}
            setShow={setShowCreateModal}
            updateUsers={() =>
               updateListUsers(
                  1,
                  perPage,
                  debouncedFilter,
                  filterPG,
                  filterActive
               )
            }
         />
      </div>
   );
}
