/**
 * Funções de tripulantes da FAB
 *
 * Fonte única de verdade para funções, labels, temas e posições a bordo.
 * Estrutura centralizada - todos os outros exports derivam de FUNCOES_CONFIG.
 */

import type {
   FuncConfig,
   FuncType,
   FuncaoTripulante,
   PosicaoABordo,
} from "./types";

// Re-export dos tipos
export type { FuncType, FuncaoTripulante, FuncConfig, PosicaoABordo };

// =============================================================================
// CONFIGURAÇÃO CENTRALIZADA
// =============================================================================

/**
 * Configuração completa de todas as funções.
 * Fonte única de verdade - todos os outros exports derivam daqui.
 */
export const FUNCOES_CONFIG: Record<FuncType, FuncConfig> = {
   pil: {
      label: "Piloto",
      labelShort: "Piloto",
      theme: { color: "blue", badge: "info" },
      posicoes: [
         { codigo: "1P", label: "1º Piloto", descricao: "Piloto em comando" },
         { codigo: "2P", label: "2º Piloto", descricao: "Copiloto" },
         { codigo: "IN", label: "Instrutor", descricao: "Piloto instrutor" },
         { codigo: "AL", label: "Aluno", descricao: "Piloto em instrução" },
      ],
   },
   mc: {
      label: "Mecânico",
      labelShort: "Mecânico",
      theme: { color: "amber", badge: "warning" },
      posicoes: [
         { codigo: "MC", label: "Mecânico", descricao: "Mecânico" },
         { codigo: "IC", label: "Instrutor", descricao: "Mecânico instrutor" },
         { codigo: "AC", label: "Aluno", descricao: "Mecânico em instrução" },
      ],
   },
   lm: {
      label: "Loadmaster",
      labelShort: "Loadmaster",
      theme: { color: "emerald", badge: "success" },
      posicoes: [
         { codigo: "LM", label: "Loadmaster", descricao: "Loadmaster titular" },
         {
            codigo: "IG",
            label: "Instrutor",
            descricao: "Loadmaster instrutor",
         },
         { codigo: "AG", label: "Aluno", descricao: "Loadmaster em instrução" },
      ],
   },
   oe: {
      label: "Operador de Equipamentos",
      labelShort: "OE-3",
      theme: { color: "cyan", badge: "cyan" },
      posicoes: [
         {
            codigo: "O3",
            label: "Operador",
            descricao: "Operador de equipamentos",
         },
         { codigo: "I3", label: "Instrutor", descricao: "OE instrutor" },
         { codigo: "A3", label: "Aluno", descricao: "OE em instrução" },
      ],
   },
   os: {
      label: "Observador-SAR",
      labelShort: "Obs-SAR",
      theme: { color: "red", badge: "failure" },
      posicoes: [
         {
            codigo: "OS",
            label: "Observador-SAR",
            descricao: "Observador SAR",
         },
         {
            codigo: "IS",
            label: "Instrutor",
            descricao: "Observador-SAR instrutor",
         },
         {
            codigo: "AS",
            label: "Aluno",
            descricao: "Observador-SAR em instrução",
         },
      ],
   },
   tf: {
      label: "Comissário",
      labelShort: "Comissário",
      theme: { color: "purple", badge: "purple" },
      posicoes: [
         { codigo: "TF", label: "Comissário", descricao: "Comissário titular" },
         {
            codigo: "IF",
            label: "Instrutor",
            descricao: "Comissário instrutor",
         },
         { codigo: "AF", label: "Aluno", descricao: "Comissário em instrução" },
      ],
   },
   ml: {
      label: "Mestre de Lançamento",
      labelShort: "ML",
      theme: { color: "pink", badge: "pink" },
      posicoes: [], // Função esporádica, sem controle de posições
   },
   md: {
      label: "Médico",
      labelShort: "Médico",
      theme: { color: "gray", badge: "gray" },
      posicoes: [], // Função esporádica, sem controle de posições
   },
};

// =============================================================================
// DERIVADOS (para compatibilidade)
// =============================================================================

/** Labels completos para todas as funções */
export const FUNC_LABELS: Record<FuncType, string> = Object.fromEntries(
   Object.entries(FUNCOES_CONFIG).map(([key, config]) => [key, config.label])
) as Record<FuncType, string>;

