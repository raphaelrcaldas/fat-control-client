"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Drawer } from "flowbite-react";

import {
   useMissaoDraft,
   useMissaoDraftDispatch,
} from "../context/MissaoDraftContext";
import { selectEtapaTotals } from "../context/selectors";
import { isDirty } from "../context/serialization";
import { useToast } from "@/app/context/toast";
import { formatDateFull } from "@/../utils/dateHandler";

import { ConfirmModal } from "@/components/ConfirmModal";
import { useMissaoActions } from "../hooks/useMissaoActions";
import { useConfirmDialog } from "../hooks/useConfirmDialog";
import { useSaveShortcut } from "../hooks/useSaveShortcut";
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

export function MissaoEditor({ mode }: MissaoEditorProps) {
   const draft = useMissaoDraft();
   const dispatch = useMissaoDraftDispatch();
   const router = useRouter();
   const { push } = useToast();

   // Drawer da sidebar nas telas < lg (no desktop a sidebar é fixa)
   const [sidebarOpen, setSidebarOpen] = useState(false);

   const { saveMutation, updateMutation, deleteMutation, handleSave } =
      useMissaoActions({ draft, mode });
   const {
      dialog: confirmDialog,
      open: openConfirm,
      close: closeConfirm,
      confirm: confirmAction,
      config: confirmConfig,
   } = useConfirmDialog({ deleteMutation });

   const dirty = isDirty(draft);

   useUnsavedChangesGuard({
      enabled: dirty && !saveMutation.isPending && !updateMutation.isPending,
   });

   // Em edição sem mudanças, salvar seria um PUT redundante
   const saveDisabled = mode === "edit" && !dirty;

   useSaveShortcut({
      onSave: handleSave,
      disabled:
         saveDisabled ||
         saveMutation.isPending ||
         updateMutation.isPending ||
         deleteMutation.isPending,
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
         openConfirm({ kind: "cancel" });
         return;
      }
      router.back();
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
         openConfirm({ kind: "removeEtapa", localId });
      },
      [draft.etapas.length, push, openConfirm]
   );

   const handleDeleteMissao = useCallback(() => {
      setSidebarOpen(false);
      openConfirm({ kind: "deleteMissao" });
   }, [openConfirm]);

   const handleRevert = useCallback(() => {
      openConfirm({ kind: "revert" });
   }, [openConfirm]);

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
         {confirmConfig && (
            <ConfirmModal
               show={confirmDialog !== null}
               onClose={closeConfirm}
               onConfirm={confirmAction}
               title={confirmConfig.title}
               message={confirmConfig.message}
               confirmLabel={confirmConfig.confirmLabel}
               isLoading={
                  confirmDialog?.kind === "deleteMissao" &&
                  deleteMutation.isPending
               }
            />
         )}
      </>
   );
}
