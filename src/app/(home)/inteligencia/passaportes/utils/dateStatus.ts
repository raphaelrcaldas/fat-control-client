// Re-exporta as funções de dateStatus do módulo compartilhado (mesmos thresholds: 0/30/90)
export {
   getDateStatus,
   getStatusConfig,
   formatDate,
   getDaysRemaining,
} from "@/utils/dateStatus";
export type { DateStatus } from "@/utils/dateStatus";

import { getDateStatus } from "@/utils/dateStatus";
import type { DateStatus } from "@/utils/dateStatus";

/**
 * Rótulos com o threshold explícito — usados nos campos do formulário, onde
 * informar a janela de dias é útil. Difere do `label` curto de getStatusConfig
 * (usado em badges/cards), por isso vive aqui de forma centralizada.
 */
export const STATUS_LABELS: Record<DateStatus, string> = {
   valid: "Em dia",
   warning: "Atenção (< 90 dias)",
   critical: "Crítico (< 30 dias)",
   expired: "Vencido",
   empty: "Sem data",
};

const PRIORITY: Record<DateStatus, number> = {
   expired: 4,
   critical: 3,
   warning: 2,
   valid: 1,
   empty: 0,
};

/**
 * Retorna o pior status entre passaporte e visa.
 * "empty" é ignorado quando o outro campo tem valor.
 */
export function getWorstStatus(
   passaporteDate: string | null | undefined,
   visaDate: string | null | undefined
): DateStatus {
   const passaporteStatus = getDateStatus(passaporteDate);
   const visaStatus = getDateStatus(visaDate);

   if (passaporteStatus === "empty" && visaStatus === "empty") return "empty";
   if (passaporteStatus === "empty") return visaStatus;
   if (visaStatus === "empty") return passaporteStatus;

   return PRIORITY[passaporteStatus] >= PRIORITY[visaStatus]
      ? passaporteStatus
      : visaStatus;
}
