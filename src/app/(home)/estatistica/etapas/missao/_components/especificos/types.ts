import type { DraftHeavyCds, DraftPqd, DraftRevo } from "../../_state/types";

export interface PqdBlockProps {
   item: DraftPqd;
   index: number;
   onChange: (patch: Partial<DraftPqd>) => void;
   onRemove: () => void;
}

export interface RevoBlockProps {
   item: DraftRevo;
   index: number;
   onChange: (patch: Partial<DraftRevo>) => void;
   onRemove: () => void;
}

export interface HeavyCdsBlockProps {
   item: DraftHeavyCds;
   index: number;
   onChange: (patch: Partial<DraftHeavyCds>) => void;
   onRemove: () => void;
}

/** Classe de label compartilhada pelos campos dos especificos. */
export const especificoLabelClass =
   "mb-1 block text-[11px] font-semibold tracking-wide text-gray-500 uppercase";

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
