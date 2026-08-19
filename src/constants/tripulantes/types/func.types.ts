/**
 * Tipos de funções de tripulantes.
 *
 * Não há mais união fechada de códigos: a função virou dado (tabelas
 * `funcoes`/`funcoes_uae`) e o conjunto válido depende da unidade. Ver
 * `useFuncoes()` em `src/hooks/queries/useFuncoes.ts`.
 */

/** Código da função ('pil', 'mc', ...). */
export type FuncType = string;

/** @deprecated Use FuncType — as "principais" saem de `useFuncoes()`. */
export type FuncaoTripulante = FuncType;

/** Posição a bordo de um tripulante em uma etapa/voo. */
export interface PosicaoABordo {
   /** Código da posição (ex: "1P", "2P", "IC") */
   cod: string;
   /** Label para exibição (ex: "1º Piloto", "Instrutor") */
   nome: string;
   /** Descrição detalhada da posição */
   descricao?: string | null;
}
