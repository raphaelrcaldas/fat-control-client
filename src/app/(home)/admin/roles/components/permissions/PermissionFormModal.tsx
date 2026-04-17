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
   Select,
   Spinner,
} from "flowbite-react";
import type {
   Resource,
   PermissionDetail,
} from "services/routes/security/resources";

interface PermissionFormData {
   resource_id: number | "";
   name: string;
   description: string;
}

interface FormErrors {
   resource_id?: string;
   name?: string;
   description?: string;
}

interface PermissionFormModalProps {
   show: boolean;
   editingPermission: PermissionDetail | null;
   resources: Resource[];
   isSaving: boolean;
   onClose: () => void;
   onSubmit: (data: {
      resource_id: number;
      name: string;
      description: string;
   }) => void;
}

export function PermissionFormModal({
   show,
   editingPermission,
   resources,
   isSaving,
   onClose,
   onSubmit,
}: PermissionFormModalProps) {
   const [formData, setFormData] = useState<PermissionFormData>({
      resource_id: "",
      name: "",
      description: "",
   });
   const [formErrors, setFormErrors] = useState<FormErrors>({});

   // Reset form only when modal opens or the permission being edited changes.
   // `resources` is intentionally omitted: a refetch while the user is typing
   // must not reset the form.
   useEffect(() => {
      if (!show) return;
      if (editingPermission) {
         const resource = resources.find(
            (r) => r.name === editingPermission.resource
         );
         setFormData({
            resource_id: resource?.id || "",
            name: editingPermission.action,
            description: editingPermission.description,
         });
      } else {
         setFormData({ resource_id: "", name: "", description: "" });
      }
      setFormErrors({});
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [show, editingPermission?.id]);

   const validateForm = (): boolean => {
      const errors: FormErrors = {};

      if (!formData.resource_id) {
         errors.resource_id = "Selecione um recurso";
      }

      if (!formData.name.trim()) {
         errors.name = "Nome da acao e obrigatorio";
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
         resource_id: formData.resource_id as number,
         name: formData.name.trim(),
         description: formData.description.trim(),
      });
   };

   const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
   ) => {
      const { name, value } = e.target;

      if (name === "resource_id") {
         setFormData((prev) => ({
            ...prev,
            resource_id: value ? Number(value) : "",
         }));
      } else {
         setFormData((prev) => ({ ...prev, [name]: value }));
      }

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
            {editingPermission ? "Editar Permissao" : "Nova Permissao"}
         </ModalHeader>
         <form onSubmit={handleSubmit}>
            <ModalBody>
               <div className="space-y-4">
                  <div>
                     <Label htmlFor="permission-resource">Recurso</Label>
                     <Select
                        id="permission-resource"
                        name="resource_id"
                        value={formData.resource_id}
                        onChange={handleInputChange}
                        disabled={!!editingPermission}
                        color={formErrors.resource_id ? "failure" : undefined}
                        aria-describedby={
                           formErrors.resource_id
                              ? "permission-resource-error"
                              : editingPermission
                                ? "permission-resource-hint"
                                : undefined
                        }
                        aria-invalid={!!formErrors.resource_id}
                     >
                        <option value="">Selecione um recurso</option>
                        {resources.map((resource) => (
                           <option key={resource.id} value={resource.id}>
                              {resource.name}
                           </option>
                        ))}
                     </Select>
                     {formErrors.resource_id && (
                        <p
                           id="permission-resource-error"
                           className="mt-1 text-sm text-red-600"
                           role="alert"
                        >
                           {formErrors.resource_id}
                        </p>
                     )}
                     {editingPermission && (
                        <p
                           id="permission-resource-hint"
                           className="mt-1 text-sm text-gray-500 dark:text-gray-400"
                        >
                           O recurso nao pode ser alterado
                        </p>
                     )}
                  </div>

                  <div>
                     <Label htmlFor="permission-name">Nome da Acao</Label>
                     <TextInput
                        id="permission-name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="ex: create, read, update, delete"
                        color={formErrors.name ? "failure" : undefined}
                        autoFocus={!editingPermission}
                        aria-describedby={
                           formErrors.name ? "permission-name-error" : undefined
                        }
                        aria-invalid={!!formErrors.name}
                     />
                     {formErrors.name && (
                        <p
                           id="permission-name-error"
                           className="mt-1 text-sm text-red-600"
                           role="alert"
                        >
                           {formErrors.name}
                        </p>
                     )}
                  </div>

                  <div>
                     <Label htmlFor="permission-description">Descricao</Label>
                     <TextInput
                        id="permission-description"
                        name="description"
                        type="text"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Descreva a permissao"
                        color={formErrors.description ? "failure" : undefined}
                        aria-describedby={
                           formErrors.description
                              ? "permission-description-error"
                              : undefined
                        }
                        aria-invalid={!!formErrors.description}
                     />
                     {formErrors.description && (
                        <p
                           id="permission-description-error"
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
                     editingPermission
                        ? "Atualizar permissao"
                        : "Criar permissao"
                  }
               >
                  {isSaving ? (
                     <>
                        <Spinner color="info" size="sm" className="mr-2" />
                        Salvando...
                     </>
                  ) : editingPermission ? (
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
