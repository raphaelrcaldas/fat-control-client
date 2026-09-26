import { daysUntil } from "./dateHandler";

export const CARD_WARN_DAYS = 60;

export type CardValidity = "ok" | "warn" | "danger" | "empty";

/** A validade inclui o dia do vencimento; alerta nos 60 dias anteriores. */
export function getCardValidity(iso: string | null | undefined): CardValidity {
   if (!iso) return "empty";
   const days = daysUntil(iso);
   if (days < 0) return "danger";
   return days <= CARD_WARN_DAYS ? "warn" : "ok";
}
