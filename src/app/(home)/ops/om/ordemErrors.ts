import { ApiError } from "services/Api";
import { formatSaveError, type ApiErrorLabels } from "utils/apiErrors";

/**
 * Tradução dos erros de salvamento da Ordem de Missão para o Alert de erro do
 * formulário. Erros de negócio já chegam legíveis do backend; aqui
 * humanizamos o 422 de validação (`body.etapas.0.dt_dep` → "Etapa 1 · Decolagem").
 */
const LABELS: ApiErrorLabels = {
   fields: {
      numero: "Número",
      doc_ref: "Documento de referência",
      matricula_anv: "Aeronave",
      projeto: "Projeto",
      tipo: "Descrição",
      status: "Status",
      esf_aer: "Esforço aéreo",
      etapas: "Etapas",
      dt_dep: "Decolagem",
      dt_arr: "Pouso",
      origem: "Origem",
      dest: "Destino",
      alternativa: "Alternativa",
      tvoo_alt: "Tempo de voo até a alternativa",
      qtd_comb: "Combustível",
      tripulacao: "Tripulação",
      campos_especiais: "Ordens especiais",
      label: "Rótulo",
      valor: "Valor",
      etiquetas_ids: "Etiquetas",
   },
   arrays: {
      etapas: "Etapa",
      campos_especiais: "Ordem especial",
   },
};

/** Converte o erro lançado pela mutation em texto pronto para o Alert de erro. */
export function formatOrdemError(err: unknown, fallback: string): string {
   if (err instanceof ApiError) {
      return formatSaveError(err, fallback, LABELS);
   }
   return err instanceof Error ? err.message : fallback;
}
