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
import type {
   Organizacao,
   OrganizacaoCreate,
} from "services/routes/organizacoes";

interface FormData {
   sigla: string;
   sigla_2: string;
   sigla_3: string;
   nome: string;
   alias: string;
}

interface FormErrors {
   sigla?: string;
   sigla_2?: string;
   sigla_3?: string;
   nome?: string;
   alias?: string;
}

interface OrganizacaoFormModalProps {
   show: boolean;
   editingOrg: Organizacao | null;
   isSaving: boolean;
   onClose: () => void;
   onSubmit: (data: OrganizacaoCreate) => void;
}

export function OrganizacaoFormModal({
   show,
   editingOrg,
   isSaving,
   onClose,
   onSubmit,
}: OrganizacaoFormModalProps) {
   const [formData, setFormData] = useState<FormData>({
      sigla: "",
      sigla_2: "",
      sigla_3: "",
      nome: "",
      alias: "",
   });
   const [formErrors, setFormErrors] = useState<FormErrors>({});

   useEffect(() => {
      if (show) {
         setFormData({
            sigla: editingOrg?.sigla || "",
            sigla_2: editingOrg?.sigla_2 || "",
            sigla_3: editingOrg?.sigla_3 || "",
            nome: editingOrg?.nome || "",
            alias: editingOrg?.alias || "",
         });
         setFormErrors({});
      }
   }, [show, editingOrg]);

   const validateForm = (): boolean => {
      const errors: FormErrors = {};

      if (!formData.sigla.trim()) {
         errors.sigla = "Sigla é obrigatória";
      } else if (formData.sigla.trim().length > 20) {
         errors.sigla = "Sigla deve ter no máximo 20 caracteres";
      }

      if (formData.sigla_2.trim().length > 20) {
         errors.sigla_2 = "Sigla 2 deve ter no máximo 20 caracteres";
      }

      if (formData.sigla_3.trim().length > 20) {
         errors.sigla_3 = "Sigla 3 deve ter no máximo 20 caracteres";
      }

      if (!formData.nome.trim()) {
         errors.nome = "Nome é obrigatório";
      } else if (formData.nome.trim().length > 150) {
         errors.nome = "Nome deve ter no máximo 150 caracteres";
      }

      if (formData.alias.trim().length > 100) {
         errors.alias = "Codinome deve ter no máximo 100 caracteres";
      }

      setFormErrors(errors);
      return Object.keys(errors).length === 0;
   };

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) return;

      onSubmit({
         sigla: formData.sigla.trim(),
         sigla_2: formData.sigla_2.trim() || null,
         sigla_3: formData.sigla_3.trim() || null,
         nome: formData.nome.trim(),
         alias: formData.alias.trim() || null,
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
            {editingOrg ? "Editar Organização" : "Nova Organização"}
         </ModalHeader>
         <form onSubmit={handleSubmit}>
            <ModalBody>
               <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                     <div>
                        <Label htmlFor="org-sigla">Sigla (código)</Label>
                        <TextInput
                           id="org-sigla"
                           name="sigla"
                           type="text"
                           placeholder="Ex: 11gt"
                           value={formData.sigla}
                           onChange={handleInputChange}
                           color={formErrors.sigla ? "failure" : undefined}
                           autoFocus={!editingOrg}
                           disabled={!!editingOrg}
                           aria-invalid={!!formErrors.sigla}
                        />
                        {formErrors.sigla ? (
                           <p
                              className="mt-1 text-sm text-red-600"
                              role="alert"
                           >
                              {formErrors.sigla}
                           </p>
                        ) : (
                           editingOrg && (
                              <p className="mt-1 text-xs text-gray-500">
                                 Identificador fixo após a criação.
                              </p>
                           )
                        )}
                     </div>

                     <div>
                        <Label htmlFor="org-sigla-2">Sigla 2 (opcional)</Label>
                        <TextInput
                           id="org-sigla-2"
                           name="sigla_2"
                           type="text"
                           placeholder="Ex: 1gt1"
                           value={formData.sigla_2}
                           onChange={handleInputChange}
                           color={formErrors.sigla_2 ? "failure" : undefined}
                           aria-invalid={!!formErrors.sigla_2}
                        />
                        {formErrors.sigla_2 && (
                           <p
                              className="mt-1 text-sm text-red-600"
                              role="alert"
                           >
                              {formErrors.sigla_2}
                           </p>
                        )}
                     </div>

                     <div>
                        <Label htmlFor="org-sigla-3">Sigla 3 (opcional)</Label>
                        <TextInput
                           id="org-sigla-3"
                           name="sigla_3"
                           type="text"
                           placeholder="Ex: 1º/1º GT"
                           value={formData.sigla_3}
                           onChange={handleInputChange}
                           color={formErrors.sigla_3 ? "failure" : undefined}
                           aria-invalid={!!formErrors.sigla_3}
                        />
                        {formErrors.sigla_3 && (
                           <p
                              className="mt-1 text-sm text-red-600"
                              role="alert"
                           >
                              {formErrors.sigla_3}
                           </p>
                        )}
                     </div>
                  </div>

                  <div>
                     <Label htmlFor="org-nome">Nome</Label>
                     <TextInput
                        id="org-nome"
                        name="nome"
                        type="text"
                        placeholder="Nome completo da organização"
                        value={formData.nome}
                        onChange={handleInputChange}
                        color={formErrors.nome ? "failure" : undefined}
                        aria-invalid={!!formErrors.nome}
                     />
                     {formErrors.nome && (
                        <p className="mt-1 text-sm text-red-600" role="alert">
                           {formErrors.nome}
                        </p>
                     )}
                  </div>

                  <div>
                     <Label htmlFor="org-alias">Codinome (opcional)</Label>
                     <TextInput
                        id="org-alias"
                        name="alias"
                        type="text"
                        placeholder="Ex: Esquadrão Pelicano"
                        value={formData.alias}
                        onChange={handleInputChange}
                        color={formErrors.alias ? "failure" : undefined}
                        aria-invalid={!!formErrors.alias}
                     />
                     {formErrors.alias && (
                        <p className="mt-1 text-sm text-red-600" role="alert">
                           {formErrors.alias}
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
                     editingOrg ? "Atualizar organização" : "Criar organização"
                  }
               >
                  {isSaving ? (
                     <>
                        <Spinner color="info" size="sm" className="mr-2" />
                        Salvando...
                     </>
                  ) : editingOrg ? (
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
