/**
 * Medidas da célula de quadrinho — as mesmas na grade e no seu esqueleto.
 *
 * Mora num módulo próprio porque a célula aparece em dois lugares
 * (`QuadPopover.tsx` e `QuadsBoardSkeleton.tsx`) e já divergiu duas vezes: o
 * esqueleto ficou em `sm:w-18` quando a célula foi para `sm:w-20`, e no
 * celular a célula parava em 32px enquanto o botão do trigrama ia a 44px —
 * 12px de degrau na faixa que o olho usa como régua ao descer a grade.
 *
 * Quem manda no número é o botão do trigrama: ele é o único ALVO da linha e
 * ganha os 44px do dedo pelo `pointer-coarse:min-h-[44px]` que o tema aplica a
 * todo `Button` (`src/app/context/theme.tsx`). A célula é marcador decorativo
 * e acompanha — pelo mesmo mecanismo, para subir junto se o piso mudar.
 *
 * Em **px cravado**, e não `h-11`: a raiz do client é 87,5%, então `h-11`
 * renderiza 38,5px e não cumpre os 44 (ver `rules/frontend/components.md`).
 */
export const CELULA_QUADRINHO =
   "size-9 pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]";

/**
 * Largura por modo de visualização, a partir de `sm`.
 *
 * Abaixo de `sm` a célula não mostra a data (o texto é `hidden sm:block`), e
 * aí ela é um QUADRADO por definição — largura igual à altura, inclusive no
 * salto para os 44px do dedo, que o `min-w` do token acima garante. O modo
 * reduzido nunca mostra a data, então segue quadrado em qualquer largura.
 */
export const LARGURA_POR_VISUAL = {
   comp: "sm:w-20",
   reduz: "sm:w-9",
} as const;
