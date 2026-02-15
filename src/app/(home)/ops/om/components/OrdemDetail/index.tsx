"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button, Spinner, Alert } from "flowbite-react";
import {
   HiX,
   HiArrowLeft,
   HiExclamationCircle,
   HiPencil,
   HiDocumentText,
   HiShoppingBag,
   HiBan,
} from "react-icons/hi";
import clsx from "clsx";
import type { OrdemMissaoOut, EtapaOut } from "services/routes/om/ordens";
import { OrdemBasicInfo } from "./OrdemBasicInfo";
import { OrdemTripulacao } from "./OrdemTripulacao";
import { OrdemEspeciaisDisplay } from "./OrdemEspeciaisTable";
import { OrdemEspecialModal } from "./OrdemEspecialModal";
import { EtapasTable } from "./EtapasTable";
import { EtapaModal } from "./EtapaModal";
import { useOrdemForm } from "./hooks/useOrdemForm";
import { LabelPicker } from "../LabelPicker";
import { LabelManager } from "../LabelManager";
import { useEtiquetas } from "@/hooks/queries";
import { useAeronaves } from "@/hooks/queries/useAeronaves";
import { HiTag } from "react-icons/hi";
import { formatDateForDisplay } from "./utils/ordemUtils";
import { gerarOrdemMissaoDocx } from "../../utils/exportOrdemMissao";
import { gerarPedidoLanche } from "../../utils/exportLanche";
import { useToast } from "../../../../../context/toast";
import { PermBased } from "@/app/(home)/hooks/usePermBased";

interface OrdemDetailProps {
   ordem: OrdemMissaoOut | null;
   onSave: () => void;
   onClose: () => void;
   isNew: boolean;
   isCloning?: boolean;
   isOpen: boolean;
}

