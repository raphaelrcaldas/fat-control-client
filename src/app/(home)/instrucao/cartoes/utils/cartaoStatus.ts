import type { CartaoStatus } from "../types";
import { formatDateFull, daysUntil } from "utils/dateHandler";

export function getCartaoStatus(
   dateStr: string | null | undefined
): CartaoStatus {
   if (!dateStr) return "empty";
   const diff = daysUntil(dateStr);
   if (diff < 0) return "danger";
   if (diff <= 60) return "warn";
   return "ok";
}

export function getDaysLabel(dateStr: string | null | undefined): string {
   if (!dateStr) return "";
   const diff = daysUntil(dateStr);
   if (diff < 0) return `Vencida há ${Math.abs(diff)}d`;
   if (diff <= 60) return `Vence em ${diff}d`;
   return "Regular";
}

export function formatDate(dateStr: string | null | undefined): string {
   return formatDateFull(dateStr ?? null) || "—";
}
