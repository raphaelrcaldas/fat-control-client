"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabItem, Spinner, Pagination } from "flowbite-react";
import { OrdemMissao, FiltrosOrdem, PaginationState } from "./types";
import { FiltrosOrdemComponent } from "./components/FiltrosOrdem";
import { ListaOrdens } from "./components/ListaOrdens";
import { OrdemModal } from "./components/OrdemModal";
import { DeleteOrdemModal } from "./components/DeleteOrdemModal";
import {
   listOrdens,
   getOrdem,
   deleteOrdem,
   type OrdemFilters,
} from "services/routes/om";
import { ordemFromApi, ordemListFromApi } from "./transformers";

// Helpers para datas padrao
const getDefaultDates = () => {
   const hoje = new Date();
   const trintaDiasAtras = new Date();
   const trintaDiasAFrente = new Date();
   trintaDiasAtras.setDate(hoje.getDate() - 30);
   trintaDiasAFrente.setDate(hoje.getDate() + 30);

   const formatDate = (date: Date) => date.toISOString().split("T")[0];

   return {
      dataInicio: formatDate(trintaDiasAtras),
      dataFim: formatDate(trintaDiasAFrente),
   };
};

const defaultDates = getDefaultDates();

export default function OrdensMissao() {
   // Estado de dados
   const [ordensAprovadas, setOrdensAprovadas] = useState<OrdemMissao[]>([]);
   const [ordensRascunho, setOrdensRascunho] = useState<OrdemMissao[]>([]);

   // Paginacao (perPage: 2 para teste, voltar para 20 em producao)
   const [paginationAprovadas, setPaginationAprovadas] =
      useState<PaginationState>({
         page: 1,
         perPage: 20,
         total: 0,
         pages: 1,
      });
   const [paginationRascunho, setPaginationRascunho] =
      useState<PaginationState>({
         page: 1,
         perPage: 20,
         total: 0,
         pages: 1,
      });

   // Estados de loading/error
   const [isLoadingAprovadas, setIsLoadingAprovadas] = useState(true);
   const [isLoadingRascunho, setIsLoadingRascunho] = useState(true);
   const [error, setError] = useState<string | null>(null);

   // Filtros
   const [filtros, setFiltros] = useState<FiltrosOrdem>({
      busca: "",
      status: [],
      tipo: "",
      dataInicio: defaultDates.dataInicio,
      dataFim: defaultDates.dataFim,
      etiquetas_ids: [],
   });
   const [debouncedBusca, setDebouncedBusca] = useState(filtros.busca);
   const [debouncedTipo, setDebouncedTipo] = useState(filtros.tipo);

   // Modal de edicao/criacao
   const [modalOpen, setModalOpen] = useState(false);
   const [selectedOrdem, setSelectedOrdem] = useState<OrdemMissao | null>(null);
   const [isCloning, setIsCloning] = useState(false);
   const [activeTab, setActiveTab] = useState(0);

   // Modal de exclusao
   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
   const [ordemToDelete, setOrdemToDelete] = useState<OrdemMissao | null>(null);
   const [isDeleting, setIsDeleting] = useState(false);

   // Debounce para campos de texto
   useEffect(() => {
      const timer = setTimeout(() => {
         setDebouncedBusca(filtros.busca);
         setDebouncedTipo(filtros.tipo);
      }, 300);
      return () => clearTimeout(timer);
   }, [filtros.busca, filtros.tipo]);

   // Reset para pagina 1 quando filtros mudam
   useEffect(() => {
      setPaginationAprovadas((prev) => ({ ...prev, page: 1 }));
   }, [
      filtros.status,
      filtros.dataInicio,
      filtros.dataFim,
      debouncedBusca,
      debouncedTipo,
      filtros.etiquetas_ids,
   ]);

   // Buscar ordens aprovadas (nao-Rascunho)
   const fetchOrdensAprovadas = useCallback(async () => {
      setIsLoadingAprovadas(true);
      setError(null);

      try {
         const filters: OrdemFilters = {
            page: paginationAprovadas.page,
            per_page: paginationAprovadas.perPage,
         };

         // Aplica filtros de status
         if (filtros.status.length > 0) {
            filters.status = filtros.status;
         } else {
            // Por padrao, busca todos exceto rascunho
            filters.status_ne = "rascunho";
         }
         if (debouncedTipo) filters.tipo = debouncedTipo;
         if (debouncedBusca) filters.busca = debouncedBusca;
         if (filtros.dataInicio) filters.data_inicio = filtros.dataInicio;
         if (filtros.dataFim) filters.data_fim = filtros.dataFim;
         if (filtros.etiquetas_ids?.length > 0)
            filters.etiquetas_ids = filtros.etiquetas_ids;

         const response = await listOrdens(filters);

         // Transforma diretamente para o formato UI (etapas já vêm na listagem)
         const ordens = response.items.map(ordemListFromApi);

         setOrdensAprovadas(ordens);
         setPaginationAprovadas((prev) => ({
            ...prev,
            total: response.total,
            pages: response.pages,
         }));
      } catch (err) {
         console.error("Erro ao buscar ordens aprovadas:", err);
         setError(
            err instanceof Error ? err.message : "Erro ao carregar ordens"
         );
      } finally {
         setIsLoadingAprovadas(false);
      }
   }, [
      paginationAprovadas.page,
      paginationAprovadas.perPage,
      filtros.status,
      filtros.dataInicio,
      filtros.dataFim,
      debouncedBusca,
      debouncedTipo,
      filtros.etiquetas_ids,
   ]);

   // Buscar rascunhos
   const fetchRascunhos = useCallback(async () => {
      setIsLoadingRascunho(true);

      try {
         const filters: OrdemFilters = {
            page: paginationRascunho.page,
            per_page: paginationRascunho.perPage,
            status: ["rascunho"],
         };

         const response = await listOrdens(filters);

         // Transforma diretamente para o formato UI (etapas já vêm na listagem)
         const ordens = response.items.map(ordemListFromApi);

         setOrdensRascunho(ordens);
         setPaginationRascunho((prev) => ({
            ...prev,
            total: response.total,
            pages: response.pages,
         }));
      } catch (err) {
         console.error("Erro ao buscar rascunhos:", err);
      } finally {
         setIsLoadingRascunho(false);
      }
   }, [paginationRascunho.page, paginationRascunho.perPage]);

   // Efeitos para buscar dados
   useEffect(() => {
      fetchOrdensAprovadas();
   }, [fetchOrdensAprovadas]);

   useEffect(() => {
      fetchRascunhos();
   }, [fetchRascunhos]);

   // Refresh apos salvar ordem
   const handleSaveOrdem = useCallback(() => {
      setModalOpen(false);
      setSelectedOrdem(null);
      setIsCloning(false);
      // Recarrega ambas as listas
      fetchOrdensAprovadas();
      fetchRascunhos();
   }, [fetchOrdensAprovadas, fetchRascunhos]);

   const handleOpenOrdem = async (ordem: OrdemMissao) => {
      try {
         // Busca dados completos da ordem
         const ordemCompleta = await getOrdem(ordem.id);
         setSelectedOrdem(ordemFromApi(ordemCompleta));
         setIsCloning(false);
         setModalOpen(true);
      } catch (err) {
         console.error("Erro ao abrir ordem:", err);
         setError("Erro ao carregar detalhes da ordem");
      }
   };

   const handleCloneOrdem = async (ordem: OrdemMissao) => {
      try {
         const ordemCompleta = await getOrdem(ordem.id);
         setSelectedOrdem(ordemFromApi(ordemCompleta));
         setIsCloning(true);
         setModalOpen(true);
      } catch (err) {
         console.error("Erro ao clonar ordem:", err);
         setError("Erro ao carregar ordem para clonagem");
      }
   };

   // Abre modal de confirmacao de exclusao
   const handleDeleteOrdem = (ordem: OrdemMissao) => {
      setOrdemToDelete(ordem);
      setDeleteModalOpen(true);
   };

   // Confirma exclusao
   const confirmDeleteOrdem = async () => {
      if (!ordemToDelete) return;

      setIsDeleting(true);
      try {
         await deleteOrdem(ordemToDelete.id);
         setDeleteModalOpen(false);
         setOrdemToDelete(null);
         // Recarrega listas
         fetchOrdensAprovadas();
         fetchRascunhos();
      } catch (err) {
         console.error("Erro ao excluir ordem:", err);
         setError("Erro ao excluir ordem");
      } finally {
         setIsDeleting(false);
      }
   };

   // Cancela exclusao
   const cancelDeleteOrdem = () => {
      setDeleteModalOpen(false);
      setOrdemToDelete(null);
   };

   const clearFiltros = () => {
      setFiltros({
         busca: "",
         status: [],
         tipo: "",
         dataInicio: defaultDates.dataInicio,
         dataFim: defaultDates.dataFim,
         etiquetas_ids: [],
      });
   };

   const handleTabChange = (tab: number) => {
      setActiveTab(tab);
      if (filtros.status.length > 0) {
         setFiltros((prev) => ({ ...prev, status: [] }));
      }
   };

   // Handlers de paginacao
   const handlePageChangeAprovadas = (page: number) => {
      setPaginationAprovadas((prev) => ({ ...prev, page }));
   };

   const handlePageChangeRascunho = (page: number) => {
      setPaginationRascunho((prev) => ({ ...prev, page }));
   };

   return (
      <div className="p-2 text-gray-900">
         <div className="mx-auto">
            {/* Header */}
            <header className="mb-3 flex items-center justify-between">
               <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                     Ordens de Missao
                  </h1>
                  <p className="text-sm text-gray-500">
                     Gerenciamento de Ordens
                  </p>
               </div>
               <button
                  onClick={() => {
                     setSelectedOrdem(null);
                     setIsCloning(false);
                     setModalOpen(true);
                  }}
                  className="flex items-center gap-2 rounded-lg bg-red-500 px-5 py-2.5 font-bold text-white shadow hover:bg-red-700"
               >
                  <span className="text-lg">+</span>
                  Nova Ordem de Missao
               </button>
            </header>

            {/* Erro global */}
            {error && (
               <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                  {error}
                  <button
                     onClick={() => setError(null)}
                     className="ml-4 text-sm underline"
                  >
                     Fechar
                  </button>
               </div>
            )}

            {/* Tabs */}
            <Tabs
               onActiveTabChange={handleTabChange}
               variant="underline"
               theme={{
                  tablist: {
                     tabitem: {
                        base: "flex items-center justify-center rounded-t-lg p-4 text-sm font-medium first:ml-0 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:text-gray-400",
                        variant: {
                           underline: {
                              base: "rounded-t-lg",
                              active: {
                                 on: "active rounded-t-lg border-b-2 border-red-500 text-red-500",
                                 off: "border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-600",
                              },
                           },
                        },
                     },
                  },
               }}
            >
               <TabItem
                  active={activeTab === 0}
                  title={
                     <span className="flex items-center gap-2">
                        Aprovadas
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                           {paginationAprovadas.total}
                        </span>
                     </span>
                  }
               >
                  <FiltrosOrdemComponent
                     filtros={filtros}
                     onFiltrosChange={setFiltros}
                     onClearFiltros={clearFiltros}
                  />
                  <p className="mb-3 text-sm text-gray-500">
                     {paginationAprovadas.total}{" "}
                     {paginationAprovadas.total === 1
                        ? "missao encontrada"
                        : "missoes encontradas"}
                  </p>
                  {isLoadingAprovadas ? (
                     <div className="flex items-center justify-center py-12">
                        <Spinner size="lg" />
                     </div>
                  ) : (
                     <>
                        <ListaOrdens
                           ordens={ordensAprovadas}
                           onOrdemClick={handleOpenOrdem}
                           onCloneOrdem={handleCloneOrdem}
                           onDeleteOrdem={handleDeleteOrdem}
                        />
                        {paginationAprovadas.pages > 1 && (
                           <div className="mt-4 flex justify-center">
                              <Pagination
                                 currentPage={paginationAprovadas.page}
                                 totalPages={paginationAprovadas.pages}
                                 onPageChange={handlePageChangeAprovadas}
                                 showIcons
                                 previousLabel="Anterior"
                                 nextLabel="Proxima"
                                 theme={{
                                    pages: {
                                       selector: {
                                          active:
                                             "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700",
                                       },
                                    },
                                 }}
                              />
                           </div>
                        )}
                     </>
                  )}
               </TabItem>
               <TabItem
                  active={activeTab === 1}
                  title={
                     <span className="flex items-center gap-2">
                        Rascunhos
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                           {paginationRascunho.total}
                        </span>
                     </span>
                  }
               >
                  <p className="mb-3 text-sm text-gray-500">
                     {paginationRascunho.total}{" "}
                     {paginationRascunho.total === 1
                        ? "rascunho encontrado"
                        : "rascunhos encontrados"}
                  </p>
                  {isLoadingRascunho ? (
                     <div className="flex items-center justify-center py-12">
                        <Spinner size="lg" />
                     </div>
                  ) : (
                     <>
                        <ListaOrdens
                           ordens={ordensRascunho}
                           onOrdemClick={handleOpenOrdem}
                           onCloneOrdem={handleCloneOrdem}
                           onDeleteOrdem={handleDeleteOrdem}
                        />
                        {paginationRascunho.pages > 1 && (
                           <div className="mt-4 flex justify-center">
                              <Pagination
                                 currentPage={paginationRascunho.page}
                                 totalPages={paginationRascunho.pages}
                                 onPageChange={handlePageChangeRascunho}
                                 showIcons
                                 previousLabel="Anterior"
                                 nextLabel="Proxima"
                                 theme={{
                                    pages: {
                                       selector: {
                                          active:
                                             "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700",
                                       },
                                    },
                                 }}
                              />
                           </div>
                        )}
                     </>
                  )}
               </TabItem>
            </Tabs>
         </div>

         {/* Modal de edicao/criacao */}
         <OrdemModal
            ordem={selectedOrdem}
            onSave={handleSaveOrdem}
            onClose={() => {
               setModalOpen(false);
               setSelectedOrdem(null);
               setIsCloning(false);
            }}
            isNew={!selectedOrdem || isCloning}
            isCloning={isCloning}
            isOpen={modalOpen}
         />

         {/* Modal de exclusao */}
         <DeleteOrdemModal
            isOpen={deleteModalOpen}
            ordemNumero={ordemToDelete?.numero || ""}
            onConfirm={confirmDeleteOrdem}
            onCancel={cancelDeleteOrdem}
            isDeleting={isDeleting}
         />
      </div>
   );
}
