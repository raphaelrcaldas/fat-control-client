"use client";

import { Button, Select } from "flowbite-react";
import { HiSearch, HiUserAdd, HiUsers } from "react-icons/hi";
import { Spinner } from "@/components/Spinner";
import { Pagination } from "@/components/Pagination";
import { useState, useEffect, useCallback } from "react";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { getUsers, UserPublic } from "services/routes/users";
import { postoGradRecords } from "services/routes/postos";
import { useToast } from "../../context/toast";
import { UserCreateModal } from "./components/userForm";
import { UserRow } from "./components/UserRow";
import { UserCard } from "./components/UserCard";

const PER_PAGE_OPTIONS = [10, 15, 25, 50, 100];

export default function UsersPage() {
   const { push } = useToast();
   const [filterName, setFilterName] = useState("");
   const [filterPG, setFilterPG] = useState("");
   const [filterActive, setFilterActive] = useState<string>("true");
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
         p_g?: string,
         active?: boolean,
         signal?: AbortSignal,
         onError?: (msg: string) => void
      ) => {
         setLoading(true);
         try {
            const response = await getUsers(
               {
                  page,
                  per_page: itemsPerPage,
                  search: search || undefined,
                  p_g: p_g || undefined,
                  active,
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

   // Converte filterActive string para boolean | undefined
   const getActiveFilter = (): boolean | undefined => {
      if (filterActive === "true") return true;
      if (filterActive === "false") return false;
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
         getActiveFilter(),
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
         getActiveFilter(),
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
         getActiveFilter()
      );
   };

   const hasFilters = debouncedFilter || filterPG || filterActive;

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

         {/* Card da Tabela */}
         <div className="relative overflow-hidden bg-white shadow-md sm:rounded-lg">
            {/* Barra de Busca e Filtros */}
            <div className="flex flex-col gap-3 p-4 md:flex-row">
               {/* Busca */}
               <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                     <HiSearch className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                     type="text"
                     className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-sm text-gray-900 focus:border-red-500 focus:ring-red-500"
                     placeholder="Buscar por nome de guerra..."
                     value={filterName}
                     onChange={(e) => setFilterName(e.target.value)}
                  />
               </div>

               {/* Filtros */}
               <div className="flex flex-wrap gap-2">
                  {/* Filtro P/G */}
                  <select
                     value={filterPG}
                     onChange={(e) => setFilterPG(e.target.value)}
                     className="w-28 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-red-500 focus:ring-red-500"
                  >
                     <option value="">Todos P/G</option>
                     {postoGradRecords.map((pg) => (
                        <option key={pg.short} value={pg.short}>
                           {pg.short.toUpperCase()}
                        </option>
                     ))}
                  </select>

                  {/* Filtro Status */}
                  <select
                     value={filterActive}
                     onChange={(e) => setFilterActive(e.target.value)}
                     className="rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-red-500 focus:ring-red-500"
                  >
                     <option value="">Todos Status</option>
                     <option value="true">Ativo</option>
                     <option value="false">Inativo</option>
                  </select>

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
            {loading ? (
               <div className="flex h-64 flex-col items-center justify-center">
                  <Spinner size="xl" />
                  <p className="mt-4 text-gray-500">Carregando usuários...</p>
               </div>
            ) : usuarios.length === 0 ? (
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
               <>
                  {/* Tabela Desktop */}
                  <div className="hidden overflow-x-auto md:block">
                     <table className="w-full text-left text-sm text-gray-500">
                        <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                           <tr>
                              <th scope="col" className="px-4 py-3">
                                 #
                              </th>
                              <th scope="col" className="px-4 py-3">
                                 P/G
                              </th>
                              <th scope="col" className="px-4 py-3">
                                 Especialidade
                              </th>
                              <th scope="col" className="px-4 py-3">
                                 Nome de Guerra
                              </th>
                              <th scope="col" className="px-4 py-3">
                                 Nome Completo
                              </th>
                              <th scope="col" className="px-4 py-3">
                                 Unidade
                              </th>
                              <th scope="col" className="px-4 py-3">
                                 Status
                              </th>
                              <th scope="col" className="px-4 py-3">
                                 <span className="sr-only">Ações</span>
                              </th>
                           </tr>
                        </thead>
                        <tbody>
                           {usuarios.map((user) => (
                              <UserRow
                                 key={user.id}
                                 user={user}
                                 update={refreshList}
                              />
                           ))}
                        </tbody>
                     </table>
                  </div>

                  {/* Cards Mobile */}
                  <div className="space-y-3 p-4 md:hidden">
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
                     className="flex flex-col items-start justify-between space-y-3 p-4 md:flex-row md:items-center md:space-y-0"
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
               </>
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
                  getActiveFilter()
               )
            }
         />
      </div>
   );
}
