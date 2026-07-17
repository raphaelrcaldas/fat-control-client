"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
   Tabs,
   TabItem,
   Pagination,
   Button,
   type TabsRef,
} from "flowbite-react";
import { HiPlus, HiOutlineClipboardList } from "react-icons/hi";
import clsx from "clsx";
import {
   useSearchParamsUpdater,
   getStringParam,
   getArrayParam,
   getNumberArrayParam,
   serializeArray,
   serializeNumberArray,
   serializeString,
} from "@/hooks/useSearchParamsState";
import { FiltrosOrdem } from "./types";
import { FiltrosOrdemComponent } from "./components/FiltrosOrdem";
import { ListaOrdens } from "./components/ListaOrdens";
import { ListaOrdensSkeleton } from "./components/ListaOrdensSkeleton";
import { DeleteOrdemModal } from "./components/DeleteOrdemModal";
import { useOrdens, useDeleteOrdem } from "@/hooks/queries";
import { type OrdemMissaoList } from "services/routes/om/ordens";
import { useAuth } from "@/app/context/auth";
import { useToast } from "@/app/context/toast";
import { dateToIso } from "utils/dateHandler";
import { saveOmListUrl } from "./utils/omListUrl";
import { PermBased } from "../../hooks/usePermBased";

const tabsTheme = {
   tablist: {
      tabitem: {
         base: "flex items-center justify-center rounded-t p-4 text-sm font-medium first:ml-0 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:text-gray-400",
         variant: {
            underline: {
               base: "rounded-t",
               active: {
                  on: "active border-primary-600 text-primary-600 rounded-t border-b-2",
                  off: "border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-600",
               },
            },
         },
      },
   },
};

// Datas default em fuso local: 1º de janeiro do ano corrente até hoje + 30 dias
const getDefaultDates = () => {
   const hoje = new Date();
   const primeiroDiaAno = new Date(hoje.getFullYear(), 0, 1);
   const trintaDiasAFrente = new Date();
   trintaDiasAFrente.setDate(hoje.getDate() + 30);

   return {
      dataInicio: dateToIso(primeiroDiaAno),
      dataFim: dateToIso(trintaDiasAFrente),
   };
};

type TabKey = "aprovadas" | "rascunho";
const TAB_INDEX: Record<TabKey, number> = { aprovadas: 0, rascunho: 1 };
const TAB_KEY: Record<number, TabKey> = { 0: "aprovadas", 1: "rascunho" };

