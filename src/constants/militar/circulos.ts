/**
 * Labels dos círculos hierárquicos da FAB
 */

export const CIRCULO_LABELS: Record<string, string> = {
   of_gen: "Of. General",
   of_sup: "Of. Superior",
   of_int: "Of. Intermediário",
   of_sub: "Of. Subalterno",
   grad: "Graduado",
   praca: "Praça",
};

export type CirculoType = keyof typeof CIRCULO_LABELS;

/**
 * Retorna o label de um círculo
 */
export function getCirculoLabel(circulo: string): string {
   return CIRCULO_LABELS[circulo] || circulo;
}
