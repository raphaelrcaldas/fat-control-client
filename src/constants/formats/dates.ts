/**
 * Formatos de data padrão
 */

export const DATE_FORMAT_EXTENDED = {
   day: "2-digit" as const,
   month: "2-digit" as const,
   year: "2-digit" as const,
   hour: "2-digit" as const,
   minute: "2-digit" as const,
} as const;

export const DATE_FORMAT_SHORT = {
   day: "2-digit" as const,
   month: "2-digit" as const,
   year: "2-digit" as const,
} as const;

export const DATE_FORMAT_LONG = {
   day: "2-digit" as const,
   month: "long" as const,
   year: "numeric" as const,
} as const;

export const TIME_FORMAT = {
   hour: "2-digit" as const,
   minute: "2-digit" as const,
} as const;

export const DATETIME_FORMAT = {
   ...DATE_FORMAT_SHORT,
   ...TIME_FORMAT,
} as const;
