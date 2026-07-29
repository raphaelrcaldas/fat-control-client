import type { UseFormSetError } from "react-hook-form";

import {
   fieldErrorsFrom,
   formatSaveError,
   translatePydanticMessage,
   type ApiErrorLabels,
} from "@/../utils/apiErrors";
import {
   makeDefaultSoldoValues,
   type SoldoFormData,
} from "./schemas/soldoSchema";

/**
 * Tradução dos erros de CRUD de soldo. As regras de vigência (sobreposição de
 * faixa, fim antes do início, soldo que começa antes do vigente) chegam como
 * 400 com mensagem pronta do backend; aqui humanizamos o 422 de validação e o
 * devolvemos ao campo correspondente do formulário.
 */
const LABELS: ApiErrorLabels = {
   fields: {
      pg: "Posto/Graduação",
      valor: "Valor",
      data_inicio: "Início da vigência",
      data_fim: "Fim da vigência",
   },
};

/** Converte o erro da mutation em texto pronto para o toast. */
export function formatSoldoSaveError(err: unknown, fallback: string): string {
   return formatSaveError(err, fallback, LABELS);
}

/**
 * Devolve os erros de validação da API para os campos do formulário, para que
 * apareçam sob cada input (e não só no toast). Ignora chaves que não
 * correspondam a um campo do form.
 */
export function applySoldoFieldErrors(
   err: unknown,
   setError: UseFormSetError<SoldoFormData>
): void {
   const errors = fieldErrorsFrom(err);
   if (!errors) return;

   // O schema tem `.refine`, então não expõe `.shape`; a factory de defaults
   // já enumera os campos do form.
   const formFields = Object.keys(makeDefaultSoldoValues());

   for (const [key, msg] of Object.entries(errors)) {
      const field = key.split(".").filter((s) => s !== "body")[0];
      if (!formFields.includes(field)) continue;
      setError(field as keyof SoldoFormData, {
         type: "server",
         message: translatePydanticMessage(String(msg)),
      });
   }
}
