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
      <div className='w-full h-full overflow-auto p-1'>
         {/* Header da Página */}
         <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
               <div className='p-2 bg-red-100 rounded-lg'>
                  <HiUsers className='w-6 h-6 text-red-600' />
               </div>
               <div>
                  <h1 className='text-xl font-semibold text-gray-900'>
                     Usuários
                  </h1>
                  {!loading && (
                     <p className='text-sm text-gray-500'>
                        {totalUsers}{" "}
                        {totalUsers === 1
                           ? "usuário encontrado"
                           : "usuários encontrados"}
                        {hasFilters && " com os filtros aplicados"}
                     </p>
                  )}
               </div>
            </div>
         </div>

         {/* Card da Tabela */}
         <div className='bg-white relative shadow-md sm:rounded-lg overflow-hidden'>
            {/* Barra de Busca e Filtros */}
            <div className='flex flex-col md:flex-row gap-3 p-4'>
               {/* Busca */}
               <div className='relative flex-1'>
                  <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                     <HiSearch className='w-5 h-5 text-gray-500' />
                  </div>
                  <input
                     type='text'
                     className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full pl-10 p-2.5'
                     placeholder='Buscar por nome de guerra...'
                     value={filterName}
                     onChange={(e) => setFilterName(e.target.value)}
                  />
               </div>

               {/* Filtros */}
               <div className='flex flex-wrap gap-2'>
                  {/* Filtro P/G */}
                  <select
                     value={filterPG}
                     onChange={(e) => setFilterPG(e.target.value)}
                     className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 p-2.5'
                  >
                     <option value=''>Todos P/G</option>
                     {postoGradRecords.map((pg) => (
                        <option
                           className='capitalize'
                           key={pg.short}
                           value={pg.short}
                        >
                           {pg.mid}
                        </option>
                     ))}
                  </select>

                  {/* Filtro Status */}
                  <select
                     value={filterActive}
                     onChange={(e) => setFilterActive(e.target.value)}
                     className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 p-2.5'
                  >
                     <option value=''>Todos Status</option>
                     <option value='true'>Ativo</option>
                     <option value='false'>Inativo</option>
                  </select>

                  {/* Botão Novo Usuário */}
                  <Button
                     color='red'
                     onClick={() => setShowCreateModal(true)}
                     className='whitespace-nowrap'
                  >
                     <HiUserAdd className='w-4 h-4 mr-2' />
                     Novo Usuário
                  </Button>
               </div>
            </div>

            {/* Conteúdo */}
            {loading ? (
               <div className='flex flex-col justify-center items-center h-64'>
                  <Spinner size='xl' />
                  <p className='mt-4 text-gray-500'>Carregando usuários...</p>
               </div>
            ) : usuarios.length === 0 ? (
               <div className='flex flex-col justify-center items-center h-64'>
                  <div className='p-4 bg-gray-100 rounded-full mb-4'>
                     <HiUsers className='w-12 h-12 text-gray-400' />
                  </div>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                     {hasFilters
                        ? "Nenhum usuário encontrado"
                        : "Nenhum usuário cadastrado"}
                  </h3>
                  <p className='text-gray-500 text-center max-w-md mb-4'>
                     {hasFilters
                        ? "Não encontramos resultados com os filtros aplicados. Tente ajustar os filtros."
                        : "Comece adicionando o primeiro usuário ao sistema."}
                  </p>
                  {!hasFilters && (
                     <Button
                        color='red'
                        onClick={() => setShowCreateModal(true)}
                     >
                        <HiUserAdd className='w-5 h-5 mr-2' />
                        Adicionar Primeiro Usuário
                     </Button>
                  )}
               </div>
            ) : (
               <>
                  {/* Tabela Desktop */}
                  <div className='hidden md:block overflow-x-auto'>
                     <table className='w-full text-sm text-left text-gray-500'>
                        <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
                           <tr>
                              <th scope='col' className='px-4 py-3'>
                                 #
                              </th>
                              <th scope='col' className='px-4 py-3'>
                                 P/G
                              </th>
                              <th scope='col' className='px-4 py-3'>
                                 Especialidade
                              </th>
                              <th scope='col' className='px-4 py-3'>
                                 Nome de Guerra
                              </th>
                              <th scope='col' className='px-4 py-3'>
                                 Nome Completo
                              </th>
                              <th scope='col' className='px-4 py-3'>
                                 Unidade
                              </th>
                              <th scope='col' className='px-4 py-3'>
                                 Status
                              </th>
                              <th scope='col' className='px-4 py-3'>
                                 <span className='sr-only'>Ações</span>
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
                  <div className='md:hidden space-y-3 p-4'>
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
                     className='flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4'
                     aria-label='Navegação da tabela'
                  >
                     <div className='flex items-center gap-4'>
                        <span className='text-sm font-normal text-gray-500'>
                           Mostrando{" "}
                           <span className='font-semibold text-gray-900'>
                              {(currentPage - 1) * perPage + 1}-
                              {Math.min(currentPage * perPage, totalUsers)}
                           </span>{" "}
                           de{" "}
                           <span className='font-semibold text-gray-900'>
                              {totalUsers}
                           </span>
                        </span>
                        <div className='flex items-center gap-2'>
                           <label
                              htmlFor='perPage'
                              className='text-sm text-gray-500'
                           >
                              Por página:
                           </label>
                           <Select
                              id='perPage'
                              sizing='sm'
                              value={perPage}
                              onChange={(e) =>
                                 handlePerPageChange(Number(e.target.value))
                              }
                              className='w-20'
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
