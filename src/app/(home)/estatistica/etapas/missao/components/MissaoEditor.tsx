"use client";

import { useEffect, useMemo, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Drawer } from "flowbite-react";

import {
   useMissaoDraft,
   useMissaoDraftDispatch,
} from "../context/MissaoDraftContext";
import { isDirty, selectEtapaTotals } from "../context/helpers";
import { useToast } from "@/app/context/toast";
import { usePermBased } from "@/app/(home)/hooks/usePermBased";
import { formatDateFull } from "@/../utils/dateHandler";

import { etapaKeys } from "@/hooks/queries/useEtapas";
import { deleteMissaoComEtapas } from "services/routes/estatistica/etapas";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useSaveMissaoDraft } from "../hooks/useSaveMissaoDraft";
import { useUpdateMissaoDraft } from "../hooks/useUpdateMissaoDraft";
import { useUnsavedChangesGuard } from "../hooks/useUnsavedChangesGuard";
import { MissaoEditorLayout } from "./MissaoEditorLayout";
import { MissaoHeader } from "./MissaoHeader";
import { MissaoSidebar, type SidebarEtapa } from "./MissaoSidebar";
import { EmptyEtapaPlaceholder } from "./EmptyEtapaPlaceholder";
import { EtapaContent } from "./EtapaContent";
import { EtapaStatusBadge } from "./EtapaStatusBadge";

interface MissaoEditorProps {
   mode: "new" | "edit";
}

type ConfirmDialog =
   | { kind: "cancel" }
   | { kind: "revert" }
   | { kind: "removeEtapa"; localId: string }
   | { kind: "deleteMissao" };

