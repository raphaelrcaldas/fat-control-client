"use client";

import { useState } from "react";
import { Button, Label, Select, TextInput } from "flowbite-react";
import { HiSearch, HiUserAdd, HiUsers } from "react-icons/hi";
import clsx from "clsx";
import { Pagination } from "@/components/Pagination";
import { MultiSelect } from "@/components/MultiSelect";
import { SearchableSelect } from "@/components/SearchableSelect";
import { postoGradRecords } from "services/routes/postos";
import { quadroOptions } from "@/constants/militar/quadros";
import { especialidadeOptions } from "@/constants/militar/especialidades";
import { useUsers } from "@/hooks/queries";
import { UserCreateModal } from "./components/UserCreateModal";
import { UserTable } from "./components/UserTable";
import { UserCard } from "./components/UserCard";
import { UsersListSkeleton } from "./components/UsersListSkeleton";
import { useUsersFilters, PER_PAGE_OPTIONS } from "./hooks/useUsersFilters";

// Opções dos MultiSelects
const PG_OPTIONS = postoGradRecords.map((pg) => ({
   value: pg.short,
   label: pg.mid,
}));

const STATUS_OPTIONS = [
   { value: "true", label: "Ativo" },
   { value: "false", label: "Inativo" },
];

export default function UsersPage() {
   const {
      filterName,
      filterPG,
      filterQuadro,
      filterEsp,
      filterActive,
      currentPage,
      perPage,
      hasFilters,
      queryParams,
      setSearch,
      setPG,
      setQuadro,
      setEsp,
      setActive,
      setPage,
      setPerPage,
      clearFilters,
   } = useUsersFilters();

   const [showCreateModal, setShowCreateModal] = useState(false);

   const { data, isLoading, isFetching } = useUsers(queryParams);

   const usuarios = data?.items ?? [];
   const totalPages = data?.pages ?? 1;
   const totalUsers = data?.total ?? 0;

   // keepPreviousData: na 1ª carga mostra skeleton; no refetch esmaece o
   // conteúdo anterior sem overlay (regra de refetch suave).
   const softLoading = isFetching && !isLoading;

   return (
      <div className="flex flex-col space-y-2">
         {/* Masthead */}
         <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
            <span
               aria-hidden
               className="bg-primary-600 absolute top-0 left-0 h-full w-1"
            />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
               <div className="flex min-w-0 items-center gap-4">
                  <div className="bg-primary-50 text-primary-600 ring-primary-100 grid h-12 w-12 shrink-0 place-items-center rounded-md ring-1 ring-inset">
                     <HiUsers className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                     {/* primary-600, não 500: o 500 reprova contraste AA sobre
                         branco (axe serious) — vale também para o canônico */}
                     <p className="text-primary-600 font-mono text-[10px] font-bold tracking-[0.3em] uppercase">
                        Cadastro
                     </p>
                     <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                        Usuários
                     </h1>
                  </div>
               </div>

               <Button
                  color="primary"
                  onClick={() => setShowCreateModal(true)}
                  className="font-semibold whitespace-nowrap"
               >
                  <HiUserAdd className="mr-2 h-4 w-4" />
                  Novo Usuário
               </Button>
            </div>
         </header>

         <div className="overflow-hidden rounded border border-slate-200 bg-white shadow">
            {/* Barra de Busca e Filtros. lg (não md): no tablet a linha única
                esmagava a busca a ~77px — largura de meio placeholder. */}
            <div className="flex flex-col gap-3 p-4 lg:flex-row">
               <div className="flex-1">
                  <TextInput
                     icon={HiSearch}
                     placeholder="Buscar por nome de guerra ou nome completo..."
                     value={filterName}
                     onChange={(e) => setSearch(e.target.value)}
                     sizing="md"
                  />
               </div>

               <div className="flex flex-wrap gap-2">
                  <MultiSelect
                     options={PG_OPTIONS}
                     selected={filterPG}
                     onChange={setPG}
                     placeholder="Todos P/G"
                     className="w-44"
                  />
                  <SearchableSelect
                     options={quadroOptions}
                     value={filterQuadro}
                     onChange={setQuadro}
                     placeholder="Todos Quadros"
                     clearable
                     className="w-44"
                  />
                  <SearchableSelect
                     options={especialidadeOptions}
                     value={filterEsp}
                     onChange={setEsp}
                     placeholder="Todas Especialidades"
                     clearable
                     className="w-44"
                  />
                  <MultiSelect
                     options={STATUS_OPTIONS}
                     selected={filterActive}
                     onChange={setActive}
                     placeholder="Todos Status"
                     className="w-44"
                  />
               </div>
            </div>

            {/* Conteúdo */}
            {isLoading ? (
               <UsersListSkeleton rows={perPage <= 25 ? 25 : 50} />
            ) : usuarios.length === 0 ? (
               <div className="flex h-64 flex-col items-center justify-center">
                  <div className="mb-4 rounded-full bg-gray-100 p-4">
                     <HiUsers className="h-12 w-12 text-gray-400" />
                  </div>
                  <h2 className="mb-2 text-lg font-semibold text-gray-900">
                     {hasFilters
                        ? "Nenhum usuário encontrado"
                        : "Nenhum usuário cadastrado"}
                  </h2>
                  <p className="mb-4 max-w-md text-center text-gray-500">
                     {hasFilters
                        ? "Não encontramos resultados com os filtros aplicados. Tente ajustar os filtros."
                        : "Comece adicionando o primeiro usuário ao sistema."}
                  </p>
                  {hasFilters ? (
                     <Button color="light" onClick={clearFilters}>
                        Limpar filtros
                     </Button>
                  ) : (
                     <Button
                        color="primary"
                        onClick={() => setShowCreateModal(true)}
                     >
                        <HiUserAdd className="mr-2 h-5 w-5" />
                        Adicionar Primeiro Usuário
                     </Button>
                  )}
               </div>
            ) : (
               <div
                  className={clsx(
                     "transition-opacity duration-200",
                     softLoading ? "opacity-50" : "opacity-100"
                  )}
               >
                  {/* Tabela Desktop */}
                  <UserTable usuarios={usuarios} />

                  {/* Cards até lg: no tablet a tabela estourava 237px e
                      escondia a coluna de ação atrás de scroll sem indício. */}
                  <div className="space-y-2 p-2 lg:hidden">
                     {usuarios.map((user) => (
                        <UserCard key={user.id} user={user} />
                     ))}
                  </div>

                  {/* Footer com Paginação */}
                  <nav
                     className={clsx(
                        "flex flex-col items-start justify-between space-y-3 p-4 lg:flex-row lg:items-center lg:space-y-0",
                        softLoading && "pointer-events-none"
                     )}
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
                           <Label
                              htmlFor="perPage"
                              className="text-sm text-gray-500"
                           >
                              Por página:
                           </Label>
                           <Select
                              id="perPage"
                              sizing="sm"
                              value={perPage}
                              onChange={(e) =>
                                 setPerPage(Number(e.target.value))
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
                           onPageChange={setPage}
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
