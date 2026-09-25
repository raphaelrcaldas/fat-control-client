"use client";

import type { CSSProperties } from "react";
import { HiCheck } from "react-icons/hi";
import clsx from "clsx";

// Só o que o chip desenha — serve à Etiqueta da API e a uma prévia de
// formulário ainda sem id
interface EtiquetaVisual {
   nome: string;
   cor: string;
   descricao?: string | null;
}

interface EtiquetaChipProps {
   etiqueta: EtiquetaVisual;
   // Com `onToggle` o chip é um botão de alternar (aria-pressed); sem ele,
   // é exibição estática, sempre no visual de selecionada
   selected?: boolean;
   onToggle?: () => void;
   // `sm` para contextos densos (card da lista de OMs)
   size?: "sm" | "md";
   className?: string;
}

/**
 * Etiqueta de OM — fonte única do visual nas quatro telas (seção
 * Classificação, modal de gerenciar, filtros e card da lista).
 *
 * O nome é sempre escuro; a cor livre da etiqueta vai só para a bolinha, a
 * borda e um tingimento leve do fundo. Antes o nome saía na própria cor sobre
 * fundo claro dela: 10 de 13 etiquetas da 11gt reprovavam AA (NACIONAL 2,06:1),
 * e a cor é escolhida livremente no cadastro.
 *
 * A marca de seleção vive DENTRO da bolinha, de largura fixa: alternar não
 * muda a largura do chip e a fileira não se reorganiza sob o dedo.
 */
export function EtiquetaChip({
   etiqueta,
   selected = true,
   onToggle,
   size = "md",
   className,
}: EtiquetaChipProps) {
   const isToggle = onToggle !== undefined;
   const marcada = !isToggle || selected;

   // Borda e fundo na cor da etiqueta só quando marcada; desmarcada fica
   // neutra (as classes de borda/fundo neutras entram pelo clsx abaixo)
   const style: CSSProperties | undefined = marcada
      ? {
           borderColor: etiqueta.cor,
           backgroundColor: `color-mix(in srgb, ${etiqueta.cor} 14%, white)`,
        }
      : undefined;

   const classes = clsx(
      "inline-flex max-w-full items-center rounded-full border font-medium text-slate-800",
      size === "sm"
         ? "gap-1 px-2 py-0.5 text-[11px]"
         : "min-h-[24px] gap-1.5 px-2.5 py-0.5 text-xs",
      !marcada && "border-slate-300 bg-white",
      isToggle &&
         "focus-visible:ring-primary-500 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:outline-none",
      isToggle && !marcada && "hover:border-slate-400 hover:bg-slate-50",
      className
   );

   const dotSize = size === "sm" ? "size-2" : "size-3.5";
   const conteudo = (
      <>
         <span
            aria-hidden
            className={clsx(
               "grid shrink-0 place-items-center rounded-full",
               dotSize
            )}
            style={
               // Desmarcada (toggle): anel vazio na cor; marcada: preenchida
               isToggle && !selected
                  ? { boxShadow: `inset 0 0 0 2px ${etiqueta.cor}` }
                  : { backgroundColor: etiqueta.cor }
            }
         >
            {isToggle && selected && (
               <HiCheck className="size-2.5 text-white" />
            )}
         </span>
         <span className="truncate">{etiqueta.nome}</span>
      </>
   );

   const title = etiqueta.descricao || etiqueta.nome;

   if (isToggle) {
      return (
         <button
            type="button"
            aria-pressed={selected}
            onClick={onToggle}
            title={title}
            className={classes}
            style={style}
         >
            {conteudo}
         </button>
      );
   }

   return (
      <span title={title} className={classes} style={style}>
         {conteudo}
      </span>
   );
}
