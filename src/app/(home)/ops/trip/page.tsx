"use client";

import { Button, Select, Table, TableBody } from "flowbite-react";
import { HiExclamationCircle, HiRefresh, HiUserGroup } from "react-icons/hi";
import { Pagination } from "@/components/Pagination";
import { SearchUser } from "./components/searchUserTrip";
import { TripCard } from "./components/TripCard";
import { TripFilters } from "./components/TripFilters";
import { TripListSkeleton } from "./components/TripListSkeleton";
import { TripRow } from "./components/TripRow";
import { TripTableHead } from "./components/TripTableHead";
import { TRIP_TABLE_THEME } from "./tripTableTheme";
import { PermBased } from "../../hooks/usePermBased";
import { useTripList } from "./hooks/useTripList";

export default function TripPage() {
   const {
      trips,
      loading,
      isFetching,
      isError,
      refetch,
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

   const hasActiveFilters =
      filters.p_g.length > 0 ||
      filters.func.length > 0 ||
      filters.oper.length > 0 ||
      filters.name !== "" ||
      filters.active !== true;

   return (
      <div className="flex flex-col gap-2">
         {/* Masthead — padrão canônico do sistema */}
         <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
            <span
               aria-hidden
               className="bg-primary-600 absolute top-0 left-0 h-full w-1"
            />

            <div className="relative flex flex-wrap items-center justify-between gap-4">
               <div className="flex min-w-0 items-center gap-4">
                  <div className="bg-primary-50 text-primary-600 ring-primary-100 grid h-12 w-12 shrink-0 place-items-center rounded-md ring-1 ring-inset">
                     <HiUserGroup className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                     <span className="text-primary-600 block font-mono text-[10px] font-bold tracking-[0.3em] uppercase">
                        Gestão Operacional
                     </span>
                     <div className="flex items-baseline gap-2">
                        <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                           Tripulantes
                        </h1>
                        {/* O contador substitui a antiga coluna "Status": o
                            recorte ativo/inativo e binario, entao a lista e
                            sempre homogenea e a coluna repetia o filtro. */}
                        {!loading && !isError && (
                           <span className="text-sm font-medium text-slate-500">
                              {totalTrips}{" "}
                              {filters.active ? "ativos" : "inativos"}
                           </span>
                        )}
                     </div>
                  </div>
               </div>

               {/* No celular a acao de cadastro nao acontece: a tela e de
                   consulta, e o botao roubava uma faixa inteira do masthead. */}
               <div className="hidden md:block">
                  <PermBased
                     resource={"ops.tripulantes"}
                     requiredPerm={"create"}
                  >
                     <SearchUser />
                  </PermBased>
               </div>
            </div>
         </header>

         {/* Card da lista */}
         <div className="relative overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
            <TripFilters
               filters={filters}
               urlSearch={urlSearch}
               updateSearch={updateSearch}
               updateFilter={updateFilter}
               onClear={clearFilters}
               hasActiveFilters={hasActiveFilters}
            />

            {loading ? (
               <TripListSkeleton rows={perPage} />
            ) : isError && trips.length === 0 ? (
               <div className="flex min-h-96 flex-col items-center justify-center px-4 text-center">
                  <HiExclamationCircle className="mb-2 h-8 w-8 text-red-500" />
                  <h2 className="mb-1 text-lg font-semibold text-slate-700">
                     Não foi possível carregar os tripulantes
                  </h2>
                  <p className="mb-4 max-w-md text-sm text-slate-500">
                     A lista não chegou do servidor. Nada foi perdido — tente
                     novamente.
                  </p>
                  <Button color="light" size="sm" onClick={() => refetch()}>
                     <HiRefresh className="mr-1.5 h-4 w-4" />
                     Tentar novamente
                  </Button>
               </div>
            ) : trips.length === 0 ? (
               <div className="flex min-h-96 flex-col items-center justify-center px-4 text-center">
                  <h2 className="mb-1 text-lg font-semibold text-slate-700">
                     {hasActiveFilters
                        ? "Nenhum tripulante encontrado"
                        : "Nenhum tripulante cadastrado"}
                  </h2>
                  <p className="mb-4 max-w-md text-sm text-slate-500">
                     {hasActiveFilters
                        ? "Não encontramos resultados com os filtros aplicados. Tente ajustar os filtros."
                        : "Comece adicionando o primeiro tripulante ao sistema."}
                  </p>
                  {hasActiveFilters ? (
                     <Button color="light" size="sm" onClick={clearFilters}>
                        Limpar filtros
                     </Button>
                  ) : (
                     <div className="hidden md:block">
                        <PermBased
                           resource={"ops.tripulantes"}
                           requiredPerm={"create"}
                        >
                           <SearchUser />
                        </PermBased>
                     </div>
                  )}
               </div>
            ) : (
               <div>
                  {/* Refetch falho com dados em tela: uma faixa, nunca a tela
                      de erro — trocar 25 linhas boas por um aviso e o oposto do
                      "refetch suave" da regra de TanStack Query. */}
                  {isError && (
                     <div
                        role="status"
                        className="flex flex-wrap items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900"
                     >
                        <HiExclamationCircle className="h-4 w-4 shrink-0" />A
                        atualização falhou — mostrando os últimos dados.
                        <button
                           type="button"
                           onClick={() => refetch()}
                           className="font-semibold underline underline-offset-2"
                        >
                           Tentar novamente
                        </button>
                     </div>
                  )}

                  {/* Refetch suave: mantém os dados e esmaece (keepPreviousData) */}
                  <div
                     className={`transition-opacity duration-200 ${isFetching ? "opacity-50" : "opacity-100"}`}
                  >
                     {/* Mobile: a tabela derrubaria justamente as colunas de nome */}
                     <ul className="divide-y divide-slate-100 md:hidden">
                        {trips.map((trip) => (
                           <li key={trip.id ?? trip.trig}>
                              <TripCard trip={trip} />
                           </li>
                        ))}
                     </ul>

                     <div className="hidden min-h-96 overflow-x-auto md:block">
                        <Table hoverable theme={TRIP_TABLE_THEME}>
                           <TripTableHead />
                           <TableBody className="divide-y divide-slate-100">
                              {trips.map((trip) => (
                                 <TripRow
                                    key={trip.id ?? trip.trig}
                                    trip={trip}
                                 />
                              ))}
                           </TableBody>
                        </Table>
                     </div>
                  </div>

                  {/* Rodapé com paginação */}
                  <nav
                     className={`flex flex-col items-start justify-between space-y-3 border-t border-slate-100 p-3 sm:p-4 md:flex-row md:items-center md:space-y-0 ${isFetching ? "pointer-events-none opacity-50" : "opacity-100"} transition-opacity duration-200`}
                     aria-label="Navegação da tabela"
                  >
                     {/* Contagem e tamanho da pagina so com o rodape em
                         linha — empilhados, os dois custam o dobro da altura
                         do paginador para dizer o que ele ja diz. */}
                     <div className="hidden items-center gap-4 md:flex">
                        <span className="text-sm font-normal text-slate-500">
                           Mostrando{" "}
                           <span className="font-semibold text-slate-900">
                              {(currentPage - 1) * perPage + 1}-
                              {Math.min(currentPage * perPage, totalTrips)}
                           </span>{" "}
                           de{" "}
                           <span className="font-semibold text-slate-900">
                              {totalTrips}
                           </span>
                        </span>
                        <div className="flex items-center gap-2">
                           <label
                              htmlFor="perPage"
                              className="text-sm text-slate-500"
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
