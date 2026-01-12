"use client";

/**
 * Formulário de cadastro/edição de usuário
 */

import { useEffect, useState } from "react";
import { Button } from "flowbite-react";
import { Spinner } from "@/components/Spinner";
import { getUserById, updateUser, addUser } from "services/routes/users";
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

// ========================================
// Tipos
// ========================================

interface UserFormProps {
   userId: string | number | null;
   updateUsers: () => void;
   onSuccess?: () => void;
}

// ========================================
// Componente Principal
// ========================================

export function UserForm({ userId, updateUsers, onSuccess }: UserFormProps) {
   const [loadingUser, setLoadingUser] = useState(false);
   const [initialValues, setInitialValues] =
      useState<CreateUserFormData | null>(null);
   const { push } = useToast();

   const isEditMode = !!userId;

   const {
      register,
      handleSubmit,
      reset,
      watch,
      formState: { errors, isSubmitting },
   } = useForm<CreateUserFormData>({
      defaultValues: defaultUserValues,
      resolver: zodResolver(createUserFormSchema) as any,
   });

   // ========================================
   // Efeito: Carregar dados do usuário
   // ========================================

   useEffect(() => {
      const fetchUser = async () => {
         if (!userId) {
            reset(defaultUserValues);
            setInitialValues(null);
            return;
         }

         setLoadingUser(true);
         try {
            const data = await getUserById(Number(userId));
            const formData: CreateUserFormData = {
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

            reset(formData);
            setInitialValues(formData);
         } catch (err: any) {
            console.error("Erro ao buscar usuário:", err);
            push({
               message: "Erro ao carregar dados do usuário",
               type: "error",
            });
         } finally {
            setLoadingUser(false);
         }
      };

      fetchUser();
   }, [userId, reset, push]);

   // ========================================
   // Detectar mudanças
   // ========================================

   const currentValues = watch();
   const baseValues = initialValues ?? defaultUserValues;
   const diffPreview = getChangedFields(baseValues, currentValues);
   const hasChanges = Object.keys(diffPreview).length > 0;

   // ========================================
   // Submit
   // ========================================

   async function onSubmit(data: CreateUserFormData) {
      try {
         let response: Response;

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

            response = await updateUser(Number(userId), diff);
         } else {
            // Modo criação: enviar todos os dados
            response = await addUser(data);
         }

         const dataRes = await response.json();
         push({
            message:
               dataRes.detail ||
               (response.ok ? "Operação realizada com sucesso" : "Erro"),
            type: response.ok ? "success" : "error",
         });

         if (response.ok) {
            // Atualiza o estado base para refletir os dados salvos
            setInitialValues(data);
            reset(data);
            updateUsers();
            onSuccess?.();
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
