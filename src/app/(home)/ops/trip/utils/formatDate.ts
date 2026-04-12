import { formatDateFull } from "utils/dateHandler";

/**
 * Formata uma data no padrão ISO (YYYY-MM-DD) para DD/MM/YYYY
 * Retorna "NIL" se a data for nula ou inválida
 */
export function formatDate(date: string | null): string {
   return formatDateFull(date) || "NIL";
}
