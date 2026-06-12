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
import clsx from "clsx";
import type {
   Resource,
   PermissionDetail,
} from "services/routes/security/resources";
import { getActionChipTheme } from "@/constants/admin/roles";

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
   /** Ações já existentes no sistema, oferecidas como chips de preenchimento */
   actionSuggestions: string[];
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
   actionSuggestions,
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
         errors.name = "Nome da ação é obrigatório";
      } else if (formData.name.trim().length < 2) {
         errors.name = "Nome deve ter pelo menos 2 caracteres";
      }

      if (!formData.description.trim()) {
         errors.description = "Descrição é obrigatória";
      } else if (formData.description.trim().length < 3) {
         errors.description = "Descrição deve ter pelo menos 3 caracteres";
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

   const handleSelectAction = (action: string) => {
      setFormData((prev) => ({ ...prev, name: action }));
      setFormErrors((prev) => ({ ...prev, name: undefined }));
   };

   const handleClose = () => {
      if (!isSaving) onClose();
   };

   return (
      <Modal show={show} onClose={handleClose} size="md">
         <ModalHeader>
            {editingPermission ? "Editar Permissão" : "Nova Permissão"}
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
                           O recurso não pode ser alterado
                        </p>
                     )}
                  </div>

                  <div>
                     <Label>Ação</Label>
                     {actionSuggestions.length > 0 ? (
                        <div
                           role="radiogroup"
                           aria-label="Ação"
                           aria-invalid={!!formErrors.name}
                           className="mt-1.5 grid auto-cols-fr grid-flow-col gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-600 dark:bg-gray-700/40"
                        >
                           {actionSuggestions.map((action) => {
                              const active = formData.name === action;
                              const chip = getActionChipTheme(action);
                              return (
                                 <button
                                    key={action}
                                    type="button"
                                    role="radio"
                                    aria-checked={active}
                                    onClick={() => handleSelectAction(action)}
                                    className={clsx(
                                       "rounded-md border px-2 py-1.5 text-center font-mono text-sm font-medium transition-colors",
                                       active
                                          ? clsx(
                                               chip.bg,
                                               chip.text,
                                               chip.border
                                            )
                                          : "border-transparent text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-gray-700"
                                    )}
                                 >
                                    {action}
                                 </button>
                              );
                           })}
                        </div>
                     ) : (
                        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                           Nenhuma ação disponível.
                        </p>
                     )}
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
                     <Label htmlFor="permission-description">Descrição</Label>
                     <TextInput
                        id="permission-description"
                        name="description"
                        type="text"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Descreva a permissão"
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
                  color="red"
                  disabled={isSaving}
                  aria-label={
                     editingPermission
                        ? "Atualizar permissão"
                        : "Criar permissão"
                  }
               >
                  {isSaving ? (
                     <>
                        <Spinner color="failure" size="sm" className="mr-2" />
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
