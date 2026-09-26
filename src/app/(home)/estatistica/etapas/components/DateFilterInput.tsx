"use client";

import { useEffect, useRef, useState } from "react";
import { TextInput } from "flowbite-react";

/** Pausa na digitação antes de a data ir à URL. */
const COMMIT_DELAY_MS = 400;

interface DateFilterInputProps {
   id: string;
   /** Valor vigente na URL. */
   value: string;
   min?: string;
   max?: string;
   /** Grava a data; devolve `false` se o valor não foi aceito. */
   onCommit: (value: string) => boolean;
}

/**
 * Campo de data com rascunho local. Ligado direto à URL, o `value` só muda
 * quando a transição do `router.replace` comita — e a cada tecla o React
 * devolvia ao DOM a data antiga, reiniciando a edição por segmento: digitar
 * 15/05/2025 pelo teclado terminava em 2026-06-25 (medido no Chromium).
 *
 * - O rascunho acompanha a digitação; a data vai à URL após uma pausa
 *   (`COMMIT_DELAY_MS`) ou no blur. Sem a pausa, cada data válida
 *   intermediária ("1" de "15" = dia 01) virava consulta e podia inverter
 *   o período por um instante.
 * - No blur, data aceita fica; recusada (ano pela metade) volta ao vigente.
 * - Com foco, só os valores que o próprio campo gravou nesta edição são
 *   ignorados ao chegar da URL (sincronizá-los reiniciaria a digitação);
 *   qualquer outro — reset pelo chip, voltar/avançar — sincroniza na hora.
 * - Limpeza total (botão "Limpar" do calendário) não esvazia o filtro: o
 *   campo volta ao vigente. Limpar é pelo X do chip.
 */
export function DateFilterInput({
   id,
   value,
   min,
   max,
   onCommit,
}: DateFilterInputProps) {
   const [draft, setDraft] = useState(value);
   const focusedRef = useRef(false);
   const emittedRef = useRef(new Set<string>());
   const lastEmittedRef = useRef<string | null>(null);
   const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

   useEffect(() => {
      if (focusedRef.current && emittedRef.current.has(value)) return;
      setDraft(value);
   }, [value]);

   useEffect(
      () => () => {
         if (timerRef.current) clearTimeout(timerRef.current);
      },
      []
   );

   const cancelTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
   };

   const commit = (next: string): boolean => {
      cancelTimer();
      const accepted = onCommit(next);
      if (accepted) {
         emittedRef.current.add(next);
         lastEmittedRef.current = next;
      }
      return accepted;
   };

   return (
      <TextInput
         id={id}
         type="date"
         value={draft}
         min={min}
         max={max}
         onFocus={() => {
            focusedRef.current = true;
            emittedRef.current.clear();
            lastEmittedRef.current = null;
         }}
         onBlur={() => {
            focusedRef.current = false;
            // Commit pendente vem primeiro: o rascunho pode ter voltado a
            // `value` enquanto outra data aceita ainda viajava para a URL.
            // Fora disso, só a ÚLTIMA gravação vale — uma anterior pode ter
            // sido desfeita por voltar/avançar com o campo em foco.
            const aceito =
               timerRef.current !== null
                  ? commit(draft)
                  : draft === value || draft === lastEmittedRef.current;
            cancelTimer();
            if (!aceito) setDraft(value);
         }}
         onChange={(e) => {
            const next = e.target.value;
            // "" sem `badInput` = campo inteiro limpo, não segmento parcial.
            if (next === "" && !e.target.validity.badInput) {
               cancelTimer();
               setDraft(value);
               return;
            }
            setDraft(next);
            cancelTimer();
            timerRef.current = setTimeout(() => commit(next), COMMIT_DELAY_MS);
         }}
         sizing="sm"
      />
   );
}
