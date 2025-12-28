/**
 * Projetos/Aeronaves
 */

export const PROJETOS = ["kc-390"] as const;

export type ProjType = (typeof PROJETOS)[number];

/**
 * Labels para projetos
 */
export const PROJ_LABELS: Record<ProjType, string> = {
   "kc-390": "KC-390",
};

/**
 * Retorna o label de um projeto
 */
export function getProjLabel(proj: ProjType): string {
   return PROJ_LABELS[proj];
}
