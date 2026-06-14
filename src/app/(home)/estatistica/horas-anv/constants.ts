export const MONTH_LABELS = [
   "jan",
   "fev",
   "mar",
   "abr",
   "mai",
   "jun",
   "jul",
   "ago",
   "set",
   "out",
   "nov",
   "dez",
];

const currentYear = new Date().getFullYear();
export const YEAR_OPTIONS = Array.from(
   { length: 4 },
   (_, i) => currentYear - 2 + i
);
