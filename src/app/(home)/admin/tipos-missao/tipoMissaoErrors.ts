import type { UseFormSetError } from "react-hook-form";

import {
   fieldErrorsFrom,
   formatSaveError,
   translatePydanticMessage,
   type ApiErrorLabels,
} from "@/../utils/apiErrors";
import {
   tipoMissaoFormSchema,
   type TipoMissaoFormData,
} from "./schemas/tipoMissaoSchema";

/**
 * Tradução dos erros de escrita de tipo de missão. Código duplicado e tipo em
 * uso chegam como 409 com mensagem pronta do backend; aqui só humanizamos o
 * 422 e o devolvemos ao campo do formulário.
 */
const LABELS: ApiErrorLabels = {
   fields: { cod: "Código", desc: "Descrição" },
};

/** Converte o erro da mutation em texto pronto para o toast. */
export function formatTipoMissaoSaveError(
   err: unknown,
   fallback: string
): string {
   return formatSaveError(err, fallback, LABELS);
}

/** Devolve cada erro de validação da API ao input correspondente. */
export function applyTipoMissaoFieldErrors(
   err: unknown,
   setError: UseFormSetError<TipoMissaoFormData>
): void {
   const errors = fieldErrorsFrom(err);
   if (!errors) return;

   const formFields = Object.keys(tipoMissaoFormSchema.shape);

   for (const [key, msg] of Object.entries(errors)) {
      const field = key.split(".").filter((s) => s !== "body")[0];
      if (!formFields.includes(field)) continue;
      setError(field as keyof TipoMissaoFormData, {
         type: "server",
         message: translatePydanticMessage(String(msg)),
      });
   }
}
