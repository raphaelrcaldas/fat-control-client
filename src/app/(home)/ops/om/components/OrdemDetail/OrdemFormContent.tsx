"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button, Spinner, Alert } from "flowbite-react";
import {
   HiExclamationCircle,
   HiDocumentText,
   HiShoppingBag,
   HiTag,
} from "react-icons/hi";
import { ConfirmModal } from "@/components/ConfirmModal";
import clsx from "clsx";
import type { OrdemMissaoOut, EtapaOut } from "services/routes/om/ordens";
import { OrdemBasicInfo } from "./OrdemBasicInfo";
import { OrdemTripulacao } from "./OrdemTripulacao";
import { OrdemEspeciaisDisplay } from "./OrdemEspeciaisTable";
import { OrdemEspecialModal } from "./OrdemEspecialModal";
import { EtapasTable } from "./EtapasTable";
import { EtapaModal } from "./EtapaModal";
import { FormSection } from "./FormSection";
import { OrdemFormHeader } from "./OrdemFormHeader";
import { useOrdemForm } from "./hooks/useOrdemForm";
import { useOrdemExports } from "./hooks/useOrdemExports";
import { LabelPicker } from "../LabelPicker";
import { LabelManager } from "../LabelManager";
import { useEtiquetas } from "@/hooks/queries";
import { useAeronaves } from "@/hooks/queries/useAeronaves";
import { formatDateForDisplay } from "utils/dateHandler";
import { useAuth } from "@/app/context/auth";
import { useToast } from "@/app/context/toast";
import { PermBased } from "@/app/(home)/hooks/usePermBased";

interface OrdemFormContentProps {
   ordem: OrdemMissaoOut | null;
   onSave: () => void;
   onClose: () => void;
   isNew: boolean;
   isCloning?: boolean;
}

// Ação pendente de confirmação no modal único de confirmação
type ConfirmAction =
   "discard-close" | "discard-edit" | "cancel-om" | "approve-om";

