"use client";

import clsx from "clsx";

interface BrancoToggleProps {
   /** Derivado dos dados (qtd/peso === 0) — o bloco nao guarda estado proprio. */
   active: boolean;
   onToggle: () => void;
}

/**
 * Marca o lancamento como "em branco": a passagem foi voada e todo o
 * procedimento executado, mas nada foi largado (simulado).
 *
 * O chip e slate de proposito: a cor do bloco continua sendo a do
 * especifico (verde PQD / vermelho carga) e o neutro sinaliza justamente
 * a ausencia de largada.
 */
export function BrancoToggle({ active, onToggle }: BrancoToggleProps) {
   return (
      <button
         type="button"
         role="switch"
         aria-checked={active}
         onClick={onToggle}
         title="Lançamento em branco: procedimento executado, nada largado"
         className={clsx(
            "rounded border px-2.5 py-1.75 text-xs font-bold tracking-wide uppercase focus:outline-none",
            active
               ? "border-slate-700 bg-slate-700 text-white"
               : "border-slate-300 bg-white text-slate-500 hover:bg-slate-100"
         )}
      >
         Branco
      </button>
   );
}
