"use client";

import { useState, useEffect, useMemo } from "react";
import {
   Modal,
   ModalHeader,
   ModalBody,
   Button,
   Label,
   TextInput,
   Textarea,
   Spinner,
} from "flowbite-react";
import { useToast } from "@/app/context/toast";
import { useCreateMissao, useUpdateMissao } from "@/hooks/queries/useEtapas";
import type { MissaoComEtapas } from "services/routes/estatistica/etapas";

interface MissaoFormModalProps {
   show: boolean;
   onClose: () => void;
   editingMissao: MissaoComEtapas | null;
}

interface MissaoFormData {
   titulo: string;
   obs: string;
}

type FormErrors = Partial<Record<keyof MissaoFormData, string>>;

const defaultFormValues: MissaoFormData = {
   titulo: "",
   obs: "",
};

export function MissaoFormModal({
   show,
   onClose,
   editingMissao,
}: MissaoFormModalProps) {
   const isEditMode = !!editingMissao;
   const { push } = useToast();
   const createMutation = useCreateMissao();
   const updateMutation = useUpdateMissao();

   const [formData, setFormData] = useState<MissaoFormData>(defaultFormValues);
   const [errors, setErrors] = useState<FormErrors>({});

   useEffect(() => {
      if (show) {
         if (editingMissao) {
            setFormData({
               titulo: editingMissao.titulo || "",
               obs: editingMissao.obs || "",
            });
         } else {
            setFormData(defaultFormValues);
         }
         setErrors({});
      }
   }, [show, editingMissao]);

   const isSubmitting = createMutation.isPending || updateMutation.isPending;

   const hasChanges = useMemo(() => {
      if (!isEditMode) return formData.titulo.trim().length > 0;
      if (!editingMissao) return false;
      return (
         formData.titulo !== (editingMissao.titulo || "") ||
         formData.obs !== (editingMissao.obs || "")
      );
   }, [formData, editingMissao, isEditMode]);

   function updateField(field: keyof MissaoFormData, value: string) {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
         const next = { ...prev };
         delete next[field];
         return next;
      });
   }

   async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();

      const fieldErrors: FormErrors = {};

      if (!isEditMode && !formData.titulo.trim()) {
         fieldErrors.titulo = "Informe o titulo da missao";
      }

      if (Object.keys(fieldErrors).length > 0) {
         setErrors(fieldErrors);
         return;
      }

      try {
         if (isEditMode) {
            const updateData: Record<string, unknown> = {};
            if (formData.titulo !== (editingMissao!.titulo || ""))
               updateData.titulo = formData.titulo || null;
            if (formData.obs !== (editingMissao!.obs || ""))
               updateData.obs = formData.obs || null;

            const res = await updateMutation.mutateAsync({
               id: editingMissao!.id,
               data: updateData,
            });

            push({
               title: "Sucesso!",
               message: res.message || "Missão atualizada com sucesso",
               type: res.ok ? "success" : "error",
            });

            if (res.ok) onClose();
         } else {
            const res = await createMutation.mutateAsync({
               titulo: formData.titulo || null,
               obs: formData.obs || null,
            });

            push({
               title: "Sucesso!",
               message: res.message || "Missão criada com sucesso",
               type: res.ok ? "success" : "error",
            });

            if (res.ok) onClose();
         }
      } catch (err: unknown) {
         push({
            title: "Erro",
            message:
               err instanceof Error ? err.message : "Erro ao salvar missão",
            type: "error",
         });
      }
   }

   return (
      <Modal show={show} size="lg" onClose={onClose} dismissible>
         <ModalHeader>
            {isEditMode
               ? `Editar Missão #${editingMissao?.id}`
               : "Cadastrar Nova Missão"}
         </ModalHeader>
         <ModalBody>
            <form onSubmit={handleSubmit} className="space-y-5">
               {/* Titulo */}
               <div>
                  <Label
                     htmlFor="titulo"
                     className="mb-2 block text-sm font-semibold"
                  >
                     Título
                  </Label>
                  <TextInput
                     id="titulo"
                     type="text"
                     placeholder="Título da missão"
                     value={formData.titulo}
                     onChange={(e) => updateField("titulo", e.target.value)}
                     color={errors.titulo ? "failure" : "gray"}
                  />
                  {errors.titulo && (
                     <p className="mt-1 text-sm text-red-600">
                        {errors.titulo}
                     </p>
                  )}
               </div>

               {/* Observacoes */}
               <div>
                  <Label
                     htmlFor="obs"
                     className="mb-2 block text-sm font-semibold"
                  >
                     Observações
                  </Label>
                  <Textarea
                     id="obs"
                     className="placeholder:text-slate-400"
                     placeholder="Observações..."
                     rows={3}
                     value={formData.obs}
                     onChange={(e) => updateField("obs", e.target.value)}
                  />
               </div>

               {/* Botoes */}
               <div className="flex justify-center gap-3 border-t border-gray-200 pt-4">
                  <Button
                     color="gray"
                     onClick={onClose}
                     disabled={isSubmitting}
                  >
                     Cancelar
                  </Button>
                  <Button
                     type="submit"
                     color="red"
                     disabled={!hasChanges || isSubmitting}
                  >
                     {isSubmitting ? (
                        <div className="flex items-center gap-2">
                           <Spinner size="sm" color="failure" />
                           <span>Salvando...</span>
                        </div>
                     ) : isEditMode ? (
                        "Salvar Alterações"
                     ) : (
                        "Cadastrar"
                     )}
                  </Button>
               </div>
            </form>
         </ModalBody>
      </Modal>
   );
}
