"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabItem, Spinner, Pagination } from "flowbite-react";
import { FiltrosOrdem } from "./types";
import { FiltrosOrdemComponent } from "./components/FiltrosOrdem";
import { ListaOrdens } from "./components/ListaOrdens";
import { DeleteOrdemModal } from "./components/DeleteOrdemModal";
import { useOrdens, useDeleteOrdem } from "@/hooks/queries";
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

type TabKey = "aprovadas" | "rascunho";
const TAB_INDEX: Record<TabKey, number> = { aprovadas: 0, rascunho: 1 };
const TAB_KEY: Record<number, TabKey> = { 0: "aprovadas", 1: "rascunho" };

export default function OrdensMissao() {
   const router = useRouter();
   const searchParams = useSearchParams();

   // URL search params como fonte de verdade
   const tabParam = (searchParams.get("tab") as TabKey) || "aprovadas";
   const activeTab = TAB_INDEX[tabParam] ?? 0;
   const currentPage = Number(searchParams.get("page")) || 1;

   const updateParams = useCallback(
      (updates: Record<string, string | null>) => {
         const params = new URLSearchParams(searchParams.toString());
         for (const [key, value] of Object.entries(updates)) {
            if (value === null) params.delete(key);
            else params.set(key, value);
         }
         router.replace(`?${params.toString()}`, { scroll: false });
      },
      [searchParams, router]
   );

   // Paginacao derivada da URL
   const pageAprovadas = tabParam === "aprovadas" ? currentPage : 1;
   const pageRascunho = tabParam === "rascunho" ? currentPage : 1;

   // Filtros
   const [filtros, setFiltros] = useState<FiltrosOrdem>({
      busca: "",
      status: [],
      dataInicio: defaultDates.dataInicio,
      dataFim: defaultDates.dataFim,
      etiquetas_ids: [],
   });
   const [debouncedBusca, setDebouncedBusca] = useState(filtros.busca);

   // Modal de exclusao
   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
   const [ordemToDelete, setOrdemToDelete] = useState<OrdemMissaoList | null>(
      null
   );

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
      if (currentPage !== 1 && tabParam === "aprovadas") {
         updateParams({ page: null });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
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

   const handleOpenOrdem = (ordem: OrdemMissaoList) => {
      router.push(`/ops/om/${ordem.id}`);
   };

   const handleCloneOrdem = (ordem: OrdemMissaoList) => {
      router.push(`/ops/om/${ordem.id}/clonar`);
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
      const key = TAB_KEY[tab] ?? "aprovadas";
      updateParams({ tab: key === "aprovadas" ? null : key, page: null });
      if (filtros.status.length > 0) {
         setFiltros((prev) => ({ ...prev, status: [] }));
      }
   };

   // Handlers de paginacao
   const handlePageChangeAprovadas = (page: number) => {
      updateParams({ page: page === 1 ? null : String(page) });
   };

   const handlePageChangeRascunho = (page: number) => {
      updateParams({ page: page === 1 ? null : String(page) });
   };

   return (
      <div className="p-2 text-gray-900">
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
                     onClick={() => router.push("/ops/om/nova")}
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
      </div>
   );
}
