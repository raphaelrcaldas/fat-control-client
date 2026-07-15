"use client";

/**
 * Formulário de cadastro/edição de usuário
 * Usa React Query para gerenciamento de estado do servidor
 */

import { useEffect, useState } from "react";
import { Button, Spinner } from "flowbite-react";
import { useToast } from "@/app/context/toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
   createUserFormSchema,
   defaultUserValues,
   CreateUserFormData,
} from "../../schemas/userFormSchema";
import { PersonalDataSection, MilitaryDataSection } from "./FormSections";
import { getChangedFields } from "./utils";
import { applyUserFieldErrors, formatUserSaveError } from "../../userErrors";
import { formatPhone, formatCpf, formatSaram } from "@/constants/formats";
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
      quadro: (data.quadro || "").toUpperCase(),
      esp: (data.esp || "").toUpperCase(),
      nome_guerra: (data.nome_guerra || "").toUpperCase(),
      nome_completo: (data.nome_completo || "").toUpperCase(),
      saram: formatSaram(data.saram || ""),
      id_fab: data.id_fab ?? "",
      cpf: formatCpf(data.cpf || ""),
      email_fab: data.email_fab || "",
      email_pess: data.email_pess || "",
      telefone: formatPhone(data.telefone || ""),
      nasc: data.nasc ?? null,
      data_praca: data.data_praca ?? null,
      ult_promo: data.ult_promo ?? null,
      ant_rel: data.ant_rel ?? null,
      active: data.active ?? true,
   };
}

// ========================================
// Helper: Transforma os dados do form no payload da API
// ========================================

/**
 * Campo em branco vira `null` (não `""`) e os mascarados viajam só com os
 * dígitos. Aplicado também sobre os valores iniciais antes do diff, para que
 * a máscara (CPF/telefone/SARAM) não conte como alteração e polua o log de
 * auditoria com campos que o usuário nem tocou.
 */
function toPayload(data: CreateUserFormData) {
   const digits = (v: string | null | undefined) =>
      v?.replace(/\D/g, "") || null;
   const text = (v: string | null | undefined) => v?.trim() || null;

   return {
      p_g: data.p_g,
      nome_guerra: data.nome_guerra,
      saram: digits(data.saram) ?? "",
      quadro: text(data.quadro),
      esp: text(data.esp),
      nome_completo: text(data.nome_completo),
      id_fab: text(data.id_fab),
      cpf: digits(data.cpf),
      telefone: digits(data.telefone),
      email_fab: text(data.email_fab),
      email_pess: text(data.email_pess),
      nasc: data.nasc || null,
      data_praca: data.data_praca || null,
      ult_promo: data.ult_promo || null,
      ant_rel: data.ant_rel ?? null,
      active: data.active,
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
      control,
      setError,
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
      const payload = toPayload(data);

      try {
         if (isEditMode) {
            // Modo edição: enviar apenas campos modificados
            const diff = initialValues
               ? getChangedFields(toPayload(initialValues), payload)
               : payload;

            if (Object.keys(diff).length === 0) {
               push({
                  message: "Nenhuma alteração detectada",
                  type: "info",
               });
               return;
            }

            const result = await updateMutation.mutateAsync({
               id: numericUserId!,
               data: diff,
            });

            push({
               message: result.message || "Usuário atualizado com sucesso",
               type: "success",
            });

            const updatedForm = toFormData(payload);
            setInitialValues(updatedForm);
            reset(updatedForm);
            onSuccess?.();
         } else {
            // Modo criação: `active` não vai no payload — o usuário nasce
            // ativo (User.active tem default no model).
            const { active: _active, ...createPayload } = payload;

            const result = await createMutation.mutateAsync(createPayload);

            push({
               message: result.message || "Usuário cadastrado com sucesso",
               type: "success",
            });

            reset(defaultUserValues);
            setInitialValues(null);
            onSuccess?.();
         }
      } catch (err: unknown) {
         // 422 do Pydantic volta como dict campo → mensagem: devolve cada erro
         // ao seu input e resume no toast.
         applyUserFieldErrors(err, setError);
         push({
            message: formatUserSaveError(err, "Erro ao salvar usuário"),
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
            <Spinner size="xl" color="primary" />
         </div>
      );
   }

   return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
         <PersonalDataSection register={register} errors={errors} />
         <MilitaryDataSection
            register={register}
            errors={errors}
            control={control}
            showActive={isEditMode}
         />

         <div className="flex justify-end border-t border-gray-200 pt-5">
            <Button
               color="primary"
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
