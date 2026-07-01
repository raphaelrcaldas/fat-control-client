import { ApiError } from "services/Api";

import {
   humanizeValidationErrors,
   type ApiErrorLabels,
} from "@/../utils/apiErrors";

/**
 * Tradução dos erros de salvamento/exclusão da missão CEGEP para o
 * ErrorModal. Erros de negócio (conflitos, militares sem comissionamento)
 * já chegam legíveis do backend; aqui humanizamos o 422 de validação
 * (`body.pernoites.0.cidade_id` → "Pernoite 1 · Cidade").
 */
const LABELS: ApiErrorLabels = {
   fields: {
      n_doc: "Nº do documento",
      tipo_doc: "Tipo de documento",
      indenizavel: "Indenizável",
      acrec_desloc: "Acréscimo de deslocamento",
      afast: "Afastamento",
      regres: "Regresso",
      desc: "Descrição",
      obs: "Observações",
      tipo: "Tipo",
      pernoites: "Pernoites",
      users: "Militares",
      etiquetas: "Etiquetas",
      data_ini: "Data inicial",
      data_fim: "Data final",
      meia_diaria: "Meia diária",
      cidade_id: "Cidade",
      cidade: "Cidade",
      user_id: "Militar",
      p_g: "Posto/Graduação",
      sit: "Situação",
   },
   arrays: {
      pernoites: "Pernoite",
      users: "Militar",
      etiquetas: "Etiqueta",
   },
};

/** Converte o erro lançado pela mutation em texto pronto para o ErrorModal. */
export function formatMissaoSaveError(err: unknown, fallback: string): string {
   if (
      err instanceof ApiError &&
      err.errors &&
      Object.keys(err.errors).length > 0
   ) {
      const lines = humanizeValidationErrors(err.errors, LABELS);
      return [
         err.message || "Erro de validação",
         ...lines.map((l) => `• ${l}`),
      ].join("\n");
   }
   return err instanceof Error ? err.message : fallback;
}
