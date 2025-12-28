/**
 * Cores predefinidas para etiquetas
 */

export const CORES_PREDEFINIDAS = [
   "#EF4444", // red
   "#F97316", // orange
   "#F59E0B", // amber
   "#EAB308", // yellow
   "#84CC16", // lime
   "#22C55E", // green
   "#10B981", // emerald
   "#14B8A6", // teal
   "#06B6D4", // cyan
   "#0EA5E9", // sky
   "#3B82F6", // blue
   "#6366F1", // indigo
   "#8B5CF6", // violet
   "#A855F7", // purple
   "#D946EF", // fuchsia
   "#EC4899", // pink
   "#F43F5E", // rose
   "#78716C", // stone
] as const;

export type CorPredefinida = (typeof CORES_PREDEFINIDAS)[number];

/**
 * Verifica se uma cor é predefinida
 */
export function isCorPredefinida(cor: string): cor is CorPredefinida {
   return CORES_PREDEFINIDAS.includes(cor as CorPredefinida);
}
