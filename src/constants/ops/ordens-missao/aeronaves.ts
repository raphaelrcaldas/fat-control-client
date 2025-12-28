/**
 * Matrículas de aeronaves KC-390
 */

export const MATRICULAS_AERONAVES = [2853, 2857, 2859, 2860] as const;

export type MatriculaAeronave = (typeof MATRICULAS_AERONAVES)[number];

/**
 * Formata matrícula para exibição (FAB-XXXX)
 */
export function formatMatricula(matricula: number): string {
   return `FAB-${matricula}`;
}
