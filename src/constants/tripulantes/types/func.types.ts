/**
 * Tipos de funções de tripulantes
 */

import type { Theme } from "./theme.types";

/** Todas as funções de tripulantes */
export type FuncType = "pil" | "mc" | "lm" | "oe" | "os" | "tf" | "ml" | "md";

/** Funções principais (excluindo ml e md que são esporádicas) */
export type FuncaoTripulante = "pil" | "mc" | "lm" | "tf" | "oe" | "os";

/** Posição a bordo de um tripulante em uma etapa/voo */
export interface PosicaoABordo {
   /** Código da posição (ex: "1P", "2P", "IC") */
   codigo: string;
   /** Label para exibição (ex: "1º Piloto", "Instrutor") */
   label: string;
   /** Descrição detalhada da posição */
   descricao: string;
}

/** Configuração completa de uma função */
export interface FuncConfig {
   /** Label completo (ex: "Piloto") */
   label: string;
   /** Label abreviado para espaços reduzidos */
   labelShort: string;
   /** Configuração de tema/cores */
   theme: Theme;
   /** Posições a bordo disponíveis para esta função */
   posicoes: PosicaoABordo[];
}
