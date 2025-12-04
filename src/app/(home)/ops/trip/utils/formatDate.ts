/**
 * Formata uma data no padrão ISO (YYYY-MM-DD) para DD/MM/YYYY
 * Retorna "NIL" se a data for nula ou inválida
 */
export function formatDate(date: string | null): string {
   if (!date) return "NIL";

   try {
      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
   } catch {
      return date;
   }
}
