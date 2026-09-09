/**
 * Tema compartilhado das trilhas de auditoria (indisponibilidade e OM).
 *
 * O padrão da Timeline do Flowbite foi desenhado para post de blog: `mb-10`
 * por item (35px aqui, com a raiz do `client` em 87,5%) e título em `text-lg`.
 * Numa trilha de auditoria isso rende dois ou três eventos por tela. A
 * densidade cai para o passo do resto do sistema, e o gap entre eventos passa
 * a vir de um lugar só — o `mb` do item — em vez de somar com o `mb-4` do
 * corpo.
 *
 * Declara **só o que muda**: o `resolve-theme` do Flowbite concatena com o
 * tema base e resolve com twMerge.
 *
 * Mora aqui, e não em cada tela, porque as duas trilhas precisam ler como a
 * mesma coisa — foi o que já se perdeu quando o mesmo motivo tinha três tons
 * diferentes em telas vizinhas.
 */
export const TIMELINE_DENSO = {
   root: {
      /**
       * `border-gray-200` medido no navegador dava 0,8px em lab(91,6) — linha
       * de subpixel quase branca, invisível na prática. A linha é o que faz a
       * trilha ler como trilha e não como uma pilha de bolinhas soltas, então
       * sobe um degrau de contraste. `slate-300` continua discreto.
       */
      direction: { vertical: "relative border-l border-slate-300" },
   },
   item: {
      root: { vertical: "mb-4 ml-4" },
      content: {
         title: { base: "text-sm font-semibold text-slate-800" },
         body: { base: "mb-0 text-sm font-normal text-slate-600" },
         time: {
            base: "mb-0.5 text-xs font-normal leading-none text-slate-400",
         },
      },
   },
};

/**
 * Cor da bolinha por tipo de evento — verde nasce, amarelo muda, vermelho
 * morre. É o único elemento que se repete em toda a coluna, então percorrer a
 * trilha de cima a baixo já conta a história sem ler texto.
 *
 * Vai pelo `theme` do `TimelinePoint`, nunca por `className`: a `className`
 * cai no wrapper (vazio e sem dimensão) e a bolinha, que é um filho interno,
 * continua cinza. Ver `docs/ai/notes/frontend-armadilhas.md`.
 */
export const PONTO_POR_ACAO = {
   create: "bg-emerald-500",
   update: "bg-amber-500",
   delete: "bg-red-600",
} as const;

/** Monta o override do `TimelinePoint` para a cor dada. */
export function pontoTheme(cor: string) {
   return { marker: { base: { vertical: cor } } };
}
