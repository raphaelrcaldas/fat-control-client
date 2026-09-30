"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

import { formatDateFull, formatTime } from "@/../utils/dateHandler";
import { useUnsavedChangesGuard } from "@/app/(home)/estatistica/etapas/missao/hooks/useUnsavedChangesGuard";
import { useToast } from "@/app/context/toast";
import {
   useDeleteEtapa,
   useDeleteMissaoComEtapas,
} from "@/hooks/queries/useEtapas";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import type { MissaoComEtapasDetail } from "services/routes/estatistica/etapas";
import { useSimuladorMissaoDraft } from "../hooks/useSimuladorMissaoDraft";
import { formatPilotNames, sortPilotos } from "../../helpers/sessoes";
import { SimuladorEditorHeader } from "./SimuladorEditorHeader";
import { SimuladorEditorLayout } from "./SimuladorEditorLayout";
import { SimuladorMissaoSidebar } from "./SimuladorMissaoSidebar";
import {
   SIDEBAR_DRAWER_ID,
   SimuladorSidebarDrawer,
} from "./SimuladorSidebarDrawer";
import { SESSAO_FORM_ID, SimuladorSessaoForm } from "./SimuladorSessaoForm";

interface SimuladorMissaoEditorProps {
   missao: MissaoComEtapasDetail;
   initialEtapaId?: number;
   canCreate: boolean;
   canDelete: boolean;
   isFetching: boolean;
}

