import { ApiError } from "services/Api";

import {
   humanizeValidationErrors,
   type ApiErrorLabels,
} from "@/../utils/apiErrors";

/**
 * Tradução dos erros de `simularMissao` para o banner persistente do
 * ResultadoPanel. Mesmo padrão de missaoErrors.ts, mas com os rótulos da
 * calculadora (payload de simulação, não o cadastro real da missão).
 */
const LABELS: ApiErrorLabels = {
   fields: {
      acrec_desloc: "Acréscimo de deslocamento",
      pernoites: "Pernoites",
      combinacoes: "Militares",
      data_ini: "Data de início",
      data_fim: "Data de fim",
      cidade_id: "Cidade",
      meia_diaria: "Meia diária",
      p_g: "Posto/Grad",
      sit: "Situação",
      qtd: "Quantidade",
   },
   arrays: {
      pernoites: "Pernoite",
      combinacoes: "Militar",
   },
};

/** Erro pronto para exibição: mensagem de topo + detalhes por campo. */
export interface SimulacaoErrorInfo {
   message: string;
   detalhes: string[];
}

/** Converte o erro lançado pela mutation de simulação em texto pronto para o banner. */
export function formatSimulacaoError(err: unknown): SimulacaoErrorInfo {
   if (
      err instanceof ApiError &&
      err.errors &&
      Object.keys(err.errors).length > 0
   ) {
      return {
         message: err.message || "Erro de validação",
         detalhes: humanizeValidationErrors(err.errors, LABELS),
      };
   }
   return {
      message:
         err instanceof Error ? err.message : "Erro ao calcular simulação",
      detalhes: [],
   };
}
