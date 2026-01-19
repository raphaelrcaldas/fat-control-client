/**
 * Funções de tripulantes da FAB
 *
 * Fonte única de verdade para labels e tipos de funções.
 * Consolidado de: trip/page.tsx, indisp/page.tsx, om/types.ts
 */

export type FuncType = "pil" | "mc" | "lm" | "oe" | "os" | "tf" | "ml" | "md";

/**
 * Labels completos para todas as funções
 */
export const FUNC_LABELS: Record<FuncType, string> = {
   pil: "Piloto",
   mc: "Mecânico de Voo",
   lm: "Loadmaster",
   oe: "Operador de Equipamentos",
   os: "Observador-SAR",
   tf: "Comissário",
   ml: "Mestre de Lançamento",
   md: "Médico",
};

/**
 * Labels abreviados (para uso em espaços reduzidos)
 */
export const FUNC_LABELS_SHORT: Record<FuncType, string> = {
   pil: "Piloto",
   mc: "Mecânico",
   lm: "Loadmaster",
   oe: "OE-3",
   os: "Obs-SAR",
   tf: "Comissário",
   ml: "ML",
   md: "Médico",
};

/**
 * Todas as funções disponíveis (array)
 */
export const TODAS_FUNCOES: FuncType[] = [
   "pil",
   "mc",
   "lm",
   "tf",
   "oe",
   "os",
   "ml",
   "md",
];

/**
 * Funções principais (sem ml e md)
 * Usado em ordens de missão e contextos específicos
 */
export type FuncaoTripulante = "pil" | "mc" | "lm" | "tf" | "oe" | "os";

export const FUNCOES_PRINCIPAIS: FuncaoTripulante[] = [
   "pil",
   "mc",
   "lm",
   "tf",
   "oe",
   "os",
];

/**
 * Retorna o label de uma função
 */
export function getFuncLabel(func: FuncType, short = false): string {
   return short ? FUNC_LABELS_SHORT[func] : FUNC_LABELS[func];
}
