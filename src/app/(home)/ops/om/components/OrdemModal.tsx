"use client";

import { useState } from "react";
import {
   Button,
   Modal,
   ModalBody,
   ModalFooter,
   ModalHeader,
} from "flowbite-react";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";
import clsx from "clsx";
import { OrdemMissao } from "../types";
import {
   OrdemBasicInfo,
   OrdemTripulacao,
   OrdemEspeciais,
   OrdemEtapaItem,
   useOrdemForm,
} from "./OrdemModal/";

interface OrdemModalProps {
   ordem: OrdemMissao | null;
   onSave: (ordem: OrdemMissao) => void;
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
   } = useOrdemForm({ ordem, isNew, isCloning, onSave });

   const handleClose = () => {
      resetForm();
      setSections({
         basicInfo: true,
         tripulacao: true,
         etapas: true,
         especiais: true,
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
   });

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
         const modalBody =
            section?.closest('[class*="modal-body"]') ??
            section?.closest(".overflow-y-auto");

         if (section && modalBody) {
            setTimeout(() => {
               modalBody.scrollTo({
                  top: section.offsetTop - 16,
                  behavior: "smooth",
               });
            }, 50);
         }
      }
   };

   return (
      <Modal show={isOpen} onClose={handleClose} size="7xl" dismissible>
         <ModalHeader>
            {isCloning
               ? "Clonar Ordem de Missão"
               : isNew
                 ? "Nova Ordem de Missão"
                 : "Editar Ordem de Missão"}
            {!isNew && !isCloning && (
               <p className="mt-1 font-mono text-sm text-gray-500">
                  {formData.numero}
               </p>
            )}
            {isCloning && ordem && (
               <p className="mt-1 text-sm text-gray-500">
                  Baseado em: <span className="font-mono">{ordem.numero}</span>
               </p>
            )}
         </ModalHeader>
         <ModalBody>
            <form onSubmit={handleSubmit} id="ordem-form" className="space-y-6">
               {!isEditable && (
                  <div className="rounded-lg border border-gray-300 bg-gray-100 px-3 py-1.5 text-center text-xs font-bold tracking-wider text-gray-700 uppercase">
                     🔒 Somente Leitura
                  </div>
               )}

               <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 shadow-sm">
                  <div
                     className="flex items-center justify-between border-b border-slate-200 p-4"
                     onClick={(e) => toggleSection("basicInfo", e)}
                  >
                     <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700 uppercase">
                        <div className="h-4 w-1 rounded-full bg-blue-500"></div>
                        Informações
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
                        <div className="p-4">
                           <OrdemBasicInfo
                              formData={formData}
                              isEditable={isEditable}
                              onUpdate={updateFormData}
                           />
                        </div>
                     </div>
                  </div>
               </div>

               <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 shadow-sm">
                  <div
                     className="flex items-center justify-between border-b border-slate-200 p-4"
                     onClick={(e) => toggleSection("tripulacao", e)}
                  >
                     <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700 uppercase">
                        <div className="h-4 w-1 rounded-full bg-green-500"></div>
                        Tripulação
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
                           />
                        </div>
                     </div>
                  </div>
               </div>

               <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 shadow-sm">
                  <div
                     className="flex items-center justify-between border-b border-slate-200 p-4"
                     onClick={(e) => toggleSection("etapas", e)}
                  >
                     <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700 uppercase">
                        <div className="h-4 w-1 rounded-full bg-amber-500"></div>
                        Etapas
                     </h3>

                     {sections.etapas ? (
                        <HiChevronUp size={20} />
                     ) : (
                        <HiChevronDown size={20} />
                     )}
                  </div>
                  <div
                     className={clsx(
                        "grid transition-[grid-template-rows] duration-300 ease-in-out",
                        sections.etapas ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
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
                                 onInsertAfter={() => handleInsertEtapa(index)}
                              />
                           ))}
                        </div>
                     </div>
                  </div>
               </div>

               <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 shadow-sm">
                  <div
                     className="flex items-center justify-between border-b border-slate-200 p-4"
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
                        <div className="p-4">
                           <OrdemEspeciais
                              campos={camposEspeciais}
                              isEditable={isEditable}
                              onUpdate={updateCamposEspeciais}
                           />
                        </div>
                     </div>
                  </div>
               </div>
            </form>
         </ModalBody>
         <ModalFooter className="flex justify-end gap-3">
            <Button color="gray" onClick={handleClose}>
               Cancelar
            </Button>
            {isEditable && (
               <>
                  <Button
                     color="light"
                     type="submit"
                     form="ordem-form"
                     disabled={hasCamposEspeciaisVazios}
                  >
                     Salvar Rascunho
                  </Button>
                  <Button
                     color="red"
                     type="button"
                     onClick={handleElaborar}
                     disabled={hasCamposEspeciaisVazios}
                  >
                     Aprovar
                  </Button>
               </>
            )}
         </ModalFooter>
      </Modal>
   );
}
