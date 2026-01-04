"use client";

import { useState, useEffect, useRef } from "react";
import { Button, Spinner, Alert } from "flowbite-react";
import {
   HiChevronDown,
   HiChevronUp,
   HiX,
   HiArrowLeft,
   HiExclamationCircle,
   HiSortAscending,
} from "react-icons/hi";
import clsx from "clsx";
import { OrdemMissao } from "../types";
import {
   OrdemBasicInfo,
   OrdemTripulacao,
   OrdemEspeciais,
   OrdemEtapaItem,
   useOrdemForm,
} from "./OrdemModal/";
import { LabelPicker } from "./LabelPicker";
import { LabelManager } from "./LabelManager";
import { listEtiquetas } from "services/routes/om/etiquetas";
import { Etiqueta } from "../types";
import { HiTag } from "react-icons/hi";

interface OrdemModalProps {
   ordem: OrdemMissao | null;
   onSave: () => void;
   onClose: () => void;
   isNew: boolean;
   isCloning?: boolean;
   isOpen: boolean;
}

export function OrdemModal({
   ordem,
   onSave,
   onClose,
   isNew,
   isCloning = false,
   isOpen,
}: OrdemModalProps) {
   const {
      formData,
      tripulacao,
      camposEspeciais,
      isEditable,
      isSaving,
      error,
      validationErrors,
      formValidationErrors,
      handleInsertEtapa,
      handleRemoveEtapa,
      handleEtapaChange,
      updateFormData,
      addTripulante,
      removeTripulante,
      updateCamposEspeciais,
      resetForm,
      handleSubmit,
      handleElaborar,
      updateEtiquetas,
      areEtapasOrdered,
      handleSortEtapas,
      clearError,
      clearValidationErrors,
   } = useOrdemForm({ ordem, isNew, isCloning, onSave });

   const [allLabels, setAllLabels] = useState<Etiqueta[]>([]);
   const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
   const errorContainerRef = useRef<HTMLDivElement>(null);

   const refreshLabels = async () => {
      try {
         const data = await listEtiquetas();
         setAllLabels(data);
      } catch (err) {
         console.error("Erro ao carregar etiquetas:", err);
      }
   };

   useEffect(() => {
      if (isOpen) {
         refreshLabels();
      }
   }, [isOpen]);

   const handleClose = () => {
      resetForm();
      setSections({
         basicInfo: true,
         tripulacao: true,
         etapas: true,
         especiais: true,
         classificacao: true,
      });
      onClose();
   };

   const hasCamposEspeciaisVazios = camposEspeciais.some(
      (c) => !c.valor.trim()
   );

   const [sections, setSections] = useState({
      basicInfo: true,
      tripulacao: true,
      etapas: true,
      especiais: true,
      classificacao: true,
   });

   const [isVisible, setIsVisible] = useState(false);
   const [shouldRender, setShouldRender] = useState(false);

   // Controle de animacao de entrada/saida
   useEffect(() => {
      if (isOpen) {
         setShouldRender(true);
         // Pequeno delay para a animacao de entrada
         requestAnimationFrame(() => setIsVisible(true));
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

   const toggleSection = (
      key: keyof typeof sections,
      event: React.MouseEvent
   ) => {
      const isOpening = !sections[key];
      setSections((prev) => ({ ...prev, [key]: !prev[key] }));

      if (isOpening) {
         const section = event.currentTarget.closest(
            ".rounded-xl"
         ) as HTMLElement;
         const scrollContainer = section?.closest(
            ".overflow-y-auto"
         ) as HTMLElement;

         if (section && scrollContainer) {
            setTimeout(() => {
               scrollContainer.scrollTo({
                  top: section.offsetTop - 16,
                  behavior: "smooth",
               });
            }, 50);
         }
      }
   };

   if (!shouldRender) return null;

   const title = isCloning
      ? "Clonar"
      : isNew
        ? "Nova"
        : !isEditable
          ? "Detalhes"
          : "Editar";

   // Formata data de yyyy-MM-dd para ddMMyyyy
   const formatDateForDisplay = (dateStr: string) => {
      if (!dateStr) return "";
      const [year, month, day] = dateStr.split("-");
      return `${day}${month}${year}`;
   };

   const ordemIdentificacao = formData.numero
      ? `${formData.numero}/${formData.uae}/${formatDateForDisplay(formData.dataSaida)}`
      : "";

   const ordemBasedIdentificacao = ordem
      ? `${ordem.numero}/${ordem.uae}/${formatDateForDisplay(ordem.dataSaida)}`
      : "";

   return (
      <div
         className={clsx(
            "fixed inset-0 z-50 flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-xl transition-transform duration-300 ease-out",
            isVisible ? "translate-x-0" : "translate-x-full"
         )}
         onTransitionEnd={handleTransitionEnd}
      >
         {/* Header Fixo */}
         <header className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
            <div className="flex items-center gap-4">
               <button
                  onClick={handleClose}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  title="Voltar"
               >
                  <HiArrowLeft size={24} />
               </button>
               <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                     {title} Ordem de Missão
                  </h1>
                  {!isNew && !isCloning && ordemIdentificacao && (
                     <p className="font-mono text-sm text-gray-500 uppercase">
                        {ordemIdentificacao}
                     </p>
                  )}
                  {isCloning && ordemBasedIdentificacao && (
                     <p className="text-sm text-gray-500">
                        Baseado em:{" "}
                        <span className="font-mono uppercase">
                           {ordemBasedIdentificacao}
                        </span>
                     </p>
                  )}
               </div>
            </div>

            <div className="flex items-center gap-3">
               {!isEditable && (
                  <span className="rounded-lg border border-gray-300 bg-gray-100 px-3 py-1.5 text-xs font-bold tracking-wider text-gray-700 uppercase">
                     Somente Leitura
                  </span>
               )}
               <Button color="gray" onClick={handleClose} disabled={isSaving}>
                  <HiX className="mr-2" size={16} />
                  Cancelar
               </Button>
               {isEditable && (
                  <>
                     <Button
                        color="light"
                        type="submit"
                        form="ordem-form"
                        disabled={hasCamposEspeciaisVazios || isSaving}
                     >
                        {isSaving ? (
                           <>
                              <Spinner size="sm" className="mr-2" />
                              Salvando...
                           </>
                        ) : (
                           "Salvar"
                        )}
                     </Button>
                     {!isNew && !isCloning && (
                        <Button
                           color="red"
                           type="button"
                           onClick={handleElaborar}
                           disabled={hasCamposEspeciaisVazios || isSaving}
                        >
                           {isSaving ? (
                              <>
                                 <Spinner size="sm" className="mr-2" />
                                 Aprovando...
                              </>
                           ) : (
                              "Aprovar"
                           )}
                        </Button>
                     )}
                  </>
               )}
            </div>
         </header>

         {/* Conteudo Scrollavel */}
         <main className="flex-1 overflow-y-auto">
            <div className="mx-auto p-6">
               <form
                  onSubmit={handleSubmit}
                  id="ordem-form"
                  className="space-y-6"
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

                  {/* Secao: Informacoes */}
                  <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                     <div
                        className="flex cursor-pointer items-center justify-between border-b border-slate-200 p-4"
                        onClick={(e) => toggleSection("basicInfo", e)}
                     >
                        <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700 uppercase">
                           <div className="h-4 w-1 rounded-full bg-blue-500"></div>
                           Informacoes
                        </h3>
                        {sections.basicInfo ? (
                           <HiChevronUp size={20} />
                        ) : (
                           <HiChevronDown size={20} />
                        )}
                     </div>
                     <div
                        className={clsx(
                           "grid transition-[grid-template-rows] duration-300 ease-in-out",
                           sections.basicInfo
                              ? "grid-rows-[1fr]"
                              : "grid-rows-[0fr]"
                        )}
                     >
                        <div className="overflow-hidden">
                           <div className="px-16 py-4">
                              <OrdemBasicInfo
                                 formData={formData}
                                 isEditable={isEditable}
                                 onUpdate={updateFormData}
                                 validationErrors={validationErrors}
                              />
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Secao: Tripulacao */}
                  <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                     <div
                        className="flex cursor-pointer items-center justify-between border-b border-slate-200 p-4"
                        onClick={(e) => toggleSection("tripulacao", e)}
                     >
                        <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700 uppercase">
                           <div className="h-4 w-1 rounded-full bg-green-500"></div>
                           Tripulacao
                        </h3>
                        {sections.tripulacao ? (
                           <HiChevronUp size={20} />
                        ) : (
                           <HiChevronDown size={20} />
                        )}
                     </div>
                     <div
                        className={clsx(
                           "grid transition-[grid-template-rows] duration-300 ease-in-out",
                           sections.tripulacao
                              ? "grid-rows-[1fr]"
                              : "grid-rows-[0fr]"
                        )}
                     >
                        <div className="overflow-hidden">
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
                     </div>
                  </div>

                  {/* Secao: Etapas */}
                  <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                     <div
                        className="flex cursor-pointer items-center justify-between border-b border-slate-200 p-4"
                        onClick={(e) => toggleSection("etapas", e)}
                     >
                        <div className="flex items-center gap-4">
                           <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700 uppercase">
                              <div className="h-4 w-1 rounded-full bg-amber-500"></div>
                              Etapas
                              <span className="text-red-500">*</span>
                           </h3>
                           {isEditable &&
                              !areEtapasOrdered() &&
                              formData.etapas.length > 1 && (
                                 <button
                                    type="button"
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       handleSortEtapas();
                                    }}
                                    className="group flex items-center gap-1.5 text-xs font-bold tracking-wider text-amber-600 uppercase transition-all hover:text-amber-700"
                                 >
                                    <HiSortAscending className="h-4 w-4 transition-transform group-hover:scale-110" />
                                    Ordenar
                                 </button>
                              )}
                        </div>
                        {sections.etapas ? (
                           <HiChevronUp size={20} />
                        ) : (
                           <HiChevronDown size={20} />
                        )}
                     </div>
                     <div
                        className={clsx(
                           "grid transition-[grid-template-rows] duration-300 ease-in-out",
                           sections.etapas
                              ? "grid-rows-[1fr]"
                              : "grid-rows-[0fr]"
                        )}
                     >
                        <div className="overflow-hidden">
                           <div className="space-y-6 p-4">
                              {formData.etapas.map((etapa, index) => (
                                 <OrdemEtapaItem
                                    key={index}
                                    etapa={etapa}
                                    index={index}
                                    isEditable={isEditable}
                                    canRemove={formData.etapas.length > 1}
                                    onChange={(field, value) =>
                                       handleEtapaChange(index, field, value)
                                    }
                                    onRemove={() => handleRemoveEtapa(index)}
                                    onInsertAfter={() =>
                                       handleInsertEtapa(index)
                                    }
                                 />
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Secao: Ordens Especiais */}
                  <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                     <div
                        className="flex cursor-pointer items-center justify-between border-b border-slate-200 p-4"
                        onClick={(e) => toggleSection("especiais", e)}
                     >
                        <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700 uppercase">
                           <div className="h-4 w-1 rounded-full bg-purple-500"></div>
                           Ordens Especiais
                        </h3>
                        {sections.especiais ? (
                           <HiChevronUp size={20} />
                        ) : (
                           <HiChevronDown size={20} />
                        )}
                     </div>
                     <div
                        className={clsx(
                           "grid transition-[grid-template-rows] duration-300 ease-in-out",
                           sections.especiais
                              ? "grid-rows-[1fr]"
                              : "grid-rows-[0fr]"
                        )}
                     >
                        <div className="overflow-hidden">
                           <div className="px-4 py-5">
                              <OrdemEspeciais
                                 campos={camposEspeciais}
                                 isEditable={isEditable}
                                 onUpdate={updateCamposEspeciais}
                              />
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Secao: Classificação (Etiquetas) */}
                  <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                     <div
                        className="flex cursor-pointer items-center justify-between border-b border-slate-200 p-4"
                        onClick={(e) => toggleSection("classificacao", e)}
                     >
                        <div className="flex items-center gap-4">
                           <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700 uppercase">
                              <div className="h-4 w-1 rounded-full bg-red-500"></div>
                              Classificação
                           </h3>
                           {isEditable && (
                              <button
                                 type="button"
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    setIsLabelManagerOpen(true);
                                 }}
                                 className="group flex items-center gap-1.5 text-xs font-bold tracking-wider text-red-600 uppercase transition-all hover:text-red-700"
                              >
                                 <HiTag className="h-4 w-4 transition-transform group-hover:scale-110" />
                                 Gerenciar
                              </button>
                           )}
                        </div>
                        {sections.classificacao ? (
                           <HiChevronUp size={20} />
                        ) : (
                           <HiChevronDown size={20} />
                        )}
                     </div>
                     <div
                        className={clsx(
                           "grid transition-[grid-template-rows] duration-300 ease-in-out",
                           sections.classificacao
                              ? "grid-rows-[1fr]"
                              : "grid-rows-[0fr]"
                        )}
                     >
                        <div className="overflow-hidden">
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
                     </div>
                  </div>
               </form>
            </div>
         </main>

         <LabelManager
            isOpen={isLabelManagerOpen}
            onClose={() => setIsLabelManagerOpen(false)}
            labels={allLabels}
            onRefresh={refreshLabels}
            onLabelDeleted={(id) => {
               const updatedLabels = (formData.etiquetas || []).filter(
                  (et) => et.id !== id
               );
               updateEtiquetas(updatedLabels);
            }}
         />
      </div>
   );
}
