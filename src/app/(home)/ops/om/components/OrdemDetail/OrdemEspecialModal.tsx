"use client";

import { useState, useEffect } from "react";
import {
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Button,
   Label,
} from "flowbite-react";
import { HiDocumentText } from "react-icons/hi";
import clsx from "clsx";
import type { CampoEspecial } from "services/routes/om/ordens";

interface OrdemEspecialModalProps {
   isOpen: boolean;
   onClose: () => void;
   onSave: (campo: CampoEspecial) => void;
   campo: CampoEspecial | null; // null = novo campo
   campoIndex: number | null; // null = adicionar, >= 0 = editar
}

export function OrdemEspecialModal({
   isOpen,
   onClose,
   onSave,
   campo,
   campoIndex,
}: OrdemEspecialModalProps) {
   const isEditing = campoIndex !== null && campo !== null;
   const modalTitle = isEditing
      ? `Editar Ordem Especial`
      : "Nova Ordem Especial";

   // Estado local do formulário
   const [formData, setFormData] = useState<CampoEspecial>({
      label: "",
      valor: "",
   });

   // Inicializar formulário quando modal abre
   useEffect(() => {
      if (!isOpen) return;

      if (isEditing && campo) {
         setFormData({ ...campo });
      } else {
         setFormData({ label: "", valor: "" });
      }
   }, [isOpen, isEditing, campo]);

   // Validação
   const isValorEmpty = !formData.valor.trim();
   const cannotSave = isValorEmpty;

   const handleSave = () => {
      if (cannotSave) return;
      onSave({
         label: formData.label.trim(),
         valor: formData.valor.trim(),
      });
      onClose();
   };

   const inputBaseClass =
      "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-transparent focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50";

   return (
      <Modal show={isOpen} onClose={onClose} dismissible size="lg">
         <ModalHeader>
            <div className="flex items-center gap-2">
               <HiDocumentText className="h-5 w-5 text-purple-500" />
               {modalTitle}
            </div>
         </ModalHeader>

         <ModalBody>
            <div className="space-y-4">
               {/* Campo: Label */}
               <div>
                  <Label
                     htmlFor="campo_label"
                     className="mb-2 block text-sm font-medium text-gray-700"
                  >
                     Nome do Campo
                  </Label>
                  <input
                     type="text"
                     id="campo_label"
                     value={formData.label}
                     onChange={(e) =>
                        setFormData((prev) => ({
                           ...prev,
                           label: e.target.value,
                        }))
                     }
                     placeholder="Ex: Observação, Autorização, etc."
                     autoFocus
                     className={clsx(
                        inputBaseClass,
                        "border-gray-300 focus:ring-purple-500"
                     )}
                  />
               </div>

               {/* Campo: Valor */}
               <div>
                  <Label
                     htmlFor="campo_valor"
                     className="mb-2 block text-sm font-medium text-gray-700"
                  >
                     Valor <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                     id="campo_valor"
                     value={formData.valor}
                     onChange={(e) =>
                        setFormData((prev) => ({
                           ...prev,
                           valor: e.target.value,
                        }))
                     }
                     placeholder="Digite o valor do campo..."
                     rows={4}
                     className={clsx(
                        inputBaseClass,
                        "resize-none",
                        isValorEmpty
                           ? "border-red-300 focus:ring-red-500"
                           : "border-gray-300 focus:ring-purple-500"
                     )}
                  />
                  {isValorEmpty && (
                     <span className="mt-1 text-xs text-red-500">
                        Obrigatório
                     </span>
                  )}
               </div>
            </div>
         </ModalBody>

         <ModalFooter>
            <div className="flex w-full justify-end gap-3">
               <Button color="gray" onClick={onClose}>
                  Cancelar
               </Button>
               <Button
                  color="purple"
                  onClick={handleSave}
                  disabled={cannotSave}
               >
                  {isEditing ? "Salvar Alterações" : "Adicionar"}
               </Button>
            </div>
         </ModalFooter>
      </Modal>
   );
}
