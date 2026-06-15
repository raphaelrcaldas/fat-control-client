"use client";

import { useState } from "react";
import {
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Button,
   TextInput,
} from "flowbite-react";
import { HiTrash } from "react-icons/hi";
import { MdBadge } from "react-icons/md";
import type { TripCartoesOut } from "services/routes/instrucao/cartoes";
import { useCartaoForm } from "../hooks/useCartaoForm";
import SectionTitle from "./SectionTitle";
import Field from "./Field";
import LangFieldGroup from "./LangFieldGroup";
import DeleteCartaoConfirmModal from "./DeleteCartaoConfirmModal";

interface EditCartoesDrawerProps {
   show: boolean;
   onClose: () => void;
   item: TripCartoesOut;
}

const PROVA_FIELDS = [
   { name: "ptai_validade", label: "PTAI" },
   { name: "tai_s_validade", label: "TAI S" },
   { name: "tai_s1_validade", label: "TAI S1" },
   { name: "cvi_validade", label: "CVI" },
] as const;

export default function EditCartoesDrawer({
   show,
   onClose,
   item,
}: EditCartoesDrawerProps) {
   const {
      formData,
      handleInput,
      handleSave,
      handleDelete,
      isEdit,
      isSaving,
      isDeleting,
   } = useCartaoForm(item, onClose);

   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

   const handleConfirmDelete = async () => {
      await handleDelete();
      setShowDeleteConfirm(false);
   };

   return (
      <>
         <Modal show={show} onClose={onClose} size="lg" dismissible>
            <ModalHeader>
               <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-red-600">
                     <MdBadge className="h-5 w-5 text-white" />
                  </div>
                  <div>
                     <p className="text-base font-semibold text-gray-900">
                        {item.p_g.toUpperCase()}{" "}
                        {item.nome_guerra.toUpperCase()}
                     </p>
                     <p className="text-sm font-normal text-gray-400">
                        {isEdit ? "Editar cartão" : "Cadastrar cartão"}
                     </p>
                  </div>
               </div>
            </ModalHeader>

            <ModalBody>
               <div className="space-y-6">
                  {/* Provas e validações */}
                  <div className="rounded border border-slate-200 bg-gray-50 p-4 shadow-sm">
                     <SectionTitle>Provas e validações</SectionTitle>
                     <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {PROVA_FIELDS.map((f) => (
                           <Field key={f.name} id={f.name} label={f.label}>
                              <TextInput
                                 id={f.name}
                                 name={f.name}
                                 type="date"
                                 value={formData[f.name]}
                                 onChange={handleInput}
                                 sizing="sm"
                              />
                           </Field>
                        ))}
                     </div>
                  </div>

                  <LangFieldGroup
                     title="Espanhol"
                     levelName="hab_espanhol"
                     levelValue={formData.hab_espanhol}
                     validadeName="val_espanhol"
                     validadeValue={formData.val_espanhol}
                     onChange={handleInput}
                  />

                  <LangFieldGroup
                     title="Inglês"
                     levelName="hab_ingles"
                     levelValue={formData.hab_ingles}
                     validadeName="val_ingles"
                     validadeValue={formData.val_ingles}
                     onChange={handleInput}
                  />
               </div>
            </ModalBody>

            <ModalFooter>
               <div className="flex w-full items-center justify-between">
                  {isEdit ? (
                     <Button
                        color="red"
                        outline
                        size="sm"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isSaving}
                     >
                        <HiTrash className="mr-1.5 h-4 w-4" />
                        Remover cadastro
                     </Button>
                  ) : (
                     <span />
                  )}
                  <div className="flex gap-2">
                     <Button color="gray" onClick={onClose} disabled={isSaving}>
                        Cancelar
                     </Button>
                     <Button
                        color="red"
                        onClick={handleSave}
                        disabled={isSaving}
                     >
                        {isSaving
                           ? "Salvando..."
                           : isEdit
                             ? "Atualizar"
                             : "Cadastrar"}
                     </Button>
                  </div>
               </div>
            </ModalFooter>
         </Modal>

         <DeleteCartaoConfirmModal
            show={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={handleConfirmDelete}
            isDeleting={isDeleting}
            nomeGuerra={item.nome_guerra}
         />
      </>
   );
}
