"use client";

import { useEffect, useRef, useState } from "react";
import { HiOutlinePencil } from "react-icons/hi";

interface InlineNameInputProps {
   value: string;
   /** Chamado no blur/Enter com o nome já aparado. Nunca a cada tecla. */
   onCommit: (nome: string) => void;
   ariaLabel: string;
   maxLength?: number;
}

/**
 * Título editável no lugar. O texto digitado vive em estado local e só chega
 * ao rascunho no commit (Enter ou blur) — teclar aqui não pode disparar
 * re-render da tabela inteira. `Esc` descarta.
 */
export function InlineNameInput({
   value,
   onCommit,
   ariaLabel,
   maxLength = 80,
}: InlineNameInputProps) {
   const [editing, setEditing] = useState(false);
   const [text, setText] = useState(value);
   const inputRef = useRef<HTMLInputElement>(null);

   // Fora do modo de edição o campo espelha o valor externo (ex.: eco do save).
   useEffect(() => {
      if (!editing) setText(value);
   }, [value, editing]);

   useEffect(() => {
      if (editing) inputRef.current?.select();
   }, [editing]);

   function commit() {
      const limpo = text.trim();
      setEditing(false);
      if (!limpo) {
         setText(value);
         return;
      }
      if (limpo !== value) onCommit(limpo);
   }

   if (!editing) {
      return (
         <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label={`${ariaLabel}: ${value}. Clique para renomear`}
            className="focus-visible:ring-primary-500 group inline-flex max-w-full items-center gap-2 rounded text-left focus:outline-none focus-visible:ring-2"
         >
            <span className="truncate text-base font-semibold text-slate-900">
               {value}
            </span>
            <HiOutlinePencil
               aria-hidden
               className="h-3.5 w-3.5 shrink-0 text-slate-500 transition-colors group-hover:text-slate-700 pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100"
            />
         </button>
      );
   }

   return (
      <input
         ref={inputRef}
         value={text}
         aria-label={ariaLabel}
         maxLength={maxLength}
         autoFocus
         onChange={(e) => setText(e.target.value)}
         onBlur={commit}
         onKeyDown={(e) => {
            if (e.key === "Enter") {
               e.preventDefault();
               commit();
            }
            if (e.key === "Escape") {
               e.preventDefault();
               setText(value);
               setEditing(false);
            }
         }}
         className="focus:border-primary-500 focus:ring-primary-500 w-full max-w-md rounded border border-slate-300 bg-white px-2 py-1 text-base font-semibold text-slate-900"
      />
   );
}
