export const DATE_FORMAT_EXTENDED = {
   day: "2-digit" as const,
   month: "2-digit" as const,
   year: "2-digit" as const,
   hour: "2-digit" as const,
   minute: "2-digit" as const,
} as const;

export function isoStrToDate(isoStr: string): Date {
   const [yearStr, monthStr, dayStr] = isoStr.split("-");
   const year = parseInt(yearStr, 10);
   const month = parseInt(monthStr, 10) - 1; // meses em JS são 0-based
   const day = parseInt(dayStr, 10);

   return new Date(year, month, day);
}

export function isoDateToString(isoDate: string): string {
   if (!isoDate) return "";

   const date = new Date(isoDate);
   if (isNaN(date.getTime())) return "";

   const day = String(date.getUTCDate()).padStart(2, "0");
   const month = String(date.getUTCMonth() + 1).padStart(2, "0");
   const year = String(date.getUTCFullYear()).slice(-2);

   return `${day}/${month}/${year}`;
}

export function isoDateToShort(isoDate: string): string {
   if (!isoDate) return "";

   const date = new Date(isoDate);
   if (isNaN(date.getTime())) return "";

   const day = String(date.getUTCDate()).padStart(2, "0");
   const month = String(date.getUTCMonth() + 1).padStart(2, "0");

   return `${day}/${month}`;
}

export function isoStrLocalToDate(localStr: string): Date | null {
   if (!localStr || typeof localStr !== "string") return null;

   const match = localStr
      .trim()
      .match(/^(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{2}|\d{4})$/);
   if (!match) return null;

   const day = parseInt(match[1], 10);
   const month = parseInt(match[2], 10);
   let year = parseInt(match[3], 10);

   // interpretar ano com 2 dígitos como 20xx
   if (match[3].length === 2) year += 2000;

   // validações básicas de ranges
   if (month < 1 || month > 12) return null;
   if (day < 1 || day > 31) return null;

   const date = new Date(year, month - 1, day);

   // checar que o Date gerado corresponde aos componentes (p.ex. evita 31/02)
   if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
   )
      return null;

   return date;
}

export function dateIsIn(dateToCheck, dateStart, dateEnd) {
   const checkStart =
      dateToCheck.valueOf() >= isoStrToDate(dateStart).valueOf();
   const checkEnd = dateToCheck.valueOf() <= isoStrToDate(dateEnd).valueOf();

   return checkStart && checkEnd;
}

export function datasIguais(data1: Date, data2: Date) {
   return (
      data1.getDate() === data2.getDate() &&
      data1.getMonth() === data2.getMonth() &&
      data1.getFullYear() === data2.getFullYear()
   );
}

// --- Helpers para datetime ISO (usados em OM) ---

/**
 * Converte data (YYYY-MM-DD) + hora (HH:mm) para ISO datetime string em UTC
 */
export function toIsoDatetime(date: string, time: string): string {
   if (!date || !time) return "";
   const [hours, minutes] = time.split(":");
   return `${date}T${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00Z`;
}

/**
 * Extrai data (YYYY-MM-DD) de ISO datetime
 */
export function extractDate(isoDatetime: string): string {
   if (!isoDatetime) return "";
   return isoDatetime.split("T")[0];
}

/**
 * Extrai hora (HH:mm) de ISO datetime
 */
export function extractTime(isoDatetime: string): string {
   if (!isoDatetime) return "";
   const timePart = isoDatetime.split("T")[1];
   if (!timePart) return "";
   return timePart.substring(0, 5); // HH:mm
}

/**
 * Converte string HH:mm para minutos (int)
 */
export function timeToMinutes(time: string): number {
   if (!time) return 0;
   const [hours, minutes] = time.split(":").map(Number);
   return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Converte minutos (int) para string HH:mm
 */
export function minutesToTime(minutes: number): string {
   if (!minutes || minutes < 0) return "00:00";
   const h = Math.floor(minutes / 60);
   const m = minutes % 60;
   return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/**
 * Calcula tempo de voo entre dois datetimes ISO
 * Retorna minutos
 */
export function calcularTempoVooMinutos(dtDep: string, dtArr: string): number {
   if (!dtDep || !dtArr) return 0;
   const dep = new Date(dtDep).getTime();
   const arr = new Date(dtArr).getTime();
   const diffMs = arr - dep;
   return Math.max(0, Math.round(diffMs / 60000));
}

/**
 * Formata data ISO para DD/MM/YYYY (ano completo com 4 dígitos)
 */
export function formatDateFull(isoDateTime: string | null): string {
   if (!isoDateTime) return "";
   const date = new Date(isoDateTime);
   const day = String(date.getUTCDate()).padStart(2, "0");
   const month = String(date.getUTCMonth() + 1).padStart(2, "0");
   const year = date.getUTCFullYear();
   return `${day}/${month}/${year}`;
}

/**
 * Extrai hora no formato HH:MM de um datetime ISO (em UTC)
 * Alternativa usando Date para casos que precisam de manipulação de timezone
 */
export function formatTimeUTC(isoDateTime: string): string {
   if (!isoDateTime) return "";
   const date = new Date(isoDateTime);
   const hours = String(date.getUTCHours()).padStart(2, "0");
   const minutes = String(date.getUTCMinutes()).padStart(2, "0");
   return `${hours}:${minutes}`;
}

/**
 * Extrai HH:MM de uma string de hora no formato HH:MM:SS (vindo do banco)
 */
export function formatTime(timeStr: string): string {
   return timeStr.slice(0, 5);
}

/**
 * Formata data ISO para DDMMYYYY (sem separadores, usado para identificação de OM)
 */
export function formatDateForDisplay(dateStr: string): string {
   if (!dateStr) return "";
   const datePart = dateStr.split("T")[0];
   const [year, month, day] = datePart.split("-");
   if (!year || !month || !day) return "";
   return `${day}${month}${year.slice(-2)}`;
}

/**
 * Formata ISO datetime para DD/MM/YYYY HH:mm (horário local)
 * Retorna null se inválido ou ausente
 */
export function formatDateTime(
   isoDatetime: string | null | undefined
): string | null {
   if (!isoDatetime) return null;
   const normalized = isoDatetime.endsWith("Z")
      ? isoDatetime
      : isoDatetime + "Z";
   const date = new Date(normalized);
   if (isNaN(date.getTime())) return null;
   const day = String(date.getDate()).padStart(2, "0");
   const month = String(date.getMonth() + 1).padStart(2, "0");
   const year = date.getFullYear();
   const hours = String(date.getHours()).padStart(2, "0");
   const minutes = String(date.getMinutes()).padStart(2, "0");
   return `${day}/${month}/${year} ${hours}:${minutes}`;
}
