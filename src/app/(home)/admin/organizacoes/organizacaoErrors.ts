import type { UseFormSetError } from "react-hook-form";
import { ApiError } from "services/Api";

import {
   humanizeValidationErrors,
   translatePydanticMessage,
   type ApiErrorLabels,
} from "@/../utils/apiErrors";
import {
   organizacaoFormSchema,
   type OrganizacaoFormData,
} from "./schemas/organizacaoSchema";

/**
 * Tradução dos erros de CRUD de organização. Conflito de sigla chega como 400
 * com mensagem pronta; aqui humanizamos o 422 de validação (`body.nome` →
 * "Nome: obrigatório") e o devolvemos para o campo correspondente do form.
 */
const LABELS: ApiErrorLabels = {
   fields: {
      sigla: "Sigla",
      sigla_2: "Sigla 2",
      sigla_3: "Sigla 3",
      nome: "Nome",
      alias: "Codinome",
   },
};

/** Erros de campo (422) enviados pelo backend, ou null se não houver. */
function fieldErrors(err: unknown): Record<string, unknown> | null {
   if (err instanceof ApiError && err.errors) {
      return Object.keys(err.errors).length > 0 ? err.errors : null;
   }
   return null;
}

/** Converte o erro da mutation em texto pronto para o toast. */
export function formatOrganizacaoSaveError(
   err: unknown,
   fallback: string
): string {
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
 * correspondam a um campo do form.
 */
export function applyOrganizacaoFieldErrors(
   err: unknown,
   setError: UseFormSetError<OrganizacaoFormData>
): void {
   const errors = fieldErrors(err);
   if (!errors) return;

   const formFields = Object.keys(organizacaoFormSchema.shape);

   for (const [key, msg] of Object.entries(errors)) {
      const field = key.split(".").filter((s) => s !== "body")[0];
      if (!formFields.includes(field)) continue;
      setError(field as keyof OrganizacaoFormData, {
         type: "server",
         message: translatePydanticMessage(String(msg)),
      });
   }
}
