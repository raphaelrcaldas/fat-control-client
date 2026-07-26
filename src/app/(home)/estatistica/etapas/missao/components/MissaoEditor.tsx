"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Drawer } from "flowbite-react";
import { HiMenuAlt2, HiX } from "react-icons/hi";

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
   const contentRef = useRef<HTMLDivElement>(null);

   // O drawer precisa sair do wrapper de PageTransition: ele carrega um
   // `translate` residual (translate-y-0), e no CSS moderno qualquer `translate`
   // != none cria bloco contêiner para descendentes `position: fixed`. Preso ali,
   // o drawer se ancorava 60px abaixo do topo, vazava a viewport e injetava
   // rolagem espúria no <main> mesmo fechado.
   const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
   useEffect(() => {
      setPortalTarget(document.body);
   }, []);

   // O Drawer do Flowbite 0.12 não move nem prende o foco: sem isto, abrir o
   // painel deixa o teclado passeando pelo formulário atrás dele
   const drawerCloseRef = useRef<HTMLButtonElement>(null);
   useEffect(() => {
      if (sidebarOpen) drawerCloseRef.current?.focus();
   }, [sidebarOpen]);

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
      contentRef.current?.scrollTo({ top: 0 });
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
            contentRef={contentRef}
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
         {portalTarget &&
            createPortal(
               <Drawer
                  open={sidebarOpen}
                  onClose={() => setSidebarOpen(false)}
                  position="left"
                  aria-label="Etapas da missão"
                  // Abaixo do navbar (fixed, z-50, 4rem): ancorado em top-0 o
                  // cabeçalho do drawer ficava por baixo dele e o X não recebia
                  // nem clique nem toque
                  className="top-16 flex h-[calc(100dvh-4rem)] w-80 flex-col overflow-hidden p-0 lg:hidden"
               >
                  {/* Header próprio em vez do DrawerHeader do Flowbite: o dele
                      é um <h5> fixo, que quebra a ordem de headings (h2 → h5) */}
                  <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-200 px-4 py-2">
                     <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <HiMenuAlt2 aria-hidden className="h-4 w-4" />
                        Etapas da missão
                     </h2>
                     <button
                        ref={drawerCloseRef}
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Fechar painel de etapas"
                        className="focus-visible:outline-primary-500 grid size-9 shrink-0 place-items-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2 pointer-coarse:size-11"
                     >
                        <HiX className="h-5 w-5" />
                     </button>
                  </div>
                  {sidebarOpen && (
                     <div className="min-h-0 flex-1">{sidebarNode}</div>
                  )}
               </Drawer>,
               portalTarget
            )}
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
