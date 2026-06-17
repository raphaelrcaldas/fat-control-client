"use client";

import { useState, useMemo, useCallback } from "react";
import { useToast } from "../../../../context/toast";
import {
   useCreateDiariaValor,
   useUpdateDiariaValor,
   useDeleteDiariaValor,
} from "@/hooks/queries";
import { type DiariaValorPublic } from "services/routes/cegep/diarias";
import { type DiariaFormData, INITIAL_FORM_DATA } from "../types";
import {
   diariaFormSchema,
   type DiariaFormErrors,
} from "../schemas/diariaFormSchema";

interface UseDiariaFormReturn {
   // Modal state
   showModal: boolean;
   showDeleteModal: boolean;
   isCreating: boolean;
   editingValor: DiariaValorPublic | null;
   deletingId: number | null;

   // Form state
   formData: DiariaFormData;
   setFormData: React.Dispatch<React.SetStateAction<DiariaFormData>>;
   hasChanges: boolean;
   isSubmitting: boolean;
   isDeleting: boolean;
   errors: DiariaFormErrors;

   // Actions
   handleOpenModal: (valor: DiariaValorPublic) => void;
   handleOpenCreateModal: () => void;
   handleCloseModal: () => void;
   handleOpenDeleteModal: (id: number) => void;
   handleCloseDeleteModal: () => void;
   handleSubmit: (e: React.FormEvent) => Promise<void>;
   handleConfirmDelete: () => Promise<void>;
   clearFieldError: (field: keyof DiariaFormErrors) => void;
   updateField: (field: keyof DiariaFormData, value: string | number) => void;
}

export function useDiariaForm(): UseDiariaFormReturn {
   const [showModal, setShowModal] = useState(false);
   const [editingValor, setEditingValor] = useState<DiariaValorPublic | null>(
      null
   );
   const [isCreating, setIsCreating] = useState(false);
   const [formData, setFormData] = useState<DiariaFormData>(INITIAL_FORM_DATA);
   const [errors, setErrors] = useState<DiariaFormErrors>({});

   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [deletingId, setDeletingId] = useState<number | null>(null);

   const { push } = useToast();

   // React Query mutations
   const createMutation = useCreateDiariaValor();
   const updateMutation = useUpdateDiariaValor();
   const deleteMutation = useDeleteDiariaValor();

   const clearFieldError = useCallback((field: keyof DiariaFormErrors) => {
      setErrors((prev) => {
         const next = { ...prev };
         delete next[field];
         return next;
      });
   }, []);

   const updateField = useCallback(
      (field: keyof DiariaFormData, value: string | number) => {
         setFormData((prev) => ({ ...prev, [field]: value }));
         clearFieldError(field as keyof DiariaFormErrors);
      },
      [clearFieldError]
   );

   const handleOpenModal = useCallback((valor: DiariaValorPublic) => {
      setEditingValor(valor);
      setIsCreating(false);
      setFormData({
         valor: String(valor.valor),
         data_inicio: valor.data_inicio,
         data_fim: valor.data_fim || "",
         grupo_cid: valor.grupo_cid,
         grupo_pg: valor.grupo_pg,
      });
      setErrors({});
      setShowModal(true);
   }, []);

   const handleOpenCreateModal = useCallback(() => {
      setEditingValor(null);
      setIsCreating(true);
      setFormData(INITIAL_FORM_DATA);
      setErrors({});
      setShowModal(true);
   }, []);

   const handleCloseModal = useCallback(() => {
      setShowModal(false);
      setEditingValor(null);
      setIsCreating(false);
      setFormData(INITIAL_FORM_DATA);
      setErrors({});
   }, []);

   const hasChanges = useMemo(() => {
      if (isCreating) return true;
      if (!editingValor) return false;
      return (
         formData.valor !== String(editingValor.valor) ||
         formData.data_inicio !== editingValor.data_inicio ||
         formData.data_fim !== (editingValor.data_fim || "")
      );
   }, [formData, editingValor, isCreating]);

   const validateForm = useCallback((): boolean => {
      const result = diariaFormSchema.safeParse(formData);

      if (!result.success) {
         const fieldErrors: DiariaFormErrors = {};
         // Zod v4 usa 'issues' ao inves de 'errors'
         result.error.issues.forEach((issue) => {
            const field = issue.path[0] as keyof DiariaFormErrors;
            if (!fieldErrors[field]) {
               fieldErrors[field] = issue.message;
            }
         });
         setErrors(fieldErrors);
         return false;
      }

      setErrors({});
      return true;
   }, [formData]);

   const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
         e.preventDefault();

         if (!validateForm()) {
            return;
         }

         const valorNumerico = parseFloat(formData.valor.replace(",", "."));

         try {
            if (isCreating) {
               await createMutation.mutateAsync({
                  valor: valorNumerico,
                  data_inicio: formData.data_inicio,
                  data_fim: formData.data_fim || null,
                  grupo_cid: formData.grupo_cid,
                  grupo_pg: formData.grupo_pg,
               });
               push({
                  title: "Sucesso!",
                  message: "Diaria criada com sucesso",
                  type: "success",
               });
            } else {
               if (!editingValor) return;
               await updateMutation.mutateAsync({
                  id: editingValor.id,
                  data: {
                     valor: valorNumerico,
                     data_inicio: formData.data_inicio,
                     data_fim: formData.data_fim || null,
                  },
               });
               push({
                  title: "Sucesso!",
                  message: "Valor atualizado com sucesso",
                  type: "success",
               });
            }

            handleCloseModal();
         } catch (err: unknown) {
            push({
               title: "Erro",
               message: err instanceof Error ? err.message : "Erro ao salvar",
               type: "error",
            });
         }
      },
      [
         validateForm,
         isCreating,
         formData,
         editingValor,
         createMutation,
         updateMutation,
         push,
         handleCloseModal,
      ]
   );

   const handleOpenDeleteModal = useCallback((id: number) => {
      setDeletingId(id);
      setShowDeleteModal(true);
   }, []);

   const handleCloseDeleteModal = useCallback(() => {
      setShowDeleteModal(false);
      setDeletingId(null);
   }, []);

   const handleConfirmDelete = useCallback(async () => {
      if (!deletingId) return;

      try {
         await deleteMutation.mutateAsync(deletingId);
         push({
            title: "Sucesso!",
            message: "Diaria excluida com sucesso",
            type: "success",
         });
         handleCloseDeleteModal();
      } catch (err: unknown) {
         push({
            title: "Erro",
            message: err instanceof Error ? err.message : "Erro ao excluir",
            type: "error",
         });
      }
   }, [deletingId, deleteMutation, push, handleCloseDeleteModal]);

   return {
      showModal,
      showDeleteModal,
      isCreating,
      editingValor,
      deletingId,
      formData,
      setFormData,
      hasChanges,
      isSubmitting: createMutation.isPending || updateMutation.isPending,
      isDeleting: deleteMutation.isPending,
      errors,
      handleOpenModal,
      handleOpenCreateModal,
      handleCloseModal,
      handleOpenDeleteModal,
      handleCloseDeleteModal,
      handleSubmit,
      handleConfirmDelete,
      clearFieldError,
      updateField,
   };
}