export default function OrdensMissao() {
   const router = useRouter();
   const { activeOrg } = useAuth();
   const { push: pushToast } = useToast();
   const { searchParams, setParams } = useSearchParamsUpdater();

   // O scroll fica no <main> do layout, não na window: ref no topo da página
   // para a paginação voltar ao início da lista
   const pageTopRef = useRef<HTMLDivElement>(null);

   // Ref imperativa do Tabs (não-controlado no Flowbite): permite ressincronizar
   // com a URL sem remontar o componente inteiro via key={tabParam}
   const tabsRef = useRef<TabsRef>(null);

   // Calculado por mount (não no load do módulo) para não envelhecer numa SPA aberta
   const [defaultDates] = useState(getDefaultDates);

   // URL search params como fonte de verdade (tab, página e filtros)
   const tabParam = (searchParams.get("tab") as TabKey) || "aprovadas";
   const activeTab = TAB_INDEX[tabParam] ?? 0;
   const currentPage = Number(searchParams.get("page")) || 1;

   // Filtros derivados da URL — voltar da página de detalhe ou compartilhar
   // o link preserva a visão filtrada; datas ausentes caem no default
   const filtros: FiltrosOrdem = useMemo(
      () => ({
         busca: getStringParam(searchParams, "busca"),
         status: getArrayParam(searchParams, "status"),
         dataInicio: getStringParam(
            searchParams,
            "inicio",
            defaultDates.dataInicio
         ),
         dataFim: getStringParam(searchParams, "fim", defaultDates.dataFim),
         etiquetas_ids: getNumberArrayParam(searchParams, "etiquetas"),
      }),
      [searchParams, defaultDates]
   );

   // Filtros ativos (datas iguais ao default não contam) — controla o empty state
   const hasActiveFilters = !!(
      filtros.busca ||
      filtros.status.length > 0 ||
      filtros.dataInicio !== defaultDates.dataInicio ||
      filtros.dataFim !== defaultDates.dataFim ||
      filtros.etiquetas_ids.length > 0
   );

   // Busca digitada fica local para resposta imediata; vai à URL com debounce
   const [buscaInput, setBuscaInput] = useState(filtros.busca);
   const debouncedBusca = useDebouncedValue(buscaInput, 500);

   useEffect(() => {
      const current = searchParams.get("busca") ?? "";
      if (debouncedBusca !== current) {
         setParams({ busca: debouncedBusca || undefined, page: undefined });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [debouncedBusca]);

   // Ressincroniza o input quando a URL muda por fora (voltar/avançar do
   // navegador). Não briga com a digitação: quando a mudança veio do
   // próprio debounce, filtros.busca === debouncedBusca e nada é feito.
   useEffect(() => {
      if (filtros.busca !== debouncedBusca) {
         setBuscaInput(filtros.busca);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [filtros.busca]);

   // Ressincroniza a tab quando a URL muda por fora (voltar/avançar).
   // setActiveTab dispara onActiveTabChange, mas o guard de handleTabChange
   // ignora a chamada quando a tab já corresponde à URL (sem loop).
   useEffect(() => {
      tabsRef.current?.setActiveTab(activeTab);
   }, [activeTab]);

   // Memoriza a URL atual da lista (tab/página/filtros) para os botões
   // "voltar" das telas de detalhe/clonagem/nova (ver utils/omListUrl)
   useEffect(() => {
      saveOmListUrl(window.location.pathname + window.location.search);
   }, [searchParams]);

   // Paginacao derivada da URL
   const pageAprovadas = tabParam === "aprovadas" ? currentPage : 1;
   const pageRascunho = tabParam === "rascunho" ? currentPage : 1;

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
      ...(filtros.busca && { busca: filtros.busca }),
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

   // ========================================
   // Handlers
   // ========================================

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
            pushToast({
               type: "error",
               title: "Erro",
               message: "Erro ao excluir a ordem. Tente novamente.",
            });
         },
      });
   };

   // Cancela exclusao
   const cancelDeleteOrdem = () => {
      setDeleteModalOpen(false);
      setOrdemToDelete(null);
   };

   // Filtros (exceto busca, que é debounced) vão direto para a URL
   const handleFiltrosChange = (novo: FiltrosOrdem) => {
      setBuscaInput(novo.busca);

      const nonBuscaChanged =
         novo.status !== filtros.status ||
         novo.dataInicio !== filtros.dataInicio ||
         novo.dataFim !== filtros.dataFim ||
         novo.etiquetas_ids !== filtros.etiquetas_ids;

      if (nonBuscaChanged) {
         setParams({
            status: serializeArray(novo.status),
            inicio: serializeString(novo.dataInicio, defaultDates.dataInicio),
            fim: serializeString(novo.dataFim, defaultDates.dataFim),
            etiquetas: serializeNumberArray(novo.etiquetas_ids),
            page: undefined,
         });
      }
   };

   const clearFiltros = () => {
      setBuscaInput("");
      setParams({
         busca: undefined,
         status: undefined,
         inicio: undefined,
         fim: undefined,
         etiquetas: undefined,
         page: undefined,
      });
   };

   // Troca de tab preserva todos os filtros (eles só se aplicam à tab Aprovadas)
   const handleTabChange = (tab: number) => {
      const key = TAB_KEY[tab] ?? "aprovadas";
      // Também dispara quando a ressincronização via ref chama setActiveTab:
      // se a tab já é a da URL, não há nada a atualizar
      if (key === tabParam) return;
      setParams({
         tab: key === "aprovadas" ? undefined : key,
         page: undefined,
      });
   };

   const handlePageChange = (page: number) => {
      setParams({ page: page === 1 ? undefined : String(page) });
      pageTopRef.current?.scrollIntoView({
         behavior: "smooth",
         block: "start",
      });
   };

   return (
      <div ref={pageTopRef} className="text-gray-900">
         <div className="mx-auto space-y-2">
            {/* Masthead — referência canônica (ver ops/operacoes) */}
            <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
               {/* Espinha vermelha — ecoa a espinha dos cards */}
               <span
                  aria-hidden
                  className="bg-primary-600 absolute top-0 left-0 h-full w-1"
               />

               <div className="relative flex flex-wrap items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-4">
                     <div className="bg-primary-50 text-primary-600 ring-primary-100 grid h-12 w-12 shrink-0 place-items-center rounded-md ring-1 ring-inset">
                        <HiOutlineClipboardList className="h-6 w-6" />
                     </div>
                     <div className="min-w-0">
                        <span className="text-primary-600 block font-mono text-[10px] font-bold tracking-[0.3em] uppercase">
                           Gestão Operacional
                        </span>
                        <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                           Ordens de Missão
                        </h1>
                     </div>
                  </div>

                  <PermBased resource={"ordem_missao"} requiredPerm={"create"}>
                     {/* Link real: prefetch do Next e abrir em nova aba */}
                     <Button
                        as={Link}
                        href="/ops/om/nova"
                        color="primary"
                        className="font-semibold whitespace-nowrap"
                     >
                        <HiPlus className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">
                           Nova Ordem de Missão
                        </span>
                        <span className="sm:hidden">Nova OM</span>
                     </Button>
                  </PermBased>
               </div>
            </header>

            {/* Erro global (qualquer uma das queries) com retry */}
            {(ordensAprovadasQuery.isError || ordensRascunhoQuery.isError) && (
               <div className="flex items-center justify-between gap-4 rounded border border-red-200 bg-red-50 p-4 text-red-700">
                  <span className="min-w-0 text-sm">
                     {ordensAprovadasQuery.error?.message ||
                        ordensRascunhoQuery.error?.message ||
                        "Erro ao carregar ordens"}
                  </span>
                  <Button
                     color="light"
                     size="sm"
                     className="shrink-0"
                     onClick={() => {
                        if (ordensAprovadasQuery.isError)
                           ordensAprovadasQuery.refetch();
                        if (ordensRascunhoQuery.isError)
                           ordensRascunhoQuery.refetch();
                     }}
                  >
                     Tentar novamente
                  </Button>
               </div>
            )}

            {/* Tabs não-controlado do Flowbite: ressincronização com a URL
                (voltar/avançar) via tabsRef.setActiveTab no effect acima —
                sem remontar filtros e listas a cada troca */}
            <Tabs
               ref={tabsRef}
               onActiveTabChange={handleTabChange}
               variant="underline"
               theme={tabsTheme}
            >
               <TabItem
                  active={activeTab === 0}
                  title={
                     <span className="flex items-center gap-2">
                        Aprovadas
                        <span className="bg-primary-100 text-primary-700 rounded-full px-2 py-0.5 text-xs font-medium">
                           {ordensAprovadasQuery.isLoading
                              ? "–"
                              : paginationAprovadas.total}
                        </span>
                     </span>
                  }
               >
                  <div className="space-y-2">
                     <FiltrosOrdemComponent
                        filtros={{ ...filtros, busca: buscaInput }}
                        onFiltrosChange={handleFiltrosChange}
                        onClearFiltros={clearFiltros}
                        defaultDates={defaultDates}
                     />
                     {!ordensAprovadasQuery.isError && (
                        <p className="text-sm text-gray-500">
                           {ordensAprovadasQuery.isLoading
                              ? "Carregando missões..."
                              : `${paginationAprovadas.total} ${
                                   paginationAprovadas.total === 1
                                      ? "missão encontrada"
                                      : "missões encontradas"
                                }`}
                        </p>
                     )}
                     {ordensAprovadasQuery.isError ? null : ordensAprovadasQuery.isLoading ? (
                        <ListaOrdensSkeleton />
                     ) : (
                        <div
                           className={clsx(
                              "transition-opacity",
                              ordensAprovadasQuery.isPlaceholderData &&
                                 "pointer-events-none opacity-50"
                           )}
                        >
                           <ListaOrdens
                              ordens={ordensAprovadas}
                              onCloneOrdem={handleCloneOrdem}
                              onDeleteOrdem={handleDeleteOrdem}
                              hasActiveFilters={hasActiveFilters}
                              onClearFiltros={clearFiltros}
                              onCreateOrdem={() => router.push("/ops/om/nova")}
                           />
                           {paginationAprovadas.pages > 1 && (
                              <div className="mt-4 flex justify-center">
                                 <Pagination
                                    currentPage={pageAprovadas}
                                    totalPages={paginationAprovadas.pages}
                                    onPageChange={handlePageChange}
                                    showIcons
                                    previousLabel="Anterior"
                                    nextLabel="Próxima"
                                 />
                              </div>
                           )}
                        </div>
                     )}
                  </div>
               </TabItem>
               <TabItem
                  active={activeTab === 1}
                  title={
                     <span className="flex items-center gap-2">
                        Rascunhos
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                           {ordensRascunhoQuery.isLoading
                              ? "–"
                              : paginationRascunho.total}
                        </span>
                     </span>
                  }
               >
                  <div className="space-y-2">
                     {!ordensRascunhoQuery.isError && (
                        <p className="text-sm text-gray-500">
                           {ordensRascunhoQuery.isLoading
                              ? "Carregando rascunhos..."
                              : `${paginationRascunho.total} ${
                                   paginationRascunho.total === 1
                                      ? "rascunho encontrado"
                                      : "rascunhos encontrados"
                                }`}
                        </p>
                     )}
                     {ordensRascunhoQuery.isError ? null : ordensRascunhoQuery.isLoading ? (
                        <ListaOrdensSkeleton />
                     ) : (
                        <div
                           className={clsx(
                              "transition-opacity",
                              ordensRascunhoQuery.isPlaceholderData &&
                                 "pointer-events-none opacity-50"
                           )}
                        >
                           <ListaOrdens
                              ordens={ordensRascunho}
                              onCloneOrdem={handleCloneOrdem}
                              onDeleteOrdem={handleDeleteOrdem}
                              emptyTitle="Nenhum rascunho encontrado"
                              onCreateOrdem={() => router.push("/ops/om/nova")}
                           />
                           {paginationRascunho.pages > 1 && (
                              <div className="mt-4 flex justify-center">
                                 <Pagination
                                    currentPage={pageRascunho}
                                    totalPages={paginationRascunho.pages}
                                    onPageChange={handlePageChange}
                                    showIcons
                                    previousLabel="Anterior"
                                    nextLabel="Próxima"
                                 />
                              </div>
                           )}
                        </div>
                     )}
                  </div>
               </TabItem>
            </Tabs>
         </div>

         {/* Modal de exclusao */}
         <DeleteOrdemModal
            isOpen={deleteModalOpen}
            ordemNumero={ordemToDelete?.numero || ""}
            ordemUae={activeOrg ?? ""}
            ordemDataSaida={ordemToDelete?.data_saida || ""}
            ordemStatus={ordemToDelete?.status}
            onConfirm={confirmDeleteOrdem}
            onCancel={cancelDeleteOrdem}
            isDeleting={deleteOrdemMutation.isPending}
         />
      </div>
   );
}
