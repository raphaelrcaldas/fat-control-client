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

/**
 * Regime de voo — `OIEtapa.reg` no backend. Rampa de um só tom da marca da
 * organização (`--primary-<shade>`), do claro ao escuro: quanto menos luz no
 * voo, mais escura a fatia. A cor segue a entidade, não a posição: filtrar por
 * projeto não repinta os regimes que sobram. `text` é a cor do rótulo sobre a
 * fatia.
 */
export const REGIME_META: Record<
   string,
   { label: string; shade: number; text: string }
> = {
   d: { label: "Diurno", shade: 300, text: "#0f172a" },
   n: { label: "Noturno", shade: 600, text: "#ffffff" },
   v: { label: "NVG", shade: 900, text: "#ffffff" },
};

/** Tipo de carga lançada — `HeavyCDS.tipo` no backend. */
export const LANCAMENTO_LABELS: Record<string, string> = {
   heavy: "Heavy",
   cds: "CDS",
};
