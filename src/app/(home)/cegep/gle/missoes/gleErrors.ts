import {
   fieldErrorsFrom,
   formatSaveError,
   humanizeValidationErrors,
   translatePydanticMessage,
   type ApiErrorLabels,
} from "@/../utils/apiErrors";

/** Rótulos do contrato de validação da missão de GLE. */
export const LABELS: ApiErrorLabels = {
   fields: {
      descricao: "Descrição",
      obs: "Observações",
      trechos: "Trechos",
      militares_ids: "Militares",
      loc_esp_id: "Localidade",
      chegada: "Chegada",
      afastamento: "Afastamento",
   },
   arrays: {
      trechos: "Trecho",
   },
};

/** Retorna as linhas legíveis dos erros de validação enviados pelo backend. */
export function formatGleValidationErrors(err: unknown): string[] {
   const errors = fieldErrorsFrom(err);
   return errors ? humanizeValidationErrors(errors, LABELS) : [];
}

/** Converte um erro de missão em texto para o toast e o resumo de validação. */
export function formatGleSaveError(err: unknown, fallback: string): string {
   return formatSaveError(err, fallback, LABELS);
}

function appendError(
   target: Record<string, string>,
   key: string,
   message: string
) {
   target[key] = target[key] ? `${target[key]} · ${message}` : message;
}

/**
 * Devolve os erros 422 no formato de estado usado pelo editor.
 *
 * Erros aninhados de `trechos.N.campo` são associados ao `uid` estável da
 * linha correspondente. Isso evita usar o índice como chave de render e ainda
 * mantém a mensagem junto do trecho recusado pelo backend.
 */
export function gleFieldErrors(
   err: unknown,
   trechoUids: string[]
): Record<string, string> {
   const errors = fieldErrorsFrom(err);
   if (!errors) return {};

   const result: Record<string, string> = {};

   for (const [key, raw] of Object.entries(errors)) {
      const segments = key.split(".").filter((segment) => segment !== "body");
      const [field, maybeIndex, nestedField] = segments;
      const message = translatePydanticMessage(String(raw));

      if (field === "descricao" || field === "obs") {
         appendError(result, field, message);
         continue;
      }

      if (field === "militares_ids") {
         appendError(result, "militares", message);
         continue;
      }

      if (field !== "trechos") continue;

      if (/^\d+$/.test(maybeIndex ?? "")) {
         const trechoUid = trechoUids[Number(maybeIndex)];
         if (!trechoUid) continue;
         const nestedLabel = nestedField
            ? LABELS.fields[nestedField]
            : undefined;
         appendError(
            result,
            trechoUid,
            nestedLabel ? `${nestedLabel}: ${message}` : message
         );
      } else {
         appendError(result, "trechos", message);
      }
   }

   return result;
}
