"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import { Tabs, TabItem, Spinner, Pagination } from "flowbite-react";
import { FiltrosOrdem } from "./types";
import { FiltrosOrdemComponent } from "./components/FiltrosOrdem";
import { ListaOrdens } from "./components/ListaOrdens";
import { OrdemDetail } from "./components/OrdemDetail";
import { DeleteOrdemModal } from "./components/DeleteOrdemModal";
import { formatDateForDisplay } from "./components/OrdemDetail/utils/ordemUtils";
import { useOrdens, useOrdem, useDeleteOrdem } from "@/hooks/queries";
import { type OrdemMissaoList } from "services/routes/om/ordens";
import { PermBased } from "../../hooks/usePermBased";

const tabsTheme = {
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
};

const getDefaultDates = () => {
   const hoje = new Date();
   const primeiroDiaAno = new Date(hoje.getFullYear(), 0, 1);
   const trintaDiasAFrente = new Date();
   trintaDiasAFrente.setDate(hoje.getDate() + 30);

   const formatDate = (date: Date) => date.toISOString().split("T")[0];

   return {
      dataInicio: formatDate(primeiroDiaAno),
      dataFim: formatDate(trintaDiasAFrente),
   };
};

const defaultDates = getDefaultDates();

export default function OrdensMissao() {
   // Paginacao
   const [pageAprovadas, setPageAprovadas] = useState(1);
   const [pageRascunho, setPageRascunho] = useState(1);

   // Filtros
   const [filtros, setFiltros] = useState<FiltrosOrdem>({
      busca: "",
      status: [],
      dataInicio: defaultDates.dataInicio,
      dataFim: defaultDates.dataFim,
      etiquetas_ids: [],
   });
   const [debouncedBusca, setDebouncedBusca] = useState(filtros.busca);

   // Modal de edicao/criacao
   const [modalOpen, setModalOpen] = useState(false);
   const [selectedOrdemId, setSelectedOrdemId] = useState<number | null>(null);
   const [isCloning, setIsCloning] = useState(false);
   const [activeTab, setActiveTab] = useState(0);

   // Modal de exclusao
   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
   const [ordemToDelete, setOrdemToDelete] = useState<OrdemMissaoList | null>(
      null
   );

   // Estado de carregamento ao abrir ordem (para overlay)
   const [loadingOrdemData, setLoadingOrdemData] =
      useState<OrdemMissaoList | null>(null);

   // ========================================
   // TanStack Query - Queries
   // ========================================

   // Query: Ordens aprovadas (nao-rascunho) com filtros
   const ordensAprovadasQuery = useOrdens({
      page: pageAprovadas,
      per_page: 20,
      ...(filtros.status.length > 0
         ? { status: filtros.status }
         : { status_ne: "rascunho" }),
      ...(debouncedBusca && { busca: debouncedBusca }),
      ...(filtros.dataInicio && { data_inicio: filtros.dataInicio }),
      ...(filtros.dataFim && { data_fim: filtros.dataFim }),
      ...(filtros.etiquetas_ids.length > 0 && {
         etiquetas_ids: filtros.etiquetas_ids,
      }),
   });

   // Query: Rascunhos
   const ordensRascunhoQuery = useOrdens({
      page: pageRascunho,
      per_page: 20,
      status: ["rascunho"],
   });

   // Query: Detalhe da ordem selecionada
   const selectedOrdemQuery = useOrdem(selectedOrdemId);

   // Mutation: Excluir ordem
   const deleteOrdemMutation = useDeleteOrdem();

   // Dados derivados das queries
   const ordensAprovadas = ordensAprovadasQuery.data?.items ?? [];
   const ordensRascunho = ordensRascunhoQuery.data?.items ?? [];
   const paginationAprovadas = {
      total: ordensAprovadasQuery.data?.total ?? 0,
      pages: ordensAprovadasQuery.data?.pages ?? 1,
   };
   const paginationRascunho = {
      total: ordensRascunhoQuery.data?.total ?? 0,
      pages: ordensRascunhoQuery.data?.pages ?? 1,
   };

   // Debounce para campos de texto
   useEffect(() => {
      const timer = setTimeout(() => {
         setDebouncedBusca(filtros.busca);
      }, 500);
      return () => clearTimeout(timer);
   }, [filtros.busca]);

   // Reset para pagina 1 quando filtros mudam
   useEffect(() => {
      setPageAprovadas(1);
   }, [
      filtros.status,
      filtros.dataInicio,
      filtros.dataFim,
      debouncedBusca,
      filtros.etiquetas_ids,
   ]);

   // ========================================
   // Handlers
   // ========================================

   // Refresh apos salvar ordem (mutations invalidam automaticamente)
   const handleSaveOrdem = () => {
      setModalOpen(false);
      setSelectedOrdemId(null);
      setIsCloning(false);
   };

   const handleOpenOrdem = (ordem: OrdemMissaoList) => {
      setLoadingOrdemData(ordem);
      setSelectedOrdemId(ordem.id);
      setIsCloning(false);
      setModalOpen(true);
   };

   const handleCloneOrdem = (ordem: OrdemMissaoList) => {
      setLoadingOrdemData(ordem);
      setSelectedOrdemId(ordem.id);
      setIsCloning(true);
      setModalOpen(true);
   };

   // Abre modal de confirmacao de exclusao
   const handleDeleteOrdem = (ordem: OrdemMissaoList) => {
      setOrdemToDelete(ordem);
      setDeleteModalOpen(true);
   };

   // Confirma exclusao (usa mutation)
   const confirmDeleteOrdem = () => {
      if (!ordemToDelete) return;

      deleteOrdemMutation.mutate(ordemToDelete.id, {
         onSuccess: () => {
            setDeleteModalOpen(false);
            setOrdemToDelete(null);
         },
         onError: (err) => {
            console.error("Erro ao excluir ordem:", err);
         },
      });
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
      setPageAprovadas(page);
   };

   const handlePageChangeRascunho = (page: number) => {
      setPageRascunho(page);
   };

   return (
      <div
         className={clsx(
            "p-2 text-gray-900",
            modalOpen && "relative h-full overflow-hidden"
         )}
      >
         <div className="mx-auto">
            {/* Header */}
            <header className="mb-3 flex items-center justify-between">
               <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                     Ordens de Missão
                  </h1>
                  <p className="text-sm text-gray-500">
                     Gerenciamento de Ordens
                  </p>
               </div>
               <PermBased resource={"ordem_missao"} requiredPerm={"create"}>
                  <button
                     onClick={() => {
                        setSelectedOrdemId(null);
                        setIsCloning(false);
                        setModalOpen(true);
                     }}
                     className="flex items-center gap-2 rounded-lg bg-red-500 px-5 py-2.5 font-bold text-white shadow hover:bg-red-700"
                  >
                     <span className="text-lg">+</span>
                     Nova Ordem de Missão
                  </button>
               </PermBased>
            </header>

            {/* Erro global */}
            {ordensAprovadasQuery.isError && (
               <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                  {ordensAprovadasQuery.error?.message ||
                     "Erro ao carregar ordens"}
               </div>
            )}

            {/* Tabs */}
            <Tabs
               onActiveTabChange={handleTabChange}
               variant="underline"
               theme={tabsTheme}
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
                        ? "missão encontrada"
                        : "missões encontradas"}
                  </p>
                  {ordensAprovadasQuery.isLoading ? (
                     <div className="flex items-center justify-center py-12">
                        <Spinner size="lg" color="failure" />
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
                                 currentPage={pageAprovadas}
                                 totalPages={paginationAprovadas.pages}
                                 onPageChange={handlePageChangeAprovadas}
                                 showIcons
                                 previousLabel="Anterior"
                                 nextLabel="Proxima"
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
                  {ordensRascunhoQuery.isLoading ? (
                     <div className="flex items-center justify-center py-12">
                        <Spinner size="lg" color="failure" />
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
                                 currentPage={pageRascunho}
                                 totalPages={paginationRascunho.pages}
                                 onPageChange={handlePageChangeRascunho}
                                 showIcons
                                 previousLabel="Anterior"
                                 nextLabel="Proxima"
                              />
                           </div>
                        )}
                     </>
                  )}
               </TabItem>
            </Tabs>
         </div>

         {/* Modal de edicao/criacao */}
         <OrdemDetail
            ordem={selectedOrdemQuery.data ?? null}
            onSave={handleSaveOrdem}
            onClose={() => {
               setModalOpen(false);
               setSelectedOrdemId(null);
               setIsCloning(false);
            }}
            isNew={!selectedOrdemQuery.data || isCloning}
            isCloning={isCloning}
            isOpen={modalOpen}
         />

         {/* Modal de exclusao */}
         <DeleteOrdemModal
            isOpen={deleteModalOpen}
            ordemNumero={ordemToDelete?.numero || ""}
            ordemUae={ordemToDelete?.uae || ""}
            ordemDataSaida={ordemToDelete?.data_saida || ""}
            ordemStatus={ordemToDelete?.status}
            onConfirm={confirmDeleteOrdem}
            onCancel={cancelDeleteOrdem}
            isDeleting={deleteOrdemMutation.isPending}
         />

         {/* Overlay de carregamento ao abrir ordem */}
         {selectedOrdemQuery.isLoading && loadingOrdemData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs">
               <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-8 shadow-xl">
                  <Spinner size="xl" color="failure" />
                  <p className="text-lg font-medium text-gray-700">
                     Carregando detalhes da ordem
                  </p>
                  <p className="font-mono text-xl font-bold text-gray-900 uppercase">
                     {`${loadingOrdemData.numero}/${loadingOrdemData.uae}/${formatDateForDisplay(loadingOrdemData.data_saida)}`}
                  </p>
               </div>
            </div>
         )}
      </div>
   );
}