/** Labels abreviados (para uso em espaços reduzidos) */
export const FUNC_LABELS_SHORT: Record<FuncType, string> = Object.fromEntries(
   Object.entries(FUNCOES_CONFIG).map(([key, config]) => [
      key,
      config.labelShort,
   ])
) as Record<FuncType, string>;

/** Todas as funções disponíveis (array) */
export const TODAS_FUNCOES: FuncType[] = Object.keys(
   FUNCOES_CONFIG
) as FuncType[];

/** Funções principais (sem ml e md que são esporádicas) */
export const FUNCOES_PRINCIPAIS: FuncaoTripulante[] = [
   "pil",
   "mc",
   "lm",
   "tf",
   "oe",
   "os",
];

// =============================================================================
// CORES TAILWIND POR TEMA (mapeamento estático para Tailwind não purgar)
// =============================================================================

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
      badge: "bg-blue-100 text-blue-800",
      bar: "bg-blue-500",
   },
   amber: {
      bg: "bg-amber-50/60",
      border: "border-amber-200",
      text: "text-amber-700",
      badge: "bg-amber-100 text-amber-800",
      bar: "bg-amber-500",
   },
   emerald: {
      bg: "bg-emerald-50/60",
      border: "border-emerald-200",
      text: "text-emerald-700",
      badge: "bg-emerald-100 text-emerald-800",
      bar: "bg-emerald-500",
   },
   cyan: {
      bg: "bg-cyan-50/60",
      border: "border-cyan-200",
      text: "text-cyan-700",
      badge: "bg-cyan-100 text-cyan-800",
      bar: "bg-cyan-500",
   },
   red: {
      bg: "bg-red-50/60",
      border: "border-red-200",
      text: "text-red-700",
      badge: "bg-red-100 text-red-800",
      bar: "bg-red-500",
   },
   purple: {
      bg: "bg-purple-50/60",
      border: "border-purple-200",
      text: "text-purple-700",
      badge: "bg-purple-100 text-purple-800",
      bar: "bg-purple-500",
   },
   pink: {
      bg: "bg-pink-50/60",
      border: "border-pink-200",
      text: "text-pink-700",
      badge: "bg-pink-100 text-pink-800",
      bar: "bg-pink-500",
   },
   gray: {
      bg: "bg-gray-50/60",
      border: "border-gray-200",
      text: "text-gray-700",
      badge: "bg-gray-100 text-gray-800",
      bar: "bg-gray-500",
   },
};

/**
 * Retorna o conjunto de cores Tailwind para uma função
 */
export function getFuncColors(func: string): FuncColorSet {
   const config = FUNCOES_CONFIG[func as FuncType];
   const themeColor = config?.theme.color ?? "gray";
   return FUNC_COLORS[themeColor] ?? FUNC_COLORS.gray;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Retorna o label de uma função
 */
export function getFuncLabel(func: FuncType, short = false): string {
   return short ? FUNCOES_CONFIG[func].labelShort : FUNCOES_CONFIG[func].label;
}

/**
 * Retorna o tema de uma função
 */
export function getFuncTheme(func: FuncType) {
   return FUNCOES_CONFIG[func].theme;
}

/**
 * Retorna as posições a bordo disponíveis para uma função
 */
export function getPosicoesByFunc(func: FuncType): PosicaoABordo[] {
   return FUNCOES_CONFIG[func].posicoes;
}

/**
 * Retorna o label de uma posição a bordo
 */
export function getPosicaoLabel(
   func: FuncType,
   codigo: string
): string | undefined {
   const posicao = FUNCOES_CONFIG[func].posicoes.find(
      (p) => p.codigo === codigo
   );
   return posicao?.label;
}

/**
 * Verifica se uma posição é válida para uma função
 */
export function isPosicaoValidaParaFunc(
   func: FuncType,
   codigo: string
): boolean {
   return FUNCOES_CONFIG[func].posicoes.some((p) => p.codigo === codigo);
}

/**
 * Retorna todas as posições a bordo (flat array de códigos)
 */
export function getTodasPosicoes(): string[] {
   return Object.values(FUNCOES_CONFIG).flatMap((config) =>
      config.posicoes.map((p) => p.codigo)
   );
}
