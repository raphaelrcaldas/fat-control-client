import type { DraftHeavyCds, DraftPqd, DraftRevo } from "../../context/types";

export interface PqdBlockProps {
   item: DraftPqd;
   index: number;
   onChange: (patch: Partial<DraftPqd>) => void;
   onRemove: () => void;
   /** Houve tentativa de salvar: exibe o erro mesmo em campo nao tocado. */
   showErrors: boolean;
}

export interface RevoBlockProps {
   item: DraftRevo;
   index: number;
   onChange: (patch: Partial<DraftRevo>) => void;
   onRemove: () => void;
   /** Houve tentativa de salvar: exibe o erro mesmo em campo nao tocado. */
   showErrors: boolean;
}

export interface HeavyCdsBlockProps {
   item: DraftHeavyCds;
   index: number;
   onChange: (patch: Partial<DraftHeavyCds>) => void;
   onRemove: () => void;
   /** Houve tentativa de salvar: exibe o erro mesmo em campo nao tocado. */
   showErrors: boolean;
}

/** Label inline (ao lado do controle) compartilhada pelos campos dos especificos. */
export const inlineLabelClass =
   "text-xs font-semibold tracking-wide text-gray-500 uppercase";

/**
 * Converte string de input numerico para inteiro no intervalo dado.
 * Retorna `null` quando vazio (permite limpar o campo e redigitar);
 * caso contrario, faz clamp ao intervalo [min, max].
 */
export function parseIntOrNull(
   raw: string,
   min: number,
   max: number
): number | null {
   if (raw.trim() === "") return null;
   const n = Math.trunc(Number(raw));
   if (Number.isNaN(n)) return null;
   return Math.min(max, Math.max(min, n));
}

/**
 * Botao de remover dos especificos. O hover e `red-100` (nao `red-50`) para
 * aparecer tambem sobre o fundo `red-50` do bloco de carga.
 */
export const removeButtonClass =
   "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600";
