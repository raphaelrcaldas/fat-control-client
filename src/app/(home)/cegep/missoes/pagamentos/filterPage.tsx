"use client";

import { useState } from "react";
import {
   Select,
   Checkbox,
   Button,
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
} from "flowbite-react";
import { Pagination } from "@/components/Pagination";
import { UserRow, UserCard } from "./components/userRow";
import { PagamentosSkeleton } from "./components/PagamentosSkeleton";
import { ActiveFiltersBar } from "./components/ActiveFiltersBar";
import { FiltersPanel } from "./components/FiltersPanel";
import { UserMissionDetailModal } from "../../components/UserMissionDetailModal";
import { usePagamentos } from "@/hooks/queries/usePagamentos";
import { PagamentoRecord } from "services/routes/cegep/financeiro";
import { usePagamentosFilters } from "./hooks/usePagamentosFilters";
import { usePagamentosSelection } from "./hooks/usePagamentosSelection";
import { HiDocumentText, HiCurrencyDollar } from "react-icons/hi";
import { clsx } from "clsx";

export function FilterPage({ active }: { active: boolean }) {
   const [showFilters, setShowFilters] = useState(false);
   const [showModal, setShowModal] = useState(false);
   const [selectedRecord, setSelectedRecord] = useState<PagamentoRecord | null>(
      null
   );

   const filters = usePagamentosFilters();
   const {
      tipoDoc,
      nDoc,
      selectedTipo,
      selectedSit,
      userSearch,
      dataInicio,
      dataFim,
      currentPage,
      itemsPerPage,
      setCurrentPage,
      setItemsPerPage,
   } = filters;

   const { data, isLoading, isFetching, isError, error, refetch } =
      usePagamentos(
         {
            page: currentPage,
            limit: itemsPerPage,
            tipo_doc: tipoDoc?.length ? tipoDoc : undefined,
            n_doc: nDoc || undefined,
            tipo: selectedTipo?.length ? selectedTipo : undefined,
            sit: selectedSit?.length ? selectedSit : undefined,
            user: userSearch?.toLowerCase() || undefined,
            ini: dataInicio || undefined,
            fim: dataFim || undefined,
         },
         { enabled: active }
      );

   const misRecords = data?.items ?? null;
   const totalRecords = data?.total ?? 0;
   const totalPages = data?.total_pages ?? 1;

   const {
      selectedAll,
      setSelectedAll,
      selectedIds,
      selectedIdSet,
      valorSoma,
      diariasSoma,
      handleSelect,
   } = usePagamentosSelection(misRecords);

   function handleShowDetail(record: PagamentoRecord) {
      setSelectedRecord(record);
      setShowModal(true);
   }

   return (
      <div className="space-y-2">
         <ActiveFiltersBar
            filters={filters}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
         />

         <FiltersPanel filters={filters} show={showFilters} />

         {/* Results Section */}
         <section className="relative">
            <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
               {/* Loading inicial (sem dados) */}
               {isLoading && !misRecords ? (
                  <PagamentosSkeleton rows={itemsPerPage} />
               ) : isError && !misRecords ? (
                  <div className="flex flex-col items-center justify-center gap-3 p-16">
                     <p className="text-sm font-medium text-red-800">
                        Erro ao carregar os pagamentos
                     </p>
                     <p className="text-xs text-red-600">
                        {error instanceof Error
                           ? error.message
                           : "Falha na comunicação com o servidor"}
                     </p>
                     <Button color="red" size="sm" onClick={() => refetch()}>
                        Tentar novamente
                     </Button>
                  </div>
               ) : misRecords && misRecords.length > 0 ? (
                  <div>
                     <div className="flex flex-col gap-2 border-b border-slate-200 bg-gray-50 px-3 py-1 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:py-0.5">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                           {/* Glifo compacto; o label vira o alvo de toque de
                               44px só no dedo (padrão do ToggleCheckbox). */}
                           <label className="inline-flex cursor-pointer items-center justify-center pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]">
                              <Checkbox
                                 className="size-5 pointer-coarse:size-6"
                                 checked={selectedAll}
                                 color="primary"
                                 onChange={() => setSelectedAll(!selectedAll)}
                                 aria-label="Selecionar todos os registros"
                              />
                           </label>
                           <h2 className="shrink-0 text-sm font-semibold whitespace-nowrap text-gray-800">
                              Registros Encontrados ({totalRecords})
                           </h2>

                           {/* Resumo da seleção: só monta quando há algo
                               marcado — não reserva espaço nem estoura a
                               viewport no mobile. Full-width com wrap no
                               celular, inline (auto) no desktop. */}
                           {selectedIds.length > 0 && (
                              <div className="w-full rounded border border-green-300 bg-green-50 px-2 py-1.5 shadow-sm sm:w-auto">
                                 <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                                    <HiCurrencyDollar className="shrink-0 text-xl text-green-600" />
                                    <p className="text-sm font-medium text-gray-700">
                                       {selectedIds.length}{" "}
                                       {selectedIds.length === 1
                                          ? "registro selecionado"
                                          : "registros selecionados"}
                                    </p>
                                    <p className="text-sm font-medium text-green-700 tabular-nums">
                                       {valorSoma.toLocaleString("pt-BR", {
                                          style: "currency",
                                          currency: "BRL",
                                       })}
                                    </p>
                                    <p className="text-sm font-medium text-green-700 tabular-nums">
                                       {diariasSoma.toFixed(1)} diária
                                       {diariasSoma !== 1 ? "s" : ""}
                                    </p>
                                 </div>
                              </div>
                           )}
                        </div>
                        {/* "Exibindo X-Y de N" + seletor de qtd: ocultos no
                            mobile (a paginação embaixo já situa; menos ruído no
                            cabeçalho denso). Reaparecem no sm+. */}
                        <div className="hidden items-center gap-3 sm:flex">
                           <span className="text-sm text-gray-600">
                              Exibindo{" "}
                              {Math.min(
                                 (currentPage - 1) * itemsPerPage + 1,
                                 totalRecords
                              )}
                              -
                              {Math.min(
                                 currentPage * itemsPerPage,
                                 totalRecords
                              )}{" "}
                              de {totalRecords}
                           </span>
                           <Select
                              sizing="sm"
                              aria-label="Registros por página"
                              value={itemsPerPage}
                              onChange={(e) =>
                                 setItemsPerPage(Number(e.target.value))
                              }
                              className="w-20"
                           >
                              <option value={10}>10</option>
                              <option value={20}>20</option>
                              <option value={50}>50</option>
                              <option value={100}>100</option>
                           </Select>
                        </div>
                     </div>
                     {/* Área dos registros com spinner */}
                     <div
                        className={clsx(
                           "transition-opacity",
                           isFetching && "opacity-50"
                        )}
                     >
                        {/* Mobile (< md): cards empilhados — evita scroll horizontal */}
                        <div className="flex flex-col gap-3 p-2 sm:p-3 md:hidden">
                           {misRecords?.map((record) => (
                              <UserCard
                                 key={record.user_mis.id}
                                 record={record}
                                 checked={selectedIdSet.has(record.user_mis.id)}
                                 onSelect={handleSelect}
                                 onShowDetail={handleShowDetail}
                              />
                           ))}
                        </div>

                        {/* Desktop (>= md): tabela */}
                        <div className="hidden overflow-x-auto md:block">
                           <Table
                              hoverable
                              theme={{
                                 body: { cell: { base: "py-1 px-3" } },
                                 head: {
                                    cell: {
                                       base: "bg-white border-b border-slate-200 px-3",
                                    },
                                 },
                              }}
                           >
                              <TableHead>
                                 <TableRow>
                                    <TableHeadCell className="text-center">
                                       <span className="sr-only">Sel</span>
                                    </TableHeadCell>
                                    <TableHeadCell className="text-center">
                                       Ordem
                                    </TableHeadCell>
                                    <TableHeadCell>Militar</TableHeadCell>
                                    <TableHeadCell className="text-center">
                                       Sit
                                    </TableHeadCell>
                                    <TableHeadCell>Descrição</TableHeadCell>
                                    <TableHeadCell className="text-center">
                                       Afastamento
                                    </TableHeadCell>
                                    <TableHeadCell className="text-center">
                                       Regresso
                                    </TableHeadCell>
                                    <TableHeadCell className="text-center">
                                       Dias
                                    </TableHeadCell>
                                    <TableHeadCell className="text-center">
                                       Diárias
                                    </TableHeadCell>
                                    <TableHeadCell className="text-center">
                                       Valor
                                    </TableHeadCell>
                                    <TableHeadCell className="text-center">
                                       <span className="sr-only">Ações</span>
                                    </TableHeadCell>
                                 </TableRow>
                              </TableHead>
                              <TableBody className="divide-y">
                                 {misRecords?.map((record) => (
                                    <UserRow
                                       key={record.user_mis.id}
                                       record={record}
                                       checked={selectedIdSet.has(
                                          record.user_mis.id
                                       )}
                                       onSelect={handleSelect}
                                       onShowDetail={handleShowDetail}
                                    />
                                 ))}
                              </TableBody>
                           </Table>
                        </div>
                     </div>
                     {totalPages > 1 && (
                        <div className="flex justify-center border-t border-slate-200 bg-gray-50 px-3 py-4 sm:px-6">
                           <Pagination
                              currentPage={currentPage}
                              totalPages={totalPages}
                              onPageChange={setCurrentPage}
                           />
                        </div>
                     )}
                  </div>
               ) : isLoading ? (
                  <PagamentosSkeleton rows={itemsPerPage} />
               ) : (
                  <div className="flex flex-col items-center justify-center gap-4 p-16">
                     <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                        <HiDocumentText className="text-4xl text-gray-400" />
                     </div>
                     <p className="text-lg font-medium text-gray-500">
                        Nenhum registro encontrado
                     </p>
                     <p className="text-sm text-gray-400">
                        Ajuste os filtros para encontrar resultados
                     </p>
                  </div>
               )}
            </div>
         </section>

         <UserMissionDetailModal
            show={showModal}
            onClose={() => setShowModal(false)}
            record={selectedRecord}
         />
      </div>
   );
}
