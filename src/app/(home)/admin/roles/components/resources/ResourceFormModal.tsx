"use client";

import { useState, useEffect } from "react";
import {
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Button,
   Label,
   TextInput,
   Spinner,
} from "flowbite-react";
import type { Resource } from "services/routes/security/resources";

interface FormData {
   name: string;
   description: string;
}

interface FormErrors {
   name?: string;
   description?: string;
}

interface ResourceFormModalProps {
   show: boolean;
   editingResource: Resource | null;
   isSaving: boolean;
   onClose: () => void;
   onSubmit: (data: { name: string; description: string }) => void;
}

export function ResourceFormModal({
   show,
   editingResource,
   isSaving,
   onClose,
   onSubmit,
}: ResourceFormModalProps) {
   const [formData, setFormData] = useState<FormData>({
      name: "",
      description: "",
   });
   const [formErrors, setFormErrors] = useState<FormErrors>({});

   // Reset form when modal opens/closes or editing resource changes
   useEffect(() => {
      if (show) {
         setFormData({
            name: editingResource?.name || "",
            description: editingResource?.description || "",
         });
         setFormErrors({});
      }
   }, [show, editingResource]);

   const validateForm = (): boolean => {
      const errors: FormErrors = {};

      if (!formData.name.trim()) {
         errors.name = "Nome e obrigatorio";
      } else if (formData.name.trim().length < 2) {
         errors.name = "Nome deve ter pelo menos 2 caracteres";
      }

      if (!formData.description.trim()) {
         errors.description = "Descricao e obrigatoria";
      } else if (formData.description.trim().length < 3) {
         errors.description = "Descricao deve ter pelo menos 3 caracteres";
      }

      setFormErrors(errors);
      return Object.keys(errors).length === 0;
   };

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) return;

      onSubmit({
         name: formData.name.trim(),
         description: formData.description.trim(),
      });
   };

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      if (formErrors[name as keyof FormErrors]) {
         setFormErrors((prev) => ({ ...prev, [name]: undefined }));
      }
   };

   const handleClose = () => {
      if (!isSaving) onClose();
   };

   return (
      <Modal show={show} onClose={handleClose} size="md">
         <ModalHeader>
            {editingResource ? "Editar Recurso" : "Novo Recurso"}
         </ModalHeader>
         <form onSubmit={handleSubmit}>
            <ModalBody>
               <div className="space-y-4">
                  <div>
                     <Label htmlFor="resource-name">Nome</Label>
                     <TextInput
                        id="resource-name"
                        name="name"
                        type="text"
                        placeholder="Digite o nome do recurso"
                        value={formData.name}
                        onChange={handleInputChange}
                        color={formErrors.name ? "failure" : undefined}
                        autoFocus
                        aria-describedby={
                           formErrors.name ? "resource-name-error" : undefined
                        }
                        aria-invalid={!!formErrors.name}
                     />
                     {formErrors.name && (
                        <p
                           id="resource-name-error"
                           className="mt-1 text-sm text-red-600"
                           role="alert"
                        >
                           {formErrors.name}
                        </p>
                     )}
                  </div>

                  <div>
                     <Label htmlFor="resource-description">Descricao</Label>
                     <TextInput
                        id="resource-description"
                        name="description"
                        type="text"
                        placeholder="Digite a descricao do recurso"
                        value={formData.description}
                        onChange={handleInputChange}
                        color={formErrors.description ? "failure" : undefined}
                        aria-describedby={
                           formErrors.description
                              ? "resource-description-error"
                              : undefined
                        }
                        aria-invalid={!!formErrors.description}
                     />
                     {formErrors.description && (
                        <p
                           id="resource-description-error"
                           className="mt-1 text-sm text-red-600"
                           role="alert"
                        >
                           {formErrors.description}
                        </p>
                     )}
                  </div>
               </div>
            </ModalBody>
            <ModalFooter>
               <Button
                  type="submit"
                  color="blue"
                  disabled={isSaving}
                  aria-label={
                     editingResource ? "Atualizar recurso" : "Criar recurso"
                  }
               >
                  {isSaving ? (
                     <>
                        <Spinner color="info" size="sm" className="mr-2" />
                        Salvando...
                     </>
                  ) : editingResource ? (
                     "Atualizar"
                  ) : (
                     "Criar"
                  )}
               </Button>
               <Button color="gray" onClick={onClose} disabled={isSaving}>
                  Cancelar
               </Button>
            </ModalFooter>
         </form>
      </Modal>
   );
}
