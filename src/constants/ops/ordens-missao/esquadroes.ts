/**
 * Esquadrões disponíveis
 */

export const ESQUADROES = ["1GT1", "2GT2", "1ETA", "2ETA"] as const;

export type Esquadrao = (typeof ESQUADROES)[number];