export function SimuladorMissaoEditor({
   missao,
   initialEtapaId,
   canCreate,
   canDelete,
   isFetching,
}: SimuladorMissaoEditorProps) {
   const router = useRouter();
   const { push } = useToast();
   const deleteEtapa = useDeleteEtapa();
   const deleteMissao = useDeleteMissaoComEtapas();
   const deletingRef = useRef(false);
   const deletedRef = useRef(false);
   const contentRef = useRef<HTMLDivElement>(null);
   const sidebarTriggerRef = useRef<HTMLButtonElement>(null);
   const [sidebarOpen, setSidebarOpen] = useState(false);
   const [confirmDelete, setConfirmDelete] = useState(false);
   const [confirmDeleteMissao, setConfirmDeleteMissao] = useState(false);
   const editor = useSimuladorMissaoDraft(missao, initialEtapaId);
   const { draft, selected, form, dirty, isSaving } = editor;
   // Só para o TEXTO do aviso: quem decide se a missão foi removida é a
   // resposta do DELETE (`missao_removida`), porque esta contagem pode estar
   // defasada (outra pessoa criou ou excluiu sessões).
   const isUltimaEtapa =
      selected?.serverId != null && draft.initialEtapaServerIds.length === 1;
   const isBusy =
      isSaving ||
      deleteEtapa.isPending ||
      deleteMissao.isPending ||
      deletedRef.current;
   const pilotsById = new Map(
      draft.etapas.flatMap((e) =>
         e.assignedTrips.map(
            (p) =>
               [
                  p.tripId,
                  {
                     trip_id: p.tripId,
                     p_g: p.pGraduacao,
                     nome_guerra: p.nomeGuerra,
                     ant: p.ant,
                     ult_promo: p.ult_promo,
                     ant_rel: p.ant_rel,
                  },
               ] as const
         )
      )
   );
   const pilotNames = formatPilotNames(
      sortPilotos([...pilotsById.values()])
   ).toUpperCase();
   const hasUnsavedChanges = dirty;

   const selectEtapa = (localId: string) => {
      if (isBusy || deletingRef.current) return;
      editor.select(localId);
      setSidebarOpen(false);
      contentRef.current?.scrollTo({ top: 0 });
      const serverId = draft.etapas.find(
         (e) => e.localId === localId
      )?.serverId;
      router.replace(
         `/instrucao/simulador/missao/${missao.id}${serverId ? `?etapa=${serverId}` : ""}`,
         { scroll: false }
      );
   };
   const addEtapa = () => {
      if (!canCreate || isBusy || deletingRef.current) return;
      editor.add();
      setSidebarOpen(false);
      contentRef.current?.scrollTo({ top: 0 });
      router.replace(`/instrucao/simulador/missao/${missao.id}`, {
         scroll: false,
      });
   };
   // A resposta do PUT já confirma os IDs e limpa os baselines; a invalidação
   // da mutation faz o refetch, reconciliado quando chega como nova `missao`.
   const handleSave = async () => {
      if (isBusy || deletingRef.current) return;
      await editor.save();
   };
   const handleDelete = async () => {
      if (!selected || isBusy || deletingRef.current) return;
      if (selected.serverId === null) {
         editor.remove(selected.localId);
         setConfirmDelete(false);
         return;
      }
      try {
         deletingRef.current = true;
         const result = await deleteEtapa.mutateAsync({
            id: selected.serverId,
            missaoId: missao.id,
         });
         setConfirmDelete(false);
         // 404: outra pessoa já excluiu a sessão. O efeito é o pedido, então
         // sai do rascunho como qualquer exclusão persistida.
         const gone = result.ok || result.notFound;
         push({
            title: gone ? "Sucesso!" : "Erro",
            message: result.ok
               ? (result.message ?? "Sessão excluída")
               : result.notFound
                 ? "A sessão já havia sido excluída por outro usuário"
                 : (result.message ?? "Erro ao excluir sessão"),
            type: gone ? "success" : "error",
         });
         if (!gone) return;
         if (result.data?.missao_removida) {
            // Trava o editor até a navegação: um Salvar nessa janela mandaria
            // PUT contra missão apagada e o guard de alterações não salvas
            // pediria confirmação para sair de algo que não existe mais.
            deletedRef.current = true;
            setSidebarOpen(false);
            router.push("/instrucao/simulador");
            return;
         }
         editor.remove(selected.localId, true);
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
      } finally {
         if (!deletedRef.current) deletingRef.current = false;
      }
   };

   const handleDeleteMissao = async () => {
      if (!canDelete || isBusy || deletingRef.current) return;
      deletingRef.current = true;
      try {
         const result = await deleteMissao.mutateAsync(missao.id);
         push({
            title: result.ok ? "Sucesso!" : "Erro",
            message:
               result.message ??
               (result.ok
                  ? "Missão e sessões excluídas"
                  : "Erro ao excluir missão"),
            type: result.ok ? "success" : "error",
         });
         setConfirmDeleteMissao(false);
         if (result.ok) {
            deletedRef.current = true;
            setSidebarOpen(false);
            router.push("/instrucao/simulador");
         }
      } catch (error) {
         setConfirmDeleteMissao(false);
         push({
            title: "Erro",
            message:
               error instanceof Error
                  ? error.message
                  : "Erro ao excluir missão",
            type: "error",
         });
      } finally {
         if (!deletedRef.current) deletingRef.current = false;
      }
   };

   // Cobre fechar aba / recarregar e clique em link interno (drawer, etc).
   // "Voltar para o simulador" e um <button>, entao o clique nele nao passa
   // pelo intercept de <a> do guard — a confirmacao roda no proprio onBack.
   useUnsavedChangesGuard({
      enabled: hasUnsavedChanges && !deletedRef.current,
   });

   const handleBack = useCallback(() => {
      if (
         hasUnsavedChanges &&
         !window.confirm("Há mudanças não salvas. Sair mesmo assim?")
      ) {
         return;
      }
      router.push("/instrucao/simulador");
   }, [hasUnsavedChanges, router]);

   const headerTitle = selected
      ? `${selected.form.origem || "----"} → ${selected.form.destino || "----"}`
      : "Missão de simulador";
   const headerSubtitle = selected?.form.data
      ? `${formatDateFull(selected.form.data)} · ${formatTime(selected.form.dep)}–${formatTime(selected.form.arr)}`
      : "Preencha os dados da sessão";
   const canRenderForm = selected !== null;
   const renderSidebar = () => (
      <SimuladorMissaoSidebar
         pilotNames={pilotNames}
         etapas={draft.etapas}
         selectedLocalId={draft.selectedLocalId}
         obs={draft.obs ?? ""}
         canCreate={canCreate}
         disabled={isBusy}
         onObsChange={editor.setObs}
         onSelectEtapa={selectEtapa}
         onAddEtapa={addEtapa}
         onDeleteMissao={
            canDelete ? () => setConfirmDeleteMissao(true) : undefined
         }
      />
   );

   return (
      <>
         <div
            className={clsx("transition-opacity", isFetching && "opacity-50")}
         >
            <SimuladorEditorLayout
               contentRef={contentRef}
               sidebar={renderSidebar()}
               header={
                  <SimuladorEditorHeader
                     title={headerTitle}
                     subtitle={headerSubtitle}
                     formId={canRenderForm ? SESSAO_FORM_ID : undefined}
                     canDelete={
                        selected !== null &&
                        (selected.serverId === null ? canCreate : canDelete)
                     }
                     canSave={editor.canSave}
                     blockedReason={editor.blockedReason}
                     isSaving={isBusy}
                     saveLabel="Salvar alterações"
                     onSave={handleSave}
                     onBack={handleBack}
                     onOpenSidebar={() => setSidebarOpen(true)}
                     sidebarTriggerRef={sidebarTriggerRef}
                     sidebarOpen={sidebarOpen}
                     sidebarId={SIDEBAR_DRAWER_ID}
                     onDelete={
                        selected ? () => setConfirmDelete(true) : undefined
                     }
                  />
               }
               content={
                  canRenderForm ? (
                     <SimuladorSessaoForm
                        key={`${selected!.localId}-${editor.formVersion}`}
                        form={form!}
                        disabled={isBusy}
                        preFilled={
                           selected!.serverId === null &&
                           draft.etapas.length > 1
                        }
                        onSubmit={(event) => {
                           event.preventDefault();
                           void handleSave();
                        }}
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

         <SimuladorSidebarDrawer
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            returnFocusRef={sidebarTriggerRef}
         >
            {renderSidebar()}
         </SimuladorSidebarDrawer>

         <ConfirmModal
            show={confirmDeleteMissao}
            title="Excluir missão?"
            description={
               <div className="space-y-2">
                  <p>
                     A missão e todas as suas sessões serão excluídas. Esta ação
                     não pode ser desfeita.
                  </p>
                  {hasUnsavedChanges && (
                     <p className="font-medium text-red-600 dark:text-red-400">
                        As alterações e os rascunhos ainda não salvos serão
                        perdidos.
                     </p>
                  )}
               </div>
            }
            confirmButtonText="Excluir missão"
            isLoading={deleteMissao.isPending}
            onClose={() => setConfirmDeleteMissao(false)}
            onConfirm={handleDeleteMissao}
         />

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
                  {isUltimaEtapa && hasUnsavedChanges && (
                     <p className="font-medium text-red-600 dark:text-red-400">
                        As alterações e os rascunhos ainda não salvos serão
                        perdidos.
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