export function OrdemDetail({
   ordem,
   onSave,
   onClose,
   isNew,
   isCloning = false,
   isOpen,
}: OrdemDetailProps) {
   const { push: pushToast } = useToast();
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
      handleInsertEtapa,
      handleRemoveEtapa,
      handleEtapaChange,
      updateEtapa,
      addEtapa,
      updateFormData,
      addTripulante,
      removeTripulante,
      updateCamposEspeciais,
      resetForm,
      handleSubmit,
      handleElaborar,
      handleCancelar,
      isCancelling,
      updateEtiquetas,
      areEtapasOrdered,
      handleSortEtapas,
      clearError,
      clearValidationErrors,
      hasChanges,
   } = useOrdemForm({ ordem, isNew, isCloning, onSave });

   // TanStack Query - etiquetas e aeronaves com cache automatico
   const etiquetasQuery = useEtiquetas();
   const allLabels = etiquetasQuery.data ?? [];
   const { data: aeronaveData } = useAeronaves({ per_page: 100, active: true });
   const aeronaves = aeronaveData?.items ?? [];

   const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
   const [isExporting, setIsExporting] = useState(false);
   const [isGeneratingLanche, setIsGeneratingLanche] = useState(false);
   const [isEtapaModalOpen, setIsEtapaModalOpen] = useState(false);
   const [editingEtapaIndex, setEditingEtapaIndex] = useState<number | null>(
      null
   );
   const [isOrdemEspecialModalOpen, setIsOrdemEspecialModalOpen] =
      useState(false);
   const [editingCampoIndex, setEditingCampoIndex] = useState<number | null>(
      null
   );
   const errorContainerRef = useRef<HTMLDivElement>(null);

   const handleClose = useCallback(() => {
      resetForm();
      onClose();
   }, [resetForm, onClose]);

   const handleCancel = useCallback(() => {
      resetForm();
      if (isReadOnlyMode === false && !isNew) {
         toggleReadOnlyMode();
      }
   }, [resetForm, isReadOnlyMode, isNew, toggleReadOnlyMode]);

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

   const handleApproveSubmit = useCallback(async () => {
      const result = await handleElaborar();
      if (result.success) {
         pushToast({
            type: "success",
            title: "Sucesso",
            message: "Ordem de Missão aprovada com sucesso",
         });
      }
   }, [handleElaborar, pushToast]);

   const handleCancelSubmit = useCallback(async () => {
      if (
         !window.confirm(
            "Tem certeza que deseja cancelar esta Ordem de Missão?"
         )
      ) {
         return;
      }
      const result = await handleCancelar();
      if (result.success) {
         pushToast({
            type: "success",
            title: "Sucesso",
            message: "Ordem de Missão cancelada com sucesso",
         });
      }
   }, [handleCancelar, pushToast]);

   const handleExportDocx = useCallback(async () => {
      if (!ordem) return;

      // Validação básica de campos obrigatórios
      if (
         !ordem.id ||
         !Array.isArray(ordem.etapas) ||
         ordem.etapas.length === 0
      ) {
         pushToast({
            type: "warning",
            title: "Atenção",
            message:
               "Ordem de Missão incompleta. Adicione pelo menos uma etapa antes de exportar.",
         });
         return;
      }

      setIsExporting(true);
      let blobUrl: string | null = null;

      try {
         const blob = await gerarOrdemMissaoDocx(ordem);
         blobUrl = URL.createObjectURL(blob);

         const a = document.createElement("a");
         a.href = blobUrl;
         const fileName = `OM_${ordem.numero}_${ordem.uae}.docx`;
         a.download = fileName;
         a.click();
      } catch (error) {
         console.error("Erro ao exportar Ordem de Missão:", error);
         pushToast({
            type: "error",
            title: "Erro",
            message:
               "Erro ao gerar documento DOCX. Por favor, tente novamente.",
         });
      } finally {
         if (blobUrl) {
            URL.revokeObjectURL(blobUrl);
         }
         setIsExporting(false);
      }
   }, [ordem, pushToast]);

   const handlePedidoLanche = useCallback(async () => {
      if (!ordem) return;

      // Validação básica
      if (!ordem.id) {
         pushToast({
            type: "warning",
            title: "Atenção",
            message: "Salve a ordem antes de gerar o pedido de lanche.",
         });
         return;
      }

      setIsGeneratingLanche(true);
      let blobUrl: string | null = null;

      try {
         const blob = await gerarPedidoLanche(ordem);
         blobUrl = URL.createObjectURL(blob);

         const a = document.createElement("a");
         a.href = blobUrl;
         const fileName = `lanche_${ordem.numero}_${ordem.uae}.docx`;
         a.download = fileName;
         a.click();
      } catch (error) {
         console.error("Erro ao gerar pedido de lanche:", error);
         pushToast({
            type: "error",
            title: "Erro",
            message:
               "Erro ao gerar pedido de lanche. Por favor, tente novamente.",
         });
      } finally {
         setIsGeneratingLanche(false);
      }
   }, [ordem, pushToast]);

   const hasCamposEspeciaisVazios = useMemo(
      () => camposEspeciais.some((c) => !c.valor.trim()),
      [camposEspeciais]
   );

   const [isVisible, setIsVisible] = useState(false);
   const [shouldRender, setShouldRender] = useState(false);

   // Controle de animacao de entrada/saida
   useEffect(() => {
      if (isOpen) {
         setShouldRender(true);
         // setTimeout garante que o browser pintou o estado inicial antes da transicao
         const timer = setTimeout(() => setIsVisible(true), 20);
         return () => clearTimeout(timer);
      } else {
         setIsVisible(false);
      }
   }, [isOpen]);

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

   // Bloquear scroll do body e do layout main quando o painel estiver aberto
   useEffect(() => {
      const layoutMain = document.querySelector("main.overflow-auto");
      if (isOpen) {
         document.body.style.overflow = "hidden";
         if (layoutMain) {
            (layoutMain as HTMLElement).style.overflow = "hidden";
         }
      } else {
         document.body.style.overflow = "";
         if (layoutMain) {
            (layoutMain as HTMLElement).style.overflow = "";
         }
      }
      return () => {
         document.body.style.overflow = "";
         if (layoutMain) {
            (layoutMain as HTMLElement).style.overflow = "";
         }
      };
   }, [isOpen]);

   // Aguardar animacao de saida antes de desmontar
   const handleTransitionEnd = () => {
      if (!isVisible && !isOpen) {
         setShouldRender(false);
      }
   };

   const title = useMemo(() => {
      if (isCloning) return "Clonar";
      if (isNew) return "Nova";
      if (!isEditable) return "Detalhes";
      return "Editar";
   }, [isCloning, isNew, isEditable]);

   const buildOrdemIdentificacao = (
      numero: string | null | undefined,
      data_saida: string | null | undefined
   ): string => {
      return numero ? `${numero}/1GT1/${formatDateForDisplay(data_saida)}` : "";
   };

   const ordemIdentificacao = useMemo(
      () => buildOrdemIdentificacao(formData.numero, formData.data_saida),
      [formData.numero, formData.data_saida]
   );

   const ordemBasedIdentificacao = useMemo(
      () => buildOrdemIdentificacao(ordem?.numero, ordem?.data_saida),
      [ordem]
   );

   if (!shouldRender) return null;

   return (
      <div
         className={clsx(
            "absolute inset-0 z-50 flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-xl transition-transform duration-150 ease-out",
            isVisible ? "translate-x-0" : "translate-x-full"
         )}
         onTransitionEnd={handleTransitionEnd}
      >
         {/* Header Fixo */}
         <header className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
            <div className="flex min-w-0 flex-1 items-center gap-4">
               <button
                  onClick={handleClose}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  title="Voltar"
               >
                  <HiArrowLeft size={24} />
               </button>
               <div className="min-w-0">
                  <h1 className="truncate text-xl font-semibold text-gray-900">
                     {title} Ordem de Missão
                  </h1>
                  {!isNew && !isCloning && ordemIdentificacao && (
                     <p className="truncate font-mono text-sm text-gray-500 uppercase">
                        {ordemIdentificacao}
                     </p>
                  )}
                  {isCloning && ordemBasedIdentificacao && (
                     <p className="truncate text-sm text-gray-500">
                        Baseado em:{" "}
                        <span className="font-mono uppercase">
                           {ordemBasedIdentificacao}
                        </span>
                     </p>
                  )}
               </div>
            </div>

            {/* Badge centralizado */}
            {isReadOnlyMode && (
               <div className="flex flex-1 justify-center">
                  <span className="rounded-lg border border-gray-300 bg-gray-100 px-3 py-1.5 text-xs font-bold tracking-wider text-gray-700 uppercase">
                     Somente Leitura
                  </span>
               </div>
            )}

            <div className="flex flex-1 items-center justify-end gap-3">
               {isReadOnlyMode && (
                  <>
                     {formData.status !== "cancelada" && (
                        <Button color="red" onClick={toggleReadOnlyMode}>
                           <HiPencil className="mr-2" size={16} />
                           Editar
                        </Button>
                     )}
                     {formData.status === "aprovada" && (
                        <PermBased
                           resource={"ordem_missao"}
                           requiredPerm={"aprove"}
                        >
                           <Button
                              color="light"
                              onClick={handleCancelSubmit}
                              disabled={isCancelling}
                           >
                              {isCancelling ? (
                                 <>
                                    <Spinner
                                       color="failure"
                                       size="sm"
                                       className="mr-2"
                                    />
                                    Cancelando...
                                 </>
                              ) : (
                                 <>
                                    <HiBan
                                       className="mr-2 text-red-500"
                                       size={16}
                                    />
                                    Cancelar OM
                                 </>
                              )}
                           </Button>
                        </PermBased>
                     )}
                     <Button
                        color="gray"
                        onClick={handleClose}
                        disabled={isSaving || isApproving || isCancelling}
                     >
                        <HiX className="mr-2" size={16} />
                        Fechar
                     </Button>
                  </>
               )}

               {isEditable && (
                  <>
                     <Button
                        color="gray"
                        onClick={handleCancel}
                        disabled={isSaving || isApproving}
                     >
                        <HiX className="mr-2" size={16} />
                        Cancelar
                     </Button>
                     <Button
                        color="light"
                        type="submit"
                        form="ordem-form"
                        disabled={
                           !hasChanges ||
                           hasCamposEspeciaisVazios ||
                           isSaving ||
                           isApproving
                        }
                     >
                        {isSaving ? (
                           <>
                              <Spinner
                                 color="failure"
                                 size="sm"
                                 className="mr-2"
                              />
                              Salvando...
                           </>
                        ) : (
                           "Salvar"
                        )}
                     </Button>
                     {!isCloning &&
                        (isNew || formData.status === "rascunho") && (
                           <PermBased
                              resource={"ordem_missao"}
                              requiredPerm={"aprove"}
                           >
                              <Button
                                 color="red"
                                 type="button"
                                 onClick={handleApproveSubmit}
                                 disabled={
                                    hasCamposEspeciaisVazios ||
                                    isSaving ||
                                    isApproving
                                 }
                              >
                                 {isApproving ? (
                                    <>
                                       <Spinner
                                          color="failure"
                                          size="sm"
                                          className="mr-2"
                                       />
                                       Aprovando...
                                    </>
                                 ) : (
                                    "Aprovar"
                                 )}
                              </Button>
                           </PermBased>
                        )}
                  </>
               )}
            </div>
         </header>

         {/* Conteudo Scrollavel */}
         <main className="flex-1 overflow-y-auto">
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

                  {isReadOnlyMode && (
                     <div className="flex justify-center gap-3">
                        <Button
                           color="light"
                           onClick={handleExportDocx}
                           disabled={isExporting || isSaving || isApproving}
                        >
                           {isExporting ? (
                              <Spinner color="failure" size="sm" />
                           ) : (
                              <HiDocumentText
                                 className="mr-2 text-blue-600"
                                 size={16}
                              />
                           )}
                           Documento
                        </Button>
                        <Button
                           color="light"
                           onClick={handlePedidoLanche}
                           disabled={
                              isGeneratingLanche || isSaving || isApproving
                           }
                        >
                           {isGeneratingLanche ? (
                              <Spinner color="failure" size="sm" />
                           ) : (
                              <HiShoppingBag
                                 className="mr-2 text-yellow-500"
                                 size={16}
                              />
                           )}
                           Pedido de Lanche
                        </Button>
                     </div>
                  )}

                  {/* Secao: Informacoes */}
                  <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                     <div className="border-b border-slate-200 p-4">
                        <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700 uppercase">
                           <div className="h-4 w-1 rounded-full bg-blue-500"></div>
                           Informacões
                        </h3>
                     </div>
                     <div className="px-16 py-4">
                        <OrdemBasicInfo
                           formData={formData}
                           isEditable={isEditable}
                           onUpdate={updateFormData}
                           validationErrors={validationErrors}
                           aeronaves={aeronaves}
                        />
                     </div>
                  </div>

                  {/* Secao: Tripulacao */}
                  <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                     <div className="border-b border-slate-200 p-4">
                        <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700 uppercase">
                           <div className="h-4 w-1 rounded-full bg-green-500"></div>
                           Tripulacão
                        </h3>
                     </div>
                     <div className="p-4">
                        <OrdemTripulacao
                           tripulacao={tripulacao}
                           projeto={formData.projeto}
                           onAdd={addTripulante}
                           onRemove={removeTripulante}
                           isEditable={isEditable}
                           validationErrors={validationErrors}
                        />
                     </div>
                  </div>

                  {/* Secao: Etapas */}
                  <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                     <div className="p-4">
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
                     </div>
                  </div>

                  {/* Secao: Ordens Especiais */}
                  <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                     <div className="px-4 py-5">
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
                     </div>
                  </div>

                  {/* Secao: Classificação (Etiquetas) */}
                  <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                     <div className="flex items-center justify-between border-b border-slate-200 p-4">
                        <div className="flex items-center gap-4">
                           <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700 uppercase">
                              <div className="h-4 w-1 rounded-full bg-red-500"></div>
                              Classificação
                           </h3>
                           {isEditable && (
                              <button
                                 type="button"
                                 onClick={() => setIsLabelManagerOpen(true)}
                                 className="group flex items-center gap-1.5 text-xs font-bold tracking-wider text-red-600 uppercase transition-all hover:text-red-700"
                              >
                                 <HiTag className="h-4 w-4 transition-transform group-hover:scale-110" />
                                 Gerenciar
                              </button>
                           )}
                        </div>
                     </div>
                     <div className="px-10 py-4">
                        <LabelPicker
                           allLabels={allLabels}
                           selectedLabels={formData.etiquetas || []}
                           onChange={updateEtiquetas}
                           isEditable={isEditable}
                           className="w-full max-w-2xl"
                        />
                     </div>
                  </div>
               </form>
            </div>
         </main>

         <LabelManager
            isOpen={isLabelManagerOpen}
            onClose={() => setIsLabelManagerOpen(false)}
            labels={allLabels}
            onRefresh={() => etiquetasQuery.refetch()}
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
      </div>
   );
}