export function MissaoEditor({ mode }: MissaoEditorProps) {
   const draft = useMissaoDraft();
   const dispatch = useMissaoDraftDispatch();
   const router = useRouter();
   const { push } = useToast();

   const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog | null>(
      null
   );
   // Drawer da sidebar nas telas < lg (no desktop a sidebar é fixa)
   const [sidebarOpen, setSidebarOpen] = useState(false);

   const { hasPerm } = usePermBased();
   const canSave = hasPerm("etp_mis", "create");

   const saveMutation = useSaveMissaoDraft();
   const updateMutation = useUpdateMissaoDraft();

   const queryClient = useQueryClient();
   const deleteMissaoMutation = useMutation({
      mutationFn: () => deleteMissaoComEtapas(draft.serverId!),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: etapaKeys.all });
         router.push("/estatistica/etapas");
      },
      onError: (err: Error) => {
         push({
            type: "error",
            title: "Erro ao excluir",
            message: err.message ?? "Falha ao excluir missão",
         });
      },
   });

   const dirty = isDirty(draft);

   useUnsavedChangesGuard({
      enabled: dirty && !saveMutation.isPending && !updateMutation.isPending,
   });

   const missaoLabel =
      mode === "new"
         ? "Nova Missão"
         : (draft.titulo ??
           (draft.serverId != null ? `Missão #${draft.serverId}` : "Missão"));

   const selectedEtapa =
      draft.selectedLocalId != null
         ? draft.etapas.find((e) => e.localId === draft.selectedLocalId)
         : null;

   const sidebarEtapas: SidebarEtapa[] = useMemo(
      () =>
         draft.etapas.map((e, idx) => {
            const etapaTotals = selectEtapaTotals(e);
            return {
               localId: e.localId,
               numero: String(idx + 1).padStart(2, "0"),
               data: e.form.data,
               origem: e.form.origem || "----",
               destino: e.form.destino || "----",
               anv: e.form.anv,
               depHora: e.form.dep || "--:--",
               arrHora: e.form.arr || "--:--",
               tvooMin: etapaTotals.tvoo,
               status: e.status,
               selected: e.localId === draft.selectedLocalId,
               isModified: e.dirty && e.serverId !== null,
               isNew: mode === "edit" && e.serverId === null,
            };
         }),
      [draft.etapas, draft.selectedLocalId, mode]
   );

   function handleCancel() {
      if (dirty) {
         setConfirmDialog({ kind: "cancel" });
         return;
      }
      router.back();
   }

   function handleSave() {
      if (!canSave) {
         push({
            title: "Sem permissão",
            message: "Você não tem permissão para salvar missões.",
            type: "warning",
         });
         return;
      }
      if (draft.etapas.length === 0) {
         push({
            title: "Erro",
            message: "A missão precisa ter pelo menos 1 etapa.",
            type: "error",
         });
         return;
      }
      if (mode === "edit") {
         updateMutation.mutate(draft, {
            onSuccess: () => {
               dispatch({ type: "RECOMPUTE_SNAPSHOT" });
               router.push("/estatistica/etapas");
            },
         });
         return;
      }
      saveMutation.mutate(draft, {
         onSuccess: () => {
            dispatch({ type: "RECOMPUTE_SNAPSHOT" });
            router.push("/estatistica/etapas");
         },
      });
   }

   // Fechar o drawer junto é inócuo no desktop e necessário no mobile,
   // onde a sidebar cobre o conteúdo recém-selecionado
   const handleAddEtapa = useCallback(() => {
      dispatch({ type: "ADD_ETAPA" });
      setSidebarOpen(false);
   }, [dispatch]);

   const handleSelectEtapa = useCallback(
      (localId: string) => {
         dispatch({ type: "SELECT_ETAPA", payload: { localId } });
         setSidebarOpen(false);
      },
      [dispatch]
   );

   const handleRemoveEtapa = useCallback(
      (localId: string) => {
         if (draft.etapas.length <= 1) {
            push({
               type: "warning",
               title: "Atenção",
               message: "Missão precisa ter pelo menos 1 etapa",
            });
            return;
         }
         setConfirmDialog({ kind: "removeEtapa", localId });
      },
      [draft.etapas.length, push]
   );

   const handleDeleteMissao = useCallback(() => {
      setSidebarOpen(false);
      setConfirmDialog({ kind: "deleteMissao" });
   }, []);

   const handleRevert = useCallback(() => {
      setConfirmDialog({ kind: "revert" });
   }, []);

   const handleConfirmDialog = useCallback(() => {
      if (!confirmDialog) return;
      if (confirmDialog.kind === "cancel") {
         setConfirmDialog(null);
         router.back();
         return;
      }
      if (confirmDialog.kind === "revert") {
         dispatch({ type: "REVERT_DRAFT" });
         setConfirmDialog(null);
         return;
      }
      if (confirmDialog.kind === "removeEtapa") {
         dispatch({
            type: "REMOVE_ETAPA",
            payload: { localId: confirmDialog.localId },
         });
         setConfirmDialog(null);
         return;
      }
      if (confirmDialog.kind === "deleteMissao") {
         deleteMissaoMutation.mutate(undefined, {
            onSettled: () => setConfirmDialog(null),
         });
      }
   }, [confirmDialog, dispatch, router, deleteMissaoMutation]);

   const closeConfirmDialog = useCallback(() => {
      if (deleteMissaoMutation.isPending) return;
      setConfirmDialog(null);
   }, [deleteMissaoMutation.isPending]);

   const confirmDialogConfig = useMemo(() => {
      if (!confirmDialog) return null;
      if (confirmDialog.kind === "cancel") {
         return {
            title: "Sair sem salvar?",
            message: (
               <>
                  <p>Há mudanças não salvas nesta missão.</p>
                  <p className="mt-1 text-sm font-medium text-red-600">
                     Se sair agora, todas as alterações serão perdidas.
                  </p>
               </>
            ),
            confirmLabel: "Sair sem salvar",
         };
      }
      if (confirmDialog.kind === "revert") {
         return {
            title: "Desfazer alterações?",
            message: (
               <>
                  <p>
                     Todas as alterações feitas desde a última carga serão
                     descartadas.
                  </p>
                  <p className="mt-1 text-sm font-medium text-red-600">
                     Esta ação não pode ser desfeita.
                  </p>
               </>
            ),
            confirmLabel: "Desfazer",
         };
      }
      if (confirmDialog.kind === "removeEtapa") {
         return {
            title: "Remover etapa?",
            message: (
               <>
                  <p>Esta etapa será removida da missão.</p>
                  <p className="mt-1 text-sm font-medium text-red-600">
                     Esta ação não pode ser desfeita.
                  </p>
               </>
            ),
            confirmLabel: "Remover",
         };
      }
      return {
         title: "Excluir missão?",
         message: (
            <>
               <p>A missão e TODAS as suas etapas serão excluídas.</p>
               <p className="mt-1 text-sm font-medium text-red-600">
                  Esta ação não pode ser desfeita.
               </p>
            </>
         ),
         confirmLabel: "Excluir",
      };
   }, [confirmDialog]);

   const handleTituloChange = useCallback(
      (value: string) => {
         dispatch({
            type: "SET_MISSAO_FIELD",
            payload: { field: "titulo", value: value || null },
         });
      },
      [dispatch]
   );

   const handleObsChange = useCallback(
      (value: string) => {
         dispatch({
            type: "SET_MISSAO_FIELD",
            payload: { field: "obs", value: value || null },
         });
      },
      [dispatch]
   );

   const selectedSidebarEtapa = selectedEtapa
      ? sidebarEtapas.find((s) => s.localId === selectedEtapa.localId)
      : null;

   const headerTitle = selectedEtapa
      ? `Etapa ${selectedSidebarEtapa?.numero ?? "—"}`
      : missaoLabel;

   const subtitleAriaLabel = selectedEtapa
      ? [
           `Etapa ${selectedSidebarEtapa?.numero}`,
           selectedEtapa.form.origem &&
              selectedEtapa.form.destino &&
              `de ${selectedEtapa.form.origem} para ${selectedEtapa.form.destino}`,
           selectedEtapa.form.data &&
              `em ${formatDateFull(selectedEtapa.form.data)}`,
           selectedEtapa.form.dep &&
              selectedEtapa.form.arr &&
              `das ${selectedEtapa.form.dep} às ${selectedEtapa.form.arr}`,
           selectedEtapa.form.anv && `aeronave ${selectedEtapa.form.anv}`,
        ]
           .filter(Boolean)
           .join(", ")
      : undefined;

   const subtitleTags = selectedEtapa ? (
      <div
         className="flex flex-wrap items-center gap-x-3 gap-y-1"
         role="group"
         aria-label={subtitleAriaLabel}
      >
         <span className="font-mono text-sm font-semibold tracking-wide text-gray-700">
            {selectedEtapa.form.origem || "----"}
            <span className="mx-1 text-gray-400">→</span>
            {selectedEtapa.form.destino || "----"}
         </span>
         {selectedEtapa.form.data && (
            <>
               <span aria-hidden className="text-gray-300">
                  ·
               </span>
               <span className="text-sm text-gray-500 tabular-nums">
                  {formatDateFull(selectedEtapa.form.data)}
               </span>
            </>
         )}
         {selectedEtapa.form.dep && selectedEtapa.form.arr && (
            <>
               <span aria-hidden className="text-gray-300">
                  ·
               </span>
               <span className="text-sm text-gray-500 tabular-nums">
                  {selectedEtapa.form.dep}–{selectedEtapa.form.arr}
               </span>
            </>
         )}
         {selectedEtapa.form.anv && (
            <>
               <span aria-hidden className="text-gray-300">
                  ·
               </span>
               <span className="text-sm font-semibold text-gray-500">
                  {selectedEtapa.form.anv}
               </span>
            </>
         )}
         <EtapaStatusBadge status={selectedEtapa.status} size="sm" />
      </div>
   ) : undefined;

   // Em edição sem mudanças, salvar seria um PUT redundante
   const saveDisabled = mode === "edit" && !dirty;

   useEffect(() => {
      function onKey(e: KeyboardEvent) {
         if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
            e.preventDefault();
            if (
               !saveDisabled &&
               !saveMutation.isPending &&
               !updateMutation.isPending &&
               !deleteMissaoMutation.isPending
            ) {
               handleSave();
            }
         }
      }
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
      // handleSave is stable enough; dependencies via mutations covers re-bind
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [
      saveDisabled,
      saveMutation.isPending,
      updateMutation.isPending,
      deleteMissaoMutation.isPending,
   ]);

   const headerNode = (
      <MissaoHeader
         title={headerTitle}
         subtitleTags={subtitleTags}
         onBack={handleCancel}
         onSave={handleSave}
         onRevert={handleRevert}
         onDeleteEtapa={
            selectedEtapa
               ? () => handleRemoveEtapa(selectedEtapa.localId)
               : undefined
         }
         onOpenSidebar={() => setSidebarOpen(true)}
         dirty={dirty}
         isSaving={saveMutation.isPending || updateMutation.isPending}
         saveDisabled={saveDisabled}
      />
   );

   const sidebarNode = (
      <MissaoSidebar
         tituloMissao={missaoLabel}
         tituloValue={draft.titulo}
         obsValue={draft.obs}
         etapas={sidebarEtapas}
         onAddEtapa={handleAddEtapa}
         onSelectEtapa={handleSelectEtapa}
         onTituloChange={handleTituloChange}
         onObsChange={handleObsChange}
         onDeleteMissao={
            mode === "edit" && draft.serverId ? handleDeleteMissao : undefined
         }
      />
   );

   return (
      <>
         <MissaoEditorLayout
            header={headerNode}
            sidebar={sidebarNode}
            content={
               draft.selectedLocalId == null ? (
                  <EmptyEtapaPlaceholder />
               ) : (
                  <EtapaContent localId={draft.selectedLocalId} />
               )
            }
         />
         {/* Sidebar em drawer nas telas < lg (no desktop ela é coluna fixa).
             Conteúdo montado apenas quando aberto para não deixar inputs
             duplicados focáveis fora da tela */}
         <Drawer
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            position="left"
            className="w-80 p-0 lg:hidden"
         >
            {sidebarOpen && sidebarNode}
         </Drawer>
         {confirmDialogConfig && (
            <ConfirmModal
               show={confirmDialog !== null}
               onClose={closeConfirmDialog}
               onConfirm={handleConfirmDialog}
               title={confirmDialogConfig.title}
               message={confirmDialogConfig.message}
               confirmLabel={confirmDialogConfig.confirmLabel}
               isLoading={
                  confirmDialog?.kind === "deleteMissao" &&
                  deleteMissaoMutation.isPending
               }
            />
         )}
      </>
   );
}
