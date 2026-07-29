import { formatSaveError, type ApiErrorLabels } from "@/../utils/apiErrors";

/**
 * Tradução dos erros de CRUD de tenant. Sigla já cadastrada e organização
 * inexistente chegam como 400/409 com mensagem pronta do backend; aqui
 * humanizamos o 422 de validação (`body.saudacao` → "Saudação: valor
 * inválido").
 */
const LABELS: ApiErrorLabels = {
   fields: {
      organizacao_id: "Organização",
      tema: "Tema",
      saudacao: "Saudação",
      sigla: "Sigla",
   },
};

/** Converte o erro da mutation em texto pronto para o toast. */
export function formatTenantSaveError(err: unknown, fallback: string): string {
   return formatSaveError(err, fallback, LABELS);
}
