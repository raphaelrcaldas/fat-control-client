import type { UseFormSetError } from "react-hook-form";
import { ApiError } from "services/Api";

import {
   humanizeValidationErrors,
   translatePydanticMessage,
   type ApiErrorLabels,
} from "@/../utils/apiErrors";
import { USER_FIELD_LABELS } from "./[id]/components/userFieldLabels";
import {
   createUserFormSchema,
   type CreateUserFormData,
} from "./schemas/userFormSchema";

/**
 * Tradução dos erros de cadastro/edição de usuário vindos da API. Erros de
 * negócio (SARAM/CPF/Zimbra já registrado) chegam como 400 com mensagem
 * pronta; aqui humanizamos o 422 de validação (`body.cpf` → "CPF: inválido")
 * e o devolvemos para o campo correspondente do formulário.
 */
const LABELS: ApiErrorLabels = { fields: USER_FIELD_LABELS };

/** Erros de campo (422) enviados pelo backend, ou null se não houver. */
function fieldErrors(err: unknown): Record<string, unknown> | null {
   if (err instanceof ApiError && err.errors) {
      return Object.keys(err.errors).length > 0 ? err.errors : null;
   }
   return null;
}

/** Converte o erro da mutation em texto pronto para o toast. */
export function formatUserSaveError(err: unknown, fallback: string): string {
   const errors = fieldErrors(err);
   if (errors) {
      const lines = humanizeValidationErrors(errors, LABELS);
      return [
         (err as ApiError).message || "Erro de validação",
         ...lines.map((l) => `• ${l}`),
      ].join("\n");
   }
   return err instanceof Error ? err.message : fallback;
}

/**
 * Devolve os erros de validação da API para os campos do formulário, para que
 * apareçam sob cada input (e não só no toast). Ignora chaves que não
 * correspondam a um campo do form (ex.: erro em nível de corpo).
 */
export function applyUserFieldErrors(
   err: unknown,
   setError: UseFormSetError<CreateUserFormData>
): void {
   const errors = fieldErrors(err);
   if (!errors) return;

   const formFields = Object.keys(createUserFormSchema.shape);

   for (const [key, msg] of Object.entries(errors)) {
      const field = key.split(".").filter((s) => s !== "body")[0];
      if (!formFields.includes(field)) continue;
      setError(field as keyof CreateUserFormData, {
         type: "server",
         message: translatePydanticMessage(String(msg)),
      });
   }
}
