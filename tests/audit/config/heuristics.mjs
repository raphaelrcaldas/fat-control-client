/**
 * Reguas de UI/UX aplicadas pelos coletores.
 *
 * Politica separada do mecanismo: mudar um limiar (ex: alvo minimo de toque)
 * nao encosta no coletor que o usa — ele recebe a regua por injecao.
 */

export const HEURISTICS = {
   /**
    * UMA regua, igual em qualquer ponteiro: 24x24, o minimo do WCAG 2.2
    * (criterio 2.5.8). O controle tem o mesmo tamanho no desktop e no
    * celular — ver `docs/ai/rules/frontend.md`.
    *
    * `band*`: alvo em FAIXA (linha de tabela/lista clicavel) tem regua propria.
    * Ele atravessa o container, entao Fitts ja esta satisfeito na horizontal e
    * o erro de toque so acontece no eixo vertical. `bandMinPx` e 20, ABAIXO da
    * regua compacta de propósito: uma linha de tabela com 24px de altura ja e
    * confortavel de acertar, e cobrar dela o mesmo que de um icone solto
    * engordava a tabela inteira — ~30% de altura por linha, ~3 linhas a menos
    * por tela. `bandWidthFactor` define o que conta como faixa: largura >= N x
    * a regua (24*3 = 72px).
    */
   touchTarget: {
      minPx: 24,
      bandMinPx: 20,
      bandWidthFactor: 3,
   },

   /**
    * Grade do Tailwind. O passo e 0.125rem, nao 0.25rem: a escala tem os meios
    * (`p-1.5` = 0.375rem, `p-2.5` = 0.625rem), que sao classes oficiais — cobrar
    * 0.25rem acusaria de "fora do sistema" quem esta usando o sistema.
    *
    * Medido em REM, nao em px: o `client` usa raiz de 87.5% (1rem = 14px), entao
    * a escala inteira encolhe e um `p-2` rende 7px. Regua em px acusaria a tela
    * toda de estar fora da grade quando ela so esta noutra base.
    */
   spacing: { gridRem: 0.125 },

   /** Medida (comprimento de linha) legivel para texto corrido. */
   lineMeasure: { minChars: 45, maxChars: 75, minTextLength: 120 },

   /** Entrelinha apertada em texto de leitura cansa; titulos podem ser apertados. */
   typography: { minLineHeightRatio: 1.35, bodyMaxFontSizePx: 16 },

   /**
    * Padrao visual do projeto (rules/frontend/components.md): `rounded`
    * (0.25rem) e, so em caixa de icone, `rounded-md` (0.375rem). Tambem em rem,
    * pelo mesmo motivo do spacing. `pillMinPx` isenta `rounded-full`.
    */
   shape: { allowedRadiiRem: [0.25, 0.375], pillMinPx: 100 },

   /** Google considera bom ate 0.1. */
   layoutShift: { goodClsThreshold: 0.1 },

   /**
    * Movimento. `maxDurationMs` e a fronteira do "arrastado": micro-interacao
    * de UI vive entre 150 e 300ms, e acima de 400 a interface parece lenta ao
    * inves de fluida. Duracao CURTA nao tem regua — um hover de 80ms e uma
    * escolha legitima, e cobrar um minimo so geraria ruido.
    *
    * `reducedMaxMs` e 1, nao 0, porque o jeito correto de atender
    * `prefers-reduced-motion` com Radix e encolher a duracao para 0.01ms: com
    * duracao zero o painel nao chega a desmontar. Isso e conformidade, nao
    * achado.
    *
    * `compositedProps` sobem para a GPU (sem reflow); `layoutProps` sao
    * prefixos que forcam layout a cada quadro. O que nao esta em nenhuma das
    * duas cai em "paint" — mais caro que composited, mais barato que layout.
    *
    * Excecao conhecida ao ler o relatorio: `grid-template-rows` (o `0fr` ->
    * `1fr` de um disclosure) cai em layout pelo prefixo `grid` e SEMPRE vai
    * aparecer no achado. Ele e a forma correta de animar a altura real de um
    * painel — a alternativa e `max-height` chutado, que tambem e layout e
    * ainda erra a altura. Um disclosure listado ali nao e defeito.
    */
   motion: {
      /* Duas réguas, porque são dois tipos de movimento com contratos
         diferentes. Uma TRANSIÇÃO responde a um gesto (hover, foco) e compete
         com a mão do usuário: acima de 400ms a interface parece arrastada.
         Uma ANIMAÇÃO de keyframes normalmente é entrada de conteúdo, roda uma
         vez na montagem e não bloqueia nada — encurtá-la para caber na régua
         de hover só deixaria a entrada abrupta. */
      maxDurationMs: 400,
      maxEnterMs: 600,
      reducedMaxMs: 1,
      compositedProps: [
         "transform",
         "opacity",
         "filter",
         "backdrop-filter",
         "translate",
         "rotate",
         "scale",
      ],
      layoutProps: [
         "width",
         "height",
         "top",
         "left",
         "right",
         "bottom",
         "inset",
         "margin",
         "padding",
         "font-size",
         "gap",
         "flex",
         "grid",
         "block-size",
         "inline-size",
      ],
   },

   accessibility: {
      tags: [
         "wcag2a",
         "wcag2aa",
         "wcag21a",
         "wcag21aa",
         "wcag22aa",
         "best-practice",
      ],
   },

   /**
    * `maxStops` conta so as paradas MEDIDAS. Navbar e sidebar vem antes do
    * conteudo na ordem de Tab e no `client` passam de 30 paradas sozinhas, o
    * que fazia o coletor terminar dentro do menu e devolver um verde que nao
    * media a tela auditada. Elas sao atravessadas com orcamento proprio
    * (`maxSkips`) — generoso porque o custo de errar para menos e nao alcancar
    * o conteudo, que era justamente o defeito.
    *
    * `skipWithin` nomeia o chrome por PAPEL (landmark ARIA), nao por classe:
    * serve aos tres fronts sem saber o markup de nenhum.
    */
   focusRing: {
      maxStops: 30,
      maxSkips: 400,
      skipWithin: [
         "nav",
         "aside",
         "[role=navigation]",
         "[role=banner]",
         "[data-audit-skip]",
      ],
   },

   /**
    * Corte de conteudo dentro do proprio elemento. `minOverflowPx` de 2 porque
    * arredondamento de subpixel produz 1px de sobra em texto que cabe.
    * `minBoxPx` descarta caixa pequena demais para caber letra — a assinatura
    * do `sr-only`, onde o recorte e a tecnica e nao o defeito.
    */
   contentClipping: { minOverflowPx: 2, minBoxPx: 8, maxItems: 12 },
};
