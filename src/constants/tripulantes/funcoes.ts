/**
 * Cores das funções de tripulantes.
 *
 * O catálogo de funções (código, rótulo, posições a bordo, cor) é DADO:
 * vem de `GET /config/funcoes` pelo hook `useFuncoes()`, e cada unidade
 * declara em /config quais opera. O que sobra aqui é só o mapa
 * nome-da-cor → classes Tailwind, que precisa ser estático porque o
 * Tailwind não compila classe montada em runtime (`bg-${cor}-500` não
 * existe no bundle).
 */

// O tipo do código da função segue morando em ./types/func.types e é
// reexportado aqui porque as telas o importam junto das cores.
export type { FuncType, PosicaoABordo } from "./types/func.types";

export interface FuncColorSet {
   bg: string;
   border: string;
   text: string;
   badge: string;
   bar: string;
}

export const FUNC_COLORS: Record<string, FuncColorSet> = {
   blue: {
      bg: "bg-blue-50/60",
      border: "border-blue-200",
      text: "text-blue-700",
      badge: "bg-blue-100 text-blue-800 border-blue-500/60",
      bar: "bg-blue-500",
   },
   amber: {
      bg: "bg-amber-50/60",
      border: "border-amber-200",
      text: "text-amber-700",
      badge: "bg-amber-100 text-amber-800 border-amber-500/60",
      bar: "bg-amber-500",
   },
   emerald: {
      bg: "bg-emerald-50/60",
      border: "border-emerald-200",
      text: "text-emerald-700",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-500/60",
      bar: "bg-emerald-500",
   },
   cyan: {
      bg: "bg-cyan-50/60",
      border: "border-cyan-200",
      text: "text-cyan-700",
      badge: "bg-cyan-100 text-cyan-800 border-cyan-500/60",
      bar: "bg-cyan-500",
   },
   red: {
      bg: "bg-red-50/60",
      border: "border-red-200",
      text: "text-red-700",
      badge: "bg-red-100 text-red-800 border-red-500/60",
      bar: "bg-red-500",
   },
   purple: {
      bg: "bg-purple-50/60",
      border: "border-purple-200",
      text: "text-purple-700",
      badge: "bg-purple-100 text-purple-800 border-purple-500/60",
      bar: "bg-purple-500",
   },
   pink: {
      bg: "bg-pink-50/60",
      border: "border-pink-200",
      text: "text-pink-700",
      badge: "bg-pink-100 text-pink-800 border-pink-500/60",
      bar: "bg-pink-500",
   },
   gray: {
      bg: "bg-gray-50/60",
      border: "border-gray-200",
      text: "text-gray-700",
      badge: "bg-gray-100 text-gray-800 border-gray-500/60",
      bar: "bg-gray-500",
   },
};

/** Cores disponíveis para o cadastro do catálogo (/admin/funcoes). */
export const FUNC_CORES = Object.keys(FUNC_COLORS);

/**
 * Conjunto de classes da cor. Cor desconhecida (ou função ainda não
 * carregada) cai no cinza em vez de renderizar sem classe nenhuma.
 */
export function getFuncColors(cor?: string): FuncColorSet {
   return FUNC_COLORS[cor ?? "gray"] ?? FUNC_COLORS.gray;
}

/**
 * Ordem de exibição das posições a bordo do piloto nas listas de etapa.
 *
 * Não é catálogo: é preferência de leitura (o 1P vem seguido de quem voa
 * no lugar dele). As posições em si vêm do banco, em `funcoes.posicoes`.
 */
export const FUNC_BORDO_ORDER: Record<string, number> = {
   "1P": 0,
   IN: 1,
   AL: 2,
   "2P": 3,
};
