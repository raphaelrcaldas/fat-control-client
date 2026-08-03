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

/** Regime de voo — `OIEtapa.reg` no backend. */
export const REGIME_LABELS: Record<string, string> = {
   d: "Diurno",
   n: "Noturno",
   v: "NVG",
};

/** Tipo de carga lançada — `HeavyCDS.tipo` no backend. */
export const LANCAMENTO_LABELS: Record<string, string> = {
   heavy: "Heavy",
   cds: "CDS",
};
