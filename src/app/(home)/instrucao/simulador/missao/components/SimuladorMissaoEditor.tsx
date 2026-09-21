"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Drawer } from "flowbite-react";
import { HiMenuAlt2, HiX } from "react-icons/hi";

import { formatDateFull, formatTime, todayIso } from "@/../utils/dateHandler";
import { useUnsavedChangesGuard } from "@/app/(home)/estatistica/etapas/missao/hooks/useUnsavedChangesGuard";
import { useToast } from "@/app/context/toast";
import { useDeleteEtapa } from "@/hooks/queries/useEtapas";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import type { MissaoComEtapasDetail } from "services/routes/estatistica/etapas";
import {
   anoDominante,
   collectPilotos,
   formatPilotNames,
   sortEtapas,
} from "../../helpers/sessoes";
import { useMissaoObs } from "../hooks/useMissaoObs";
import {
   EMPTY_SESSAO_FORM_STATE,
   type SessaoFormState,
} from "../../helpers/sessaoDraft";
import { SimuladorEditorHeader } from "./SimuladorEditorHeader";
import { SimuladorEditorLayout } from "./SimuladorEditorLayout";
import { SimuladorMissaoSidebar } from "./SimuladorMissaoSidebar";
import { SESSAO_FORM_ID, SimuladorSessaoForm } from "./SimuladorSessaoForm";

interface SimuladorMissaoEditorProps {
   missao: MissaoComEtapasDetail;
   initialEtapaId?: number;
   canCreate: boolean;
   canDelete: boolean;
   isFetching: boolean;
   onRefetch: () => Promise<MissaoComEtapasDetail | undefined>;
}

