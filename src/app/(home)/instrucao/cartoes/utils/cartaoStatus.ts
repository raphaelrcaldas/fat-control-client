import type { CartaoStatus } from "../types";
import { formatDateFull, daysUntil } from "utils/dateHandler";

// Janela (em dias) em que a validade entra em alerta ("warn"). Fonte única
// para status e rótulo — mantê-los sincronizados.
const WARN_THRESHOLD_DAYS = 60;

export function getCartaoStatus(
   dateStr: string | null | undefined
): CartaoStatus {
   if (!dateStr) return "empty";
   const diff = daysUntil(dateStr);
   if (diff < 0) return "danger";
   if (diff <= WARN_THRESHOLD_DAYS) return "warn";
   return "ok";
}

export function getDaysLabel(dateStr: string | null | undefined): string {
   if (!dateStr) return "";
   const diff = daysUntil(dateStr);
   if (diff < 0) return `Vencida há ${Math.abs(diff)}d`;
   if (diff <= WARN_THRESHOLD_DAYS) return `Vence em ${diff}d`;
   return "Regular";
}

export function formatDate(dateStr: string | null | undefined): string {
   return formatDateFull(dateStr ?? null) || "—";
}
