/**
 * Tipos de operacionalidade de tripulantes
 */

import type { Theme } from "./theme.types";

/** Níveis de operacionalidade (qualificação) */
export type OperType = "ba" | "op" | "in" | "al";

/** Configuração de um nível de operacionalidade */
export interface OperConfig {
   /** Label para exibição */
   label: string;
   /** Descrição do nível */
   descricao: string;
   /** Configuração de tema/cores */
   theme: Theme;
}
