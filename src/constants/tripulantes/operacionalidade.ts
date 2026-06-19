/**
 * Níveis de operacionalidade de tripulantes
 *
 * Fonte única de verdade para operacionalidade, labels, descrições e temas.
 * Estrutura centralizada - todos os outros exports derivam de OPER_CONFIG.
 */

import type { OperConfig, OperType } from "./types";

// Re-export dos tipos
export type { OperType, OperConfig };

// =============================================================================
// CONFIGURAÇÃO CENTRALIZADA
// =============================================================================

/**
 * Configuração completa de todos os níveis de operacionalidade.
 * Fonte única de verdade - todos os outros exports derivam daqui.
 */
export const OPER_CONFIG: Record<OperType, OperConfig> = {
   in: {
      label: "Instrutor",
      descricao: "Habilitado a ministrar instrução",
      theme: { color: "red", badge: "failure" },
   },
   op: {
      label: "Operacional",
      descricao: "Plenamente qualificado para operação",
      theme: { color: "emerald", badge: "success" },
   },
   ba: {
      label: "Básico",
      descricao: "Qualificação básica",
      theme: { color: "amber", badge: "warning" },
   },
   al: {
      label: "Aluno",
      descricao: "Em fase de instrução",
      theme: { color: "cyan", badge: "cyan" },
   },
};

// =============================================================================
// DERIVADOS (para compatibilidade)
// =============================================================================

/** Labels para níveis de operacionalidade */
export const OPER_LABELS: Record<OperType, string> = Object.fromEntries(
   Object.entries(OPER_CONFIG).map(([key, config]) => [key, config.label])
) as Record<OperType, string>;

/** Todos os níveis de operacionalidade */
export const TODOS_NIVEIS_OPER: OperType[] = Object.keys(
   OPER_CONFIG
) as OperType[];

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Classes Tailwind de badge por cor de tema (mapeamento estático para o
 * Tailwind não purgar). Fonte única para colorir o nível de operacionalidade.
 */
const OPER_BADGE_CLASSES: Record<string, string> = {
   red: "bg-red-100 text-red-700",
   emerald: "bg-emerald-100 text-emerald-700",
   amber: "bg-amber-100 text-amber-700",
   cyan: "bg-cyan-100 text-cyan-700",
};

/**
 * Retorna as classes de cor (bg + text) de um nível de operacionalidade,
 * derivadas do tema em OPER_CONFIG.
 */
export function getOperColorClasses(oper: OperType): string {
   const color = OPER_CONFIG[oper].theme.color;
   return OPER_BADGE_CLASSES[color] ?? "bg-gray-100 text-gray-700";
}

/**
 * Retorna o label de um nível de operacionalidade
 */
export function getOperLabel(oper: OperType): string {
   return OPER_CONFIG[oper].label;
}

/**
 * Retorna o tema de um nível de operacionalidade
 */
export function getOperTheme(oper: OperType) {
   return OPER_CONFIG[oper].theme;
}

/**
 * Retorna a descrição de um nível de operacionalidade
 */
export function getOperDescricao(oper: OperType): string {
   return OPER_CONFIG[oper].descricao;
}
