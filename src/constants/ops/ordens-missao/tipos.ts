/**
 * Tipos de missão disponíveis
 */

export const TIPOS_MISSAO = [
   "Transporte Aerologístico",
   "Lançamento de PQD",
] as const;

export type TipoMissao = (typeof TIPOS_MISSAO)[number];
