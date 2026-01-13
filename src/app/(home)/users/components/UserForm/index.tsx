"use client";

/**
 * Formulário de cadastro/edição de usuário
 * Usa React Query para gerenciamento de estado do servidor
 */

import { useEffect, useState } from "react";
import { Button } from "flowbite-react";
import { Spinner } from "@/components/Spinner";
import { useToast } from "@/app/context/toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
   createUserFormSchema,
   defaultUserValues,
   CreateUserFormData,
} from "../../schemas/userFormSchema";
import {
   IdentificationSection,
   DocumentationSection,
   ContactAndDatesSection,
   CareerSection,
   StatusSection,
} from "./FormSections";
import { getChangedFields } from "./utils";
import { useUser, useUpdateUser, useCreateUser } from "@/hooks/queries";

// ========================================
// Tipos
// ========================================

interface UserFormProps {
   userId: string | number | null;
   onSuccess?: () => void;
}

// ========================================
// Helper: Transforma dados do backend para o form
// ========================================

function toFormData(data: any): CreateUserFormData {
   return {
      p_g: data.p_g || "",
      unidade: data.unidade || "",
      esp: (data.esp || "").toUpperCase(),
      nome_guerra: (data.nome_guerra || "").toUpperCase(),
      nome_completo: (data.nome_completo || "").toUpperCase(),
      saram: data.saram ?? null,
      id_fab: data.id_fab ?? null,
      cpf: data.cpf || "",
      email_fab: data.email_fab || "",
      email_pess: data.email_pess || "",
      nasc: data.nasc ?? null,
      ult_promo: data.ult_promo ?? null,
      ant_rel: data.ant_rel ?? null,
      active: data.active ?? true,
   };
}

// ========================================
// Componente Principal
// ========================================

export function UserForm({ userId, onSuccess }: UserFormProps) {
   const [initialValues, setInitialValues] =
      useState<CreateUserFormData | null>(null);
   const { push } = useToast();

   const numericUserId = userId ? Number(userId) : null;
   const isEditMode = !!numericUserId;

   // React Query hooks
   const { data: userData, isLoading: loadingUser } = useUser(numericUserId);
   const updateMutation = useUpdateUser();
   const createMutation = useCreateUser();

   const {
      register,
      handleSubmit,
      reset,
      watch,
      formState: { errors },
   } = useForm<CreateUserFormData>({
      defaultValues: defaultUserValues,
      resolver: zodResolver(createUserFormSchema) as any,
   });

   // ========================================
   // Efeito: Sincronizar dados do usuário com o form
   // ========================================

   useEffect(() => {
      if (userData) {
         const formData = toFormData(userData);
         reset(formData);
         setInitialValues(formData);
      } else if (!numericUserId) {
         reset(defaultUserValues);
         setInitialValues(null);
      }
   }, [userData, numericUserId, reset]);

   // ========================================
   // Detectar mudanças
   // ========================================

   const currentValues = watch();
   const baseValues = initialValues ?? defaultUserValues;
   const diffPreview = getChangedFields(baseValues, currentValues);
   const hasChanges = Object.keys(diffPreview).length > 0;

   const isSubmitting = updateMutation.isPending || createMutation.isPending;

   // ========================================
   // Submit
   // ========================================

   async function onSubmit(data: CreateUserFormData) {
      try {
         if (isEditMode) {
            // Modo edição: enviar apenas campos modificados
            const diff = initialValues
               ? getChangedFields(initialValues, data)
               : data;

            if (Object.keys(diff).length === 0) {
               push({
                  message: "Nenhuma alteração detectada",
                  type: "info",
               });
               return;
            }

            const response = await updateMutation.mutateAsync({
               id: numericUserId!,
               data: diff,
            });

            const dataRes = await response.json();
            push({
               message:
                  dataRes.detail ||
                  (response.ok ? "Usuário atualizado com sucesso" : "Erro"),
               type: response.ok ? "success" : "error",
            });

            if (response.ok) {
               setInitialValues(data);
               reset(data);
               onSuccess?.();
            }
         } else {
            // Modo criação: enviar todos os dados
            const response = await createMutation.mutateAsync(data as any);

            const dataRes = await response.json();
            push({
               message:
                  dataRes.detail ||
                  (response.ok ? "Usuário cadastrado com sucesso" : "Erro"),
               type: response.ok ? "success" : "error",
            });

            if (response.ok) {
               reset(defaultUserValues);
               setInitialValues(null);
               onSuccess?.();
            }
         }
      } catch (err: any) {
         console.error("Erro ao salvar usuário:", err);
         push({
            message: err?.message || "Erro ao salvar usuário",
            type: "error",
         });
      }
   }

   // ========================================
   // Renderização
   // ========================================

   if (loadingUser) {
      return (
         <div className="flex h-40 items-center justify-center">
            <Spinner size="xl" />
         </div>
      );
   }

   return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
         <div className="flex-1 space-y-4">
            <IdentificationSection register={register} errors={errors} />
            <DocumentationSection register={register} errors={errors} />
            <ContactAndDatesSection register={register} errors={errors} />
            <CareerSection register={register} errors={errors} />
            <StatusSection register={register} errors={errors} />
         </div>

         <div className="sticky bottom-0 mt-4 flex justify-center gap-3 border-t border-gray-200 bg-white pt-4">
            <Button
               color="red"
               type="submit"
               disabled={!hasChanges || isSubmitting}
               size="lg"
            >
               {isSubmitting
                  ? "Salvando..."
                  : isEditMode
                    ? "Salvar Alterações"
                    : "Cadastrar"}
            </Button>
         </div>
      </form>
   );
}
