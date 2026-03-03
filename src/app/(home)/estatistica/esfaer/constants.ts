export const MONTH_LABELS = [
   "JAN",
   "FEV",
   "MAR",
   "ABR",
   "MAI",
   "JUN",
   "JUL",
   "AGO",
   "SET",
   "OUT",
   "NOV",
   "DEZ",
];

const currentYear = new Date().getFullYear();
export const YEAR_OPTIONS = Array.from(
   { length: 4 },
   (_, i) => currentYear - 2 + i
);