export function OrdemFormContent({
   ordem,
   onSave,
   onClose,
   isNew,
   isCloning = false,
}: OrdemFormContentProps) {
   const { push: pushToast } = useToast();
   const { activeOrg } = useAuth();
   const {
      formData,
      tripulacao,
      camposEspeciais,
      isEditable,
      isReadOnlyMode,
      toggleReadOnlyMode,
      isSaving,
      isApproving,
      error,
      validationErrors,
      formValidationErrors,
      handleRemoveEtapa,
      updateEtapa,
      addEtapa,
      updateFormData,
      addTripulante,
      removeTripulante,
      updateCamposEspeciais,
      resetForm,
      handleSubmit,
      validateForApproval,
      handleElaborar,
      handleCancelar,
      isCancelling,
      updateEtiquetas,
      clearError,
      clearValidationErrors,
      hasChanges,
   } = useOrdemForm({ ordem, isNew, isCloning, onSave });

   const {
      isExporting,
      isGeneratingLanche,
      handleExportDocx,
      handlePedidoLanche,
   } = useOrdemExports(ordem);

   // TanStack Query - etiquetas e aeronaves com cache automatico
   const etiquetasQuery = useEtiquetas();
   const allLabels = etiquetasQuery.data ?? [];
   const { data: aeronaveData } = useAeronaves({
      per_page: 100,
      is_sim: false,
   });
   const aeronaves = aeronaveData?.items ?? [];

   const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
   const [isEtapaModalOpen, setIsEtapaModalOpen] = useState(false);
   const [editingEtapaIndex, setEditingEtapaIndex] = useState<number | null>(
      null
   );
   const [isOrdemEspecialModalOpen, setIsOrdemEspecialModalOpen] =
      useState(false);
   const [editingCampoIndex, setEditingCampoIndex] = useState<number | null>(
      null
   );
   const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
      null
   );
   const errorContainerRef = useRef<HTMLDivElement>(null);

   const doClose = useCallback(() => {
      resetForm();
      onClose();
   }, [resetForm, onClose]);

   // Guard: não descartar alterações não salvas sem confirmação
   const handleClose = useCallback(() => {
      if (hasChanges) {
         setConfirmAction("discard-close");
      } else {
         doClose();
      }
   }, [hasChanges, doClose]);

   const doCancelEdit = useCallback(() => {
      resetForm();
      if (isReadOnlyMode === false && !isNew) {
         toggleReadOnlyMode();
      }
   }, [resetForm, isReadOnlyMode, isNew, toggleReadOnlyMode]);

   const handleCancel = useCallback(() => {
      if (hasChanges) {
         setConfirmAction("discard-edit");
      } else {
         doCancelEdit();
      }
   }, [hasChanges, doCancelEdit]);

   const handleSaveSubmit = useCallback(
      async (e: React.FormEvent) => {
         const result = await handleSubmit(e);
         if (result.success) {
            pushToast({
               type: "success",
               title: "Sucesso",
               message: "Ordem de Missão salva com sucesso",
            });
         }
      },
      [handleSubmit, pushToast]
   );

   // Valida antes de pedir confirmação: erros aparecem de imediato,
   // sem o usuário confirmar uma aprovação que vai falhar
   const handleApproveSubmit = useCallback(() => {
      if (!validateForApproval()) return;
      setConfirmAction("approve-om");
   }, [validateForApproval]);

   const confirmApproveOm = useCallback(async () => {
      setConfirmAction(null);
      const result = await handleElaborar();
      if (result.success) {
         pushToast({
            type: "success",
            title: "Sucesso",
            message: "Ordem de Missão aprovada com sucesso",
         });
      }
   }, [handleElaborar, pushToast]);

   const handleCancelSubmit = useCallback(() => {
      setConfirmAction("cancel-om");
   }, []);

   const confirmCancelOm = useCallback(async () => {
      setConfirmAction(null);
      const result = await handleCancelar();
      if (result.success) {
         pushToast({
            type: "success",
            title: "Sucesso",
            message: "Ordem de Missão cancelada com sucesso",
         });
      }
   }, [handleCancelar, pushToast]);

   // Conteúdo e ação do modal único de confirmação
   const confirmDialog = useMemo(() => {
      if (!confirmAction) return null;
      if (confirmAction === "cancel-om") {
         return {
            title: "Cancelar Ordem de Missão",
            message:
               "Tem certeza que deseja cancelar esta Ordem de Missão? Esta ação muda o status para cancelada.",
            confirmLabel: "Sim, cancelar OM",
            onConfirm: confirmCancelOm,
         };
      }
      if (confirmAction === "approve-om") {
         return {
            title: "Aprovar Ordem de Missão",
            message: hasChanges
               ? "As alterações pendentes serão salvas e a ordem passará para o status aprovada. Deseja continuar?"
               : "A ordem passará para o status aprovada. Deseja continuar?",
            confirmLabel: hasChanges
               ? "Sim, salvar e aprovar"
               : "Sim, aprovar OM",
            onConfirm: confirmApproveOm,
         };
      }
      return {
         title: "Descartar alterações",
         message:
            "Há alterações não salvas que serão perdidas. Deseja continuar?",
         confirmLabel: "Sim, descartar",
         onConfirm: () => {
            setConfirmAction(null);
            if (confirmAction === "discard-close") {
               doClose();
            } else {
               doCancelEdit();
            }
         },
      };
   }, [
      confirmAction,
      confirmCancelOm,
      confirmApproveOm,
      hasChanges,
      doClose,
      doCancelEdit,
   ]);

   const hasCamposEspeciaisVazios = useMemo(
      () => camposEspeciais.some((c) => !c.valor.trim()),
      [camposEspeciais]
   );

   // Scroll automatico para erros quando aparecem
   useEffect(() => {
      if (
         (error || formValidationErrors.length > 0) &&
         errorContainerRef.current
      ) {
         const scrollContainer = errorContainerRef.current.closest(
            ".overflow-y-auto"
         ) as HTMLElement;

         if (scrollContainer) {
            setTimeout(() => {
               scrollContainer.scrollTo({
                  top: 0,
                  behavior: "smooth",
               });
            }, 100);
         }

         // Focus na area de erro para acessibilidade
         errorContainerRef.current.focus();
      }
   }, [error, formValidationErrors]);

   const title = useMemo(() => {
      if (isCloning) return "Clonar";
      if (isNew) return "Nova";
      if (!isEditable) return "Detalhes";
      return "Editar";
   }, [isCloning, isNew, isEditable]);

   const buildOrdemIdentificacao = useCallback(
      (
         numero: string | null | undefined,
         data_saida: string | null | undefined
      ): string => {
         return numero
            ? `${numero}/${activeOrg ?? ""}/${formatDateForDisplay(data_saida ?? "")}`
            : "";
      },
      [activeOrg]
   );

   const ordemIdentificacao = useMemo(
      () => buildOrdemIdentificacao(formData.numero, formData.data_saida),
      [buildOrdemIdentificacao, formData.numero, formData.data_saida]
   );

   const ordemBasedIdentificacao = useMemo(
      () => buildOrdemIdentificacao(ordem?.numero, ordem?.data_saida),
      [buildOrdemIdentificacao, ordem]
   );

   return (
      <div className="flex flex-1 flex-col overflow-hidden rounded border border-gray-200 bg-gray-50 shadow">
         <OrdemFormHeader
            title={title}
            isNew={isNew}
            isCloning={isCloning}
            ordemIdentificacao={ordemIdentificacao}
            ordemBasedIdentificacao={ordemBasedIdentificacao}
            status={formData.status}
            isReadOnlyMode={isReadOnlyMode}
            isEditable={isEditable}
            hasChanges={hasChanges}
            hasCamposEspeciaisVazios={hasCamposEspeciaisVazios}
            isSaving={isSaving}
            isApproving={isApproving}
            isCancelling={isCancelling}
            onClose={handleClose}
            onToggleReadOnly={toggleReadOnlyMode}
            onCancelEdit={handleCancel}
            onApprove={handleApproveSubmit}
            onCancelOm={handleCancelSubmit}
         />

         {/* Conteudo Scrollavel */}
         <div className="flex-1 overflow-y-auto">
            <div className="mx-auto p-4">
               <form
                  onSubmit={handleSaveSubmit}
                  id="ordem-form"
                  className="space-y-4"
               >
                  {/* Container de Erros com scroll automatico */}
                  {(error || formValidationErrors.length > 0) && (
                     <div
                        ref={errorContainerRef}
                        tabIndex={-1}
                        className="space-y-4 outline-none"
                        role="alert"
                        aria-live="assertive"
                     >
                        {/* Erro da API */}
                        {error && (
                           <Alert
                              color="red"
                              icon={HiExclamationCircle}
                              withBorderAccent
                              onDismiss={clearError}
                              className={clsx(
                                 "animate-shake",
                                 "shadow-lg shadow-red-100"
                              )}
                           >
                              <div className="flex flex-col gap-2">
                                 <span className="text-sm font-semibold md:text-base">
                                    Erro ao processar a operacao
                                 </span>
                                 <span className="text-sm">{error}</span>
                              </div>
                           </Alert>
                        )}

                        {/* Erros de validacao */}
                        {formValidationErrors.length > 0 && (
                           <Alert
                              color="yellow"
                              icon={HiExclamationCircle}
                              withBorderAccent
                              onDismiss={clearValidationErrors}
                              className={clsx(
                                 "animate-shake",
                                 "shadow-lg shadow-yellow-100"
                              )}
                           >
                              <div className="flex flex-col gap-3">
                                 <span className="text-sm font-semibold md:text-base">
                                    Corrija os seguintes campos obrigatorios:
                                 </span>
                                 <ul
                                    className={clsx(
                                       "ml-4 space-y-1.5 text-sm",
                                       "list-disc marker:text-yellow-600"
                                    )}
                                 >
                                    {formValidationErrors.map((err, idx) => (
                                       <li key={idx} className="pl-1">
                                          {err}
                                       </li>
                                    ))}
                                 </ul>
                              </div>
                           </Alert>
                        )}
                     </div>
                  )}

                  {/* Exportações indisponíveis em rascunho: o documento só
                      faz sentido após a ordem ser aprovada */}
                  {isReadOnlyMode && formData.status !== "rascunho" && (
                     <div className="flex justify-center gap-3">
                        <Button
                           color="light"
                           onClick={handleExportDocx}
                           disabled={isExporting || isSaving || isApproving}
                        >
                           {isExporting ? (
                              <Spinner color="primary" size="sm" />
                           ) : (
                              <HiDocumentText
                                 className="mr-2 text-blue-600"
                                 size={16}
                              />
                           )}
                           Documento
                        </Button>
                        <PermBased
                           resource={"ordem_missao"}
                           requiredPerm={"create"}
                        >
                           <Button
                              color="light"
                              onClick={handlePedidoLanche}
                              disabled={
                                 isGeneratingLanche || isSaving || isApproving
                              }
                           >
                              {isGeneratingLanche ? (
                                 <Spinner color="primary" size="sm" />
                              ) : (
                                 <HiShoppingBag
                                    className="mr-2 text-yellow-500"
                                    size={16}
                                 />
                              )}
                              Pedido de Lanche
                           </Button>
                        </PermBased>
                     </div>
                  )}

                  <FormSection
                     title="Informações"
                     accentClass="bg-blue-500"
                     contentClassName="px-4 py-4 md:px-10"
                  >
                     <OrdemBasicInfo
                        formData={formData}
                        isEditable={isEditable}
                        onUpdate={updateFormData}
                        validationErrors={validationErrors}
                        aeronaves={aeronaves}
                     />
                  </FormSection>

                  <FormSection title="Tripulação" accentClass="bg-green-500">
                     <OrdemTripulacao
                        tripulacao={tripulacao}
                        onAdd={addTripulante}
                        onRemove={removeTripulante}
                        isEditable={isEditable}
                        validationErrors={validationErrors}
                     />
                  </FormSection>

                  <FormSection>
                     <EtapasTable
                        etapas={formData.etapas}
                        isEditable={isEditable}
                        canRemoveEtapa={formData.etapas.length > 1}
                        onAddEtapa={() => {
                           setEditingEtapaIndex(null);
                           setIsEtapaModalOpen(true);
                        }}
                        onEditEtapa={(index) => {
                           setEditingEtapaIndex(index);
                           setIsEtapaModalOpen(true);
                        }}
                        onRemoveEtapa={handleRemoveEtapa}
                     />
                  </FormSection>

                  <FormSection contentClassName="px-4 py-5">
                     <OrdemEspeciaisDisplay
                        campos={camposEspeciais}
                        isEditable={isEditable}
                        onAddCampo={() => {
                           setEditingCampoIndex(null);
                           setIsOrdemEspecialModalOpen(true);
                        }}
                        onEditCampo={(index) => {
                           setEditingCampoIndex(index);
                           setIsOrdemEspecialModalOpen(true);
                        }}
                        onRemoveCampo={(index) => {
                           updateCamposEspeciais(
                              camposEspeciais.filter((_, i) => i !== index)
                           );
                        }}
                        onReorder={updateCamposEspeciais}
                     />
                  </FormSection>

                  <FormSection
                     title="Classificação"
                     accentClass="bg-red-500"
                     contentClassName="px-4 py-4 md:px-10"
                     action={
                        isEditable ? (
                           <button
                              type="button"
                              onClick={() => setIsLabelManagerOpen(true)}
                              className="group flex items-center gap-1.5 text-xs font-bold tracking-wider text-red-600 uppercase transition-all hover:text-red-700"
                           >
                              <HiTag className="h-4 w-4 transition-transform group-hover:scale-110" />
                              Gerenciar
                           </button>
                        ) : undefined
                     }
                  >
                     <LabelPicker
                        allLabels={allLabels}
                        selectedLabels={formData.etiquetas || []}
                        onChange={updateEtiquetas}
                        isEditable={isEditable}
                        className="w-full max-w-2xl"
                     />
                  </FormSection>
               </form>
            </div>
         </div>

         <LabelManager
            isOpen={isLabelManagerOpen}
            onClose={() => setIsLabelManagerOpen(false)}
            labels={allLabels}
            onLabelDeleted={(id) => {
               const updatedLabels = (formData.etiquetas || []).filter(
                  (et) => et.id !== id
               );
               updateEtiquetas(updatedLabels);
            }}
         />

         <EtapaModal
            isOpen={isEtapaModalOpen}
            onClose={() => {
               setIsEtapaModalOpen(false);
               setEditingEtapaIndex(null);
            }}
            onSave={(etapa: EtapaOut) => {
               if (editingEtapaIndex !== null) {
                  updateEtapa(editingEtapaIndex, etapa);
               } else {
                  addEtapa(etapa);
               }
               setIsEtapaModalOpen(false);
               setEditingEtapaIndex(null);
            }}
            etapa={
               editingEtapaIndex !== null
                  ? formData.etapas[editingEtapaIndex]
                  : null
            }
            etapaIndex={editingEtapaIndex}
            referenceEtapa={formData.etapas[formData.etapas.length - 1]}
         />

         <OrdemEspecialModal
            isOpen={isOrdemEspecialModalOpen}
            onClose={() => {
               setIsOrdemEspecialModalOpen(false);
               setEditingCampoIndex(null);
            }}
            onSave={(campo) => {
               if (editingCampoIndex !== null) {
                  // Editar existente
                  const newCampos = [...camposEspeciais];
                  newCampos[editingCampoIndex] = campo;
                  updateCamposEspeciais(newCampos);
               } else {
                  // Adicionar novo
                  updateCamposEspeciais([...camposEspeciais, campo]);
               }
               setIsOrdemEspecialModalOpen(false);
               setEditingCampoIndex(null);
            }}
            campo={
               editingCampoIndex !== null
                  ? camposEspeciais[editingCampoIndex]
                  : null
            }
            campoIndex={editingCampoIndex}
         />

         {/* Modal único de confirmação (descartar alterações / cancelar OM /
             aprovar OM) — conteúdo derivado do ConfirmAction pendente */}
         <ConfirmModal
            show={confirmDialog !== null}
            onClose={() => setConfirmAction(null)}
            onConfirm={confirmDialog?.onConfirm ?? (() => {})}
            title={confirmDialog?.title ?? ""}
            message={
               <p className="text-sm text-gray-500">{confirmDialog?.message}</p>
            }
            confirmLabel={confirmDialog?.confirmLabel ?? "Confirmar"}
            cancelLabel="Voltar"
            iconColor="text-red-400"
         />
      </div>
   );
}
