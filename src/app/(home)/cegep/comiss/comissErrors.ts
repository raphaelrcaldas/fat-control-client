import { ApiError } from "services/Api";

import {
   humanizeValidationErrors,
   type ApiErrorLabels,
} from "@/../utils/apiErrors";

/**
 * Tradução dos erros de salvamento do comissionamento para o toast. Erros de
 * negócio (conflito de datas, regras de fechamento, missões fora do escopo)
 * já chegam legíveis do backend; aqui humanizamos o 422 de validação.
 */
const LABELS: ApiErrorLabels = {
   fields: {
      user_id: "Militar",
      status: "Status",
      dep: "Dependente",
      data_ab: "Data de abertura",
      qtd_aj_ab: "Qtd. de ajudas (abertura)",
      valor_aj_ab: "Valor da ajuda (abertura)",
      data_fc: "Data de fechamento",
      qtd_aj_fc: "Qtd. de ajudas (fechamento)",
      valor_aj_fc: "Valor da ajuda (fechamento)",
      dias_cumprir: "Dias a cumprir",
      doc_prop: "Documento de proposta",
      doc_aut: "Documento de autorização",
      doc_enc: "Documento de encerramento",
   },
};

export interface FormattedComissError {
   title: string;
   message: string;
}

/** Converte o erro lançado pela mutation em título + corpo para o toast. */
export function formatComissSaveError(
   err: unknown,
   fallback: string
): FormattedComissError {
   if (
      err instanceof ApiError &&
      err.errors &&
      Object.keys(err.errors).length > 0
   ) {
      const lines = humanizeValidationErrors(err.errors, LABELS);
      return {
         title: err.message || "Erro de validação",
         message: lines.map((l) => `• ${l}`).join("\n"),
      };
   }
   return {
      title: "Erro",
      message: err instanceof Error ? err.message : fallback,
   };
}
