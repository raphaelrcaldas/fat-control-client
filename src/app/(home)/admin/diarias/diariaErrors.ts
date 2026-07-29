import {
   fieldErrorsFrom,
   formatSaveError,
   translatePydanticMessage,
   type ApiErrorLabels,
} from "@/../utils/apiErrors";
import type { DiariaFormErrors } from "./schemas/diariaFormSchema";

/**
 * Tradução dos erros de CRUD de valor de diária. As regras de vigência
 * (sobreposição de faixa para o mesmo grupo_pg+grupo_cid, fim antes do início)
 * chegam como 400 com mensagem pronta do backend; aqui humanizamos o 422 de
 * validação e o devolvemos ao campo correspondente do formulário.
 */
const LABELS: ApiErrorLabels = {
   fields: {
      valor: "Valor",
      data_inicio: "Início da vigência",
      data_fim: "Fim da vigência",
      grupo_cid: "Grupo de cidade",
      grupo_pg: "Grupo P/G",
   },
};

const CAMPOS_DO_FORM: (keyof DiariaFormErrors)[] = [
   "valor",
   "data_inicio",
   "data_fim",
   "grupo_cid",
   "grupo_pg",
];

/** Converte o erro da mutation em texto pronto para o toast. */
export function formatDiariaSaveError(err: unknown, fallback: string): string {
   return formatSaveError(err, fallback, LABELS);
}

/**
 * Erros de validação da API no formato do estado do formulário, para que
 * apareçam sob cada input (e não só no toast). O form de diárias não usa
 * react-hook-form: guarda os erros em estado próprio, então aqui devolvemos o
 * mapa em vez de chamar `setError`. Ignora chaves que não sejam campo do form.
 */
export function diariaFieldErrors(err: unknown): DiariaFormErrors {
   const errors = fieldErrorsFrom(err);
   if (!errors) return {};

   const resultado: DiariaFormErrors = {};
   for (const [key, msg] of Object.entries(errors)) {
      const field = key
         .split(".")
         .filter((s) => s !== "body")[0] as keyof DiariaFormErrors;
      if (!CAMPOS_DO_FORM.includes(field)) continue;
      resultado[field] = translatePydanticMessage(String(msg));
   }
   return resultado;
}
