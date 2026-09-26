import type { CartaoStatus } from "../types";
import { formatDateFull, daysUntil } from "utils/dateHandler";
import { CARD_WARN_DAYS, getCardValidity } from "utils/cardValidity";

export function getCartaoStatus(
   dateStr: string | null | undefined
): CartaoStatus {
   return getCardValidity(dateStr);
}

export function getDaysLabel(dateStr: string | null | undefined): string {
   if (!dateStr) return "";
   const diff = daysUntil(dateStr);
   if (diff < 0) return `Vencida há ${Math.abs(diff)}d`;
   if (diff === 0) return "Vence hoje";
   if (diff <= CARD_WARN_DAYS) return `Vence em ${diff}d`;
   return "Regular";
}

export function formatDate(dateStr: string | null | undefined): string {
   return formatDateFull(dateStr ?? null) || "—";
}
