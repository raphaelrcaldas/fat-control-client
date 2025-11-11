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