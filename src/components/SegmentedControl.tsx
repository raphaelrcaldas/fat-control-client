"use client";

import { useId } from "react";
import clsx from "clsx";

type SegmentedOption<T extends string> = {
   label: string;
   value: T;
};

type SegmentedControlProps<T extends string> = {
   options: SegmentedOption<T>[];
   value: T;
   onChange: (value: T) => void;
   /** Rótulo do grupo para leitor de tela — descreva a pergunta, não a resposta. */
   ariaLabel: string;
   className?: string;
};

/**
 * Escolha única entre poucas opções, no formato de trilho.
 *
 * Existe porque um recorte de conjunto ("Ativos" ou "Inativos") não é ação:
 * como botão sólido na cor da marca ele competia com o CTA da página, e como
 * `<select>` escondia atrás de um clique a informação de qual metade da lista
 * está na tela. O trilho mostra as opções e a escolhida ao mesmo tempo.
 *
 * São RADIOS num `fieldset`, não botões com `aria-pressed`: a decisão está
 * registrada em `QuadsToolbar` — botão de alternância finge escolha única, nada
 * no markup diz que as opções são faces da MESMA pergunta, e o teclado trata
 * cada uma como parada de Tab. Com radios o grupo vira uma parada só e as setas
 * passeiam entre as opções, de graça.
 *
 * A altura sai de `py-2` mais o `p-0.5` do trilho: 37px, a mesma dos inputs
 * Flowbite `md` que costumam ficar ao lado. No dedo cada opção vai a 44px.
 */
export function SegmentedControl<T extends string>({
   options,
   value,
   onChange,
   ariaLabel,
   className,
}: SegmentedControlProps<T>) {
   const name = useId();

   return (
      <fieldset
         className={clsx(
            // `min-w-0`: fieldset nasce com `min-width: min-content` e sem isso
            // o `flex-1` das opções não encolhe.
            "flex min-w-0 shrink-0 rounded border border-slate-200 bg-slate-50 p-0.5",
            className
         )}
      >
         <legend className="sr-only">{ariaLabel}</legend>

         {options.map((option) => (
            <label
               key={option.value}
               className={clsx(
                  "has-[:focus-visible]:outline-primary-600 flex flex-1 cursor-pointer items-center justify-center rounded px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors select-none has-[:focus-visible]:outline-[2px] has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:[outline-style:solid]",
                  value === option.value
                     ? "bg-white text-slate-900 shadow-sm"
                     : "text-slate-500 hover:text-slate-800"
               )}
            >
               <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => onChange(option.value)}
                  className="sr-only"
               />
               {option.label}
            </label>
         ))}
      </fieldset>
   );
}
