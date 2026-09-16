/**
 * Medidas da célula de quadrinho — as mesmas na grade e no seu esqueleto.
 *
 * Mora num módulo próprio porque a célula aparece em dois lugares
 * (`QuadPopover.tsx` e `QuadsBoardSkeleton.tsx`) e já divergiu: o esqueleto
 * ficou em `sm:w-18` quando a célula foi para `sm:w-20`.
 *
 * Quem manda no número é o botão do trigrama: ele é o único ALVO da linha, e a
 * célula é marcador decorativo que acompanha o mesmo tamanho.
 */
export const CELULA_QUADRINHO = "size-9";

/**
 * Largura por modo de visualização, a partir de `sm`.
 *
 * Abaixo de `sm` a célula não mostra a data (o texto é `hidden sm:block`), e
 * aí ela é um QUADRADO por definição — largura igual à altura. O modo
 * reduzido nunca mostra a data, então segue quadrado em qualquer largura.
 */
export const LARGURA_POR_VISUAL = {
   comp: "sm:w-20",
   reduz: "sm:w-9",
} as const;
