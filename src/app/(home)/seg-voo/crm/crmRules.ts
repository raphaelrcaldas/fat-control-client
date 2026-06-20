import type { DateStatus } from "@/utils/dateStatus";

/**
 * Validade do CRM em anos a partir da data de realização. Regra de domínio
 * usada para pré-preencher a validade ao informar a realização.
 */
export const VALIDADE_ANOS = 2;

/**
 * Rótulos com o threshold explícito — usados no campo de validade do
 * formulário, onde informar a janela de dias é útil. Difere do `label` curto
 * de getStatusConfig (usado em badges/cards), por isso vive aqui.
 */
export const STATUS_LABELS: Record<DateStatus, string> = {
   valid: "Em dia",
   warning: "Atenção (< 90 dias)",
   critical: "Crítico (< 30 dias)",
   expired: "Vencido",
   empty: "Sem data",
};
