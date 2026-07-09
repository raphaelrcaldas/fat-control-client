/**
 * Tema de cor de marca por organização (org_ativa).
 *
 * Lista fechada espelhando o backend (fcontrol_api/enums/tema.py). O valor
 * ativo é gravado no cookie `org_theme` e estampado como `data-org-theme` no
 * <html> pelo root layout (SSR), sem flash. Ver src/app/global.css para o
 * mapeamento de cada tema na escala `--primary-*`.
 */
export const ORG_THEME_COOKIE = "org_theme";
export const DEFAULT_ORG_THEME = "red";

export const ORG_THEMES = [
   "red",
   "blue",
   "emerald",
   "indigo",
   "amber",
   "teal",
   "rose",
   "violet",
   "slate",
] as const;

export type OrgTheme = (typeof ORG_THEMES)[number];

/**
 * Metadado visual de cada tema: rótulo em PT e classe da amostra de cor (tom
 * 500 fixo — mostra a cor real do tema, não a cor tematizada da org). As
 * classes são literais para o Tailwind escaneá-las. Usado pelo seletor de
 * tema e pela tabela de tenants.
 */
export const THEME_META: Record<OrgTheme, { label: string; swatch: string }> = {
   red: { label: "Vermelho", swatch: "bg-red-500" },
   blue: { label: "Azul", swatch: "bg-blue-500" },
   emerald: { label: "Esmeralda", swatch: "bg-emerald-500" },
   indigo: { label: "Índigo", swatch: "bg-indigo-500" },
   amber: { label: "Âmbar", swatch: "bg-amber-500" },
   teal: { label: "Turquesa", swatch: "bg-teal-500" },
   rose: { label: "Rosa", swatch: "bg-rose-500" },
   violet: { label: "Violeta", swatch: "bg-violet-500" },
   slate: { label: "Ardósia", swatch: "bg-slate-500" },
};

export function isOrgTheme(
   value: string | null | undefined
): value is OrgTheme {
   return value != null && (ORG_THEMES as readonly string[]).includes(value);
}

/** Normaliza um valor arbitrário para um tema válido (fallback = default). */
export function normalizeOrgTheme(value: string | null | undefined): OrgTheme {
   return isOrgTheme(value) ? value : DEFAULT_ORG_THEME;
}