export function SimuladorMissaoEditor({
   missao,
   initialEtapaId,
   canCreate,
   canDelete,
   isFetching,
   onRefetch,
}: SimuladorMissaoEditorProps) {
   const router = useRouter();
   const { push } = useToast();
   const deleteEtapa = useDeleteEtapa();
   const contentRef = useRef<HTMLDivElement>(null);
   const drawerCloseRef = useRef<HTMLButtonElement>(null);
   const creatingRef = useRef(false);
   const selectionVersionRef = useRef(0);
   const [draftInstance, setDraftInstance] = useState(0);
   const [promotedEtapaId, setPromotedEtapaId] = useState<number | null>(null);
   const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
   const [sidebarOpen, setSidebarOpen] = useState(false);
   const [confirmDelete, setConfirmDelete] = useState(false);
   const [formState, setFormState] = useState(EMPTY_SESSAO_FORM_STATE);
   const [selectedEtapaId, setSelectedEtapaId] = useState<number | null>(() => {
      if (
         initialEtapaId &&
         missao.etapas.some((etapa) => etapa.id === initialEtapaId)
      ) {
         return initialEtapaId;
      }
      return sortEtapas(missao.etapas)[0]?.id ?? null;
   });

   const etapas = useMemo(() => sortEtapas(missao.etapas), [missao.etapas]);
   const pilotos = useMemo(() => collectPilotos(etapas), [etapas]);
   const pilotNames = formatPilotNames(pilotos).toUpperCase();
   const selectedEtapa =
      etapas.find((etapa) => etapa.id === selectedEtapaId) ?? null;
   const selectedIndex = selectedEtapa
      ? etapas.findIndex((etapa) => etapa.id === selectedEtapa.id)
      : -1;
   const ultimaEtapa = etapas.at(-1) ?? null;
   // O backend apaga a missao junto com a sua ultima sessao: a confirmacao
   // precisa dizer isso, e nao prometer que so a sessao some.
   const isUltimaEtapa = etapas.length === 1;
   const anoDominanteMissao = useMemo(() => anoDominante(etapas), [etapas]);
   // Fallback unico: sidebar e SimuladorSessaoForm usavam cada um o seu
   // (`new Date().getFullYear()` aqui, `ultimaEtapa?.data ?? todayIso()` no
   // form), podendo divergir. Resolvendo aqui e passando pronto para os dois.
   // O fallback e o ano corrente (`todayIso()`), nunca a data da ultima etapa:
   // essa pode ser a propria etapa com o ano errado que `anoDominante` acabou
   // de descartar, e usa-la aqui autoaprovaria o erro de novo.
   const anoMissao = useMemo(
      () => anoDominanteMissao ?? Number(todayIso().slice(0, 4)),
      [anoDominanteMissao]
   );
   const missaoObs = useMissaoObs({
      missaoId: missao.id,
      serverObs: missao.obs,
   });

   const selectEtapa = useCallback(
      (etapaId: number | null, preserveForm = false) => {
         const restartSavedDraft =
            !preserveForm && etapaId === null && promotedEtapaId !== null;
         creatingRef.current = etapaId === null;
         setSelectedEtapaId(etapaId);
         // Selecionar a mesma sessão (inclusive após salvar) não remonta o
         // formulário: apagar seu estado aqui deixava o botão travado.
         if (etapaId !== selectedEtapaId || restartSavedDraft) {
            selectionVersionRef.current += 1;
            if (preserveForm) {
               // A sessão criada ganha seu ID na sidebar e na URL, mas mantém
               // a instância do formulário com a edição posterior ao POST.
               if (selectedEtapaId === null) setPromotedEtapaId(etapaId);
            } else {
               setPromotedEtapaId(null);
               if (etapaId === null) setDraftInstance((value) => value + 1);
               setFormState(EMPTY_SESSAO_FORM_STATE);
            }
         }
         setSidebarOpen(false);
         contentRef.current?.scrollTo({ top: 0 });
         const query = etapaId == null ? "" : `?etapa=${etapaId}`;
         router.replace(`/instrucao/simulador/missao/${missao.id}${query}`, {
            scroll: false,
         });
      },
      [missao.id, router, selectedEtapaId, promotedEtapaId]
   );

   useEffect(() => {
      setPortalTarget(document.body);
   }, []);

   useEffect(() => {
      if (sidebarOpen) drawerCloseRef.current?.focus();
   }, [sidebarOpen]);

   useEffect(() => {
      if (creatingRef.current) return;
      const requestedEtapa = initialEtapaId
         ? etapas.find((etapa) => etapa.id === initialEtapaId)
         : null;
      if (requestedEtapa) {
         setSelectedEtapaId(requestedEtapa.id);
         return;
      }
      setSelectedEtapaId((current) => {
         if (current === null && initialEtapaId === undefined) {
            return etapas[0]?.id ?? null;
         }
         return etapas.some((etapa) => etapa.id === current)
            ? current
            : (etapas[0]?.id ?? null);
      });
   }, [etapas, initialEtapaId]);

   useEffect(() => {
      // A criação já confirmou o ID, mas sua recarga pode falhar. Uma nova
      // tentativa (ou invalidação automática) promove a seleção assim que o
      // registro chega, sem depender da promessa da primeira recarga.
      if (
         selectedEtapaId === null &&
         promotedEtapaId !== null &&
         etapas.some((etapa) => etapa.id === promotedEtapaId)
      ) {
         selectEtapa(promotedEtapaId, true);
      }
   }, [etapas, promotedEtapaId, selectedEtapaId, selectEtapa]);

   const handleFormStateChange = useCallback((state: SessaoFormState) => {
      setFormState(state);
   }, []);

   const handleSaved = useCallback(
      async (etapaId: number) => {
         const selectionVersion = selectionVersionRef.current;
         if (selectedEtapaId === null) setPromotedEtapaId(etapaId);
         // A observacao sobe ANTES do refetch: invertido, o refetch traria a
         // obs antiga do servidor e descartaria o que o usuario digitou.
         await missaoObs.flush();
         const refreshed = await onRefetch();
         // O refetch pode terminar depois de o usuário abrir outra sessão.
         // Não volte à anterior desmontando o formulário que ele está editando.
         if (
            selectionVersionRef.current === selectionVersion &&
            refreshed?.etapas.some((etapa) => etapa.id === etapaId)
         ) {
            selectEtapa(etapaId, true);
         }
      },
      // So `flush` (e nao o objeto `missaoObs`) nas deps: `missaoObs` e um
      // literal novo a cada render (useMissaoObs nao o memoiza), o que
      // invalidaria handleSaved a cada tecla digitada na observacao.
      [missaoObs.flush, onRefetch, selectEtapa, selectedEtapaId]
   );

   const handleDelete = useCallback(async () => {
      if (!selectedEtapa) return;
      const selectionVersion = selectionVersionRef.current;
      const fallbackId =
         etapas[selectedIndex + 1]?.id ?? etapas[selectedIndex - 1]?.id ?? null;

      try {
         const result = await deleteEtapa.mutateAsync(selectedEtapa.id);
         push({
            title: result.ok ? "Sucesso!" : "Erro",
            message: result.message ?? "Sessão excluída",
            type: result.ok ? "success" : "error",
         });
         setConfirmDelete(false);
         if (result.ok) {
            // O backend remove a missão junto com sua última sessão. Não há
            // recurso para recarregar nessa rota, e invalidar a mutation já
            // pode ter iniciado um GET; sair imediatamente evita insistir nela.
            if (isUltimaEtapa) {
               router.push("/instrucao/simulador");
               return;
            }
            await onRefetch();
            // Uma seleção feita enquanto a exclusão aguardava o refetch é a
            // intenção mais recente; o fallback só vale se ela não mudou.
            if (selectionVersionRef.current === selectionVersion) {
               selectEtapa(fallbackId);
            }
         }
      } catch (error) {
         setConfirmDelete(false);
         push({
            title: "Erro",
            message:
               error instanceof Error
                  ? error.message
                  : "Erro ao excluir sessão",
            type: "error",
         });
      }
   }, [
      deleteEtapa,
      etapas,
      isUltimaEtapa,
      onRefetch,
      push,
      router,
      selectEtapa,
      selectedEtapa,
      selectedIndex,
   ]);

   // Observacao suja com a sessao intocada: o submit do form nao dispara, entao
   // o botao do cabecalho passa a salvar so a observacao.
   const obsOnly = missaoObs.isDirty && !formState.isDirty;
   const handleSaveObsOnly = useCallback(async () => {
      if (await missaoObs.flush()) {
         push({
            title: "Sucesso!",
            message: "Observação da missão atualizada",
            type: "success",
         });
         await onRefetch();
      }
   }, [missaoObs, onRefetch, push]);

   const hasUnsavedChanges = missaoObs.isDirty || formState.isDirty;

   const requestSelectEtapa = useCallback(
      (etapaId: number | null) => {
         if (formState.isPending) return;
         if (
            (etapaId !== selectedEtapaId ||
               (etapaId === null && promotedEtapaId !== null)) &&
            formState.isDirty &&
            !window.confirm(
               "Há mudanças não salvas nesta sessão. Descartar e trocar de sessão?"
            )
         )
            return;
         selectEtapa(etapaId);
      },
      [
         formState.isDirty,
         formState.isPending,
         selectedEtapaId,
         promotedEtapaId,
         selectEtapa,
      ]
   );

   // Cobre fechar aba / recarregar e clique em link interno (drawer, etc).
   // "Voltar para o simulador" e um <button>, entao o clique nele nao passa
   // pelo intercept de <a> do guard — a confirmacao roda no proprio onBack.
   useUnsavedChangesGuard({ enabled: hasUnsavedChanges });

   const handleBack = useCallback(() => {
      if (
         hasUnsavedChanges &&
         !window.confirm("Há mudanças não salvas. Sair mesmo assim?")
      ) {
         return;
      }
      router.push("/instrucao/simulador");
   }, [hasUnsavedChanges, router]);

   const headerTitle = selectedEtapa
      ? `${selectedEtapa.origem} → ${selectedEtapa.destino}`
      : "Nova sessão";
   const headerSubtitle = selectedEtapa
      ? `${formatDateFull(selectedEtapa.data)} · ${formatTime(selectedEtapa.dep)}–${formatTime(selectedEtapa.arr)}`
      : "Preencha os dados da sessão";
   const canRenderForm = selectedEtapa !== null || canCreate;

   const renderSidebar = (obsId: string) => (
      <SimuladorMissaoSidebar
         obsId={obsId}
         pilotNames={pilotNames}
         anoRef={anoMissao}
         etapas={etapas}
         selectedEtapaId={selectedEtapaId}
         formState={formState}
         obs={missaoObs.obs}
         obsDirty={missaoObs.isDirty}
         canCreate={canCreate}
         onObsChange={missaoObs.setObs}
         onSelectEtapa={requestSelectEtapa}
         onAddEtapa={() => requestSelectEtapa(null)}
      />
   );

   return (
      <>
         <div
            className={clsx("transition-opacity", isFetching && "opacity-50")}
         >
            <SimuladorEditorLayout
               contentRef={contentRef}
               sidebar={renderSidebar("simulador-missao-obs-desktop")}
               header={
                  <SimuladorEditorHeader
                     title={headerTitle}
                     subtitle={headerSubtitle}
                     formId={canRenderForm ? SESSAO_FORM_ID : undefined}
                     canDelete={canDelete && selectedEtapa !== null}
                     canSave={canRenderForm && formState.canSubmit}
                     isSaving={
                        deleteEtapa.isPending ||
                        formState.isPending ||
                        missaoObs.isSaving
                     }
                     onSaveObsOnly={obsOnly ? handleSaveObsOnly : undefined}
                     onBack={handleBack}
                     onOpenSidebar={() => setSidebarOpen(true)}
                     onDelete={
                        selectedEtapa ? () => setConfirmDelete(true) : undefined
                     }
                  />
               }
               content={
                  canRenderForm ? (
                     <SimuladorSessaoForm
                        key={
                           !selectedEtapa ||
                           selectedEtapa.id === promotedEtapaId
                              ? `draft-${draftInstance}`
                              : selectedEtapa.id
                        }
                        missaoId={missao.id}
                        pilotos={pilotos}
                        editEtapa={selectedEtapa}
                        ultimaEtapa={ultimaEtapa}
                        anoMissao={anoMissao}
                        onSaved={handleSaved}
                        onFormStateChange={handleFormStateChange}
                     />
                  ) : (
                     <div className="rounded border border-slate-200 bg-white px-4 py-10 text-center shadow-sm">
                        <h2 className="text-base font-semibold text-slate-800">
                           Nenhuma sessão cadastrada
                        </h2>
                        <p className="pt-1 text-sm text-slate-500">
                           Você não tem permissão para criar uma nova sessão.
                        </p>
                     </div>
                  )
               }
            />
         </div>

         {portalTarget &&
            createPortal(
               <Drawer
                  open={sidebarOpen}
                  onClose={() => setSidebarOpen(false)}
                  position="left"
                  aria-label="Sessões da missão"
                  className="top-16 flex h-[calc(100dvh-4rem)] w-80 flex-col overflow-hidden p-0 lg:hidden"
               >
                  {/* Header proprio em vez do DrawerHeader do Flowbite: o dele
                      e um <h5> fixo, que quebra a ordem de headings (h2 → h5) */}
                  <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-200 px-4 py-2">
                     <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <HiMenuAlt2 aria-hidden className="h-4 w-4" />
                        Sessões da missão
                     </h2>
                     <button
                        ref={drawerCloseRef}
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Fechar painel de sessões"
                        className="focus-visible:outline-primary-500 grid size-9 shrink-0 place-items-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2"
                     >
                        <HiX className="h-5 w-5" />
                     </button>
                  </div>
                  {sidebarOpen && (
                     <div className="min-h-0 flex-1">
                        {renderSidebar("simulador-missao-obs-drawer")}
                     </div>
                  )}
               </Drawer>,
               portalTarget
            )}

         <ConfirmModal
            show={confirmDelete}
            title={isUltimaEtapa ? "Excluir a dupla?" : "Excluir sessão?"}
            description={
               <div className="space-y-2">
                  <p>
                     {isUltimaEtapa
                        ? "Esta é a última sessão: excluí-la apaga a dupla inteira."
                        : "Esta ação não pode ser desfeita."}
                  </p>
                  {isUltimaEtapa && missaoObs.isDirty && (
                     <p className="font-medium text-red-600 dark:text-red-400">
                        A observação digitada ainda não foi salva e será
                        perdida.
                     </p>
                  )}
               </div>
            }
            confirmButtonText={
               isUltimaEtapa ? "Excluir a dupla" : "Excluir sessão"
            }
            isLoading={deleteEtapa.isPending}
            onClose={() => setConfirmDelete(false)}
            onConfirm={handleDelete}
         />
      </>
   );
}
