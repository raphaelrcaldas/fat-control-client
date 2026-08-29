/**
 * Conteudo cortado dentro do proprio elemento.
 *
 * Existe uma classe de defeito que nenhuma outra metrica enxerga: o texto esta
 * no DOM, o leitor de tela le inteiro, o axe nao reclama, nao ha scroll lateral
 * — e na tela ele aparece cortado no meio de um glifo. Foi assim que a grade de
 * indisponibilidades passou a mostrar "REI" no lugar de "REP": a faixa de um dia
 * media 35px e o conteudo pedia 47px.
 *
 * A distincao que faz este coletor valer alguma coisa e entre CORTE e
 * TRUNCAGEM:
 *
 * - `text-overflow: ellipsis` (ou `-webkit-line-clamp`) e degradacao
 *   DELIBERADA: "CEMAL venci…" avisa que continua. Reportar isso como defeito
 *   faria o coletor gritar em cada `truncate` da aplicacao e ser ignorado.
 * - `overflow: hidden` sem reticencias corta no meio da letra e MENTE: quem le
 *   nao tem como saber que falta pedaco. Esse e o defeito.
 *
 * Container com `overflow: auto/scroll` fica de fora: ali estourar e o
 * contrato, e a rolagem e a saida. Caixa menor que `minBoxPx` tambem: e a
 * assinatura do `sr-only` (1x1px com overflow hidden), onde o recorte E a
 * tecnica — texto que existe so para o leitor de tela. Sem esse filtro o
 * coletor acusava dois "defeitos" por pagina que ninguem podia consertar, e
 * relatorio que cria ruido deixa de ser lido.
 */
export function createContentClippingCollector({
   minOverflowPx,
   minBoxPx,
   maxItems,
}) {
   return {
      name: "contentClipping",

      collect: ({ page }) =>
         page.evaluate(
            ({ minOverflowPx, minBoxPx, maxItems }) => {
               const { selectorOf, visibleElements, ownText } = window.__audit;
               const cortados = [];
               const truncados = [];

               // Eixo cujo overflow o proprio elemento esconde. `clip` e o
               // valor moderno de `overflow: hidden` sem caixa de rolagem.
               const escondeEixo = (valor) =>
                  valor === "hidden" || valor === "clip";

               for (const el of visibleElements()) {
                  const texto = ownText(el);
                  if (!texto) continue;

                  // Caixa pequena demais para caber letra legivel: e tecnica de
                  // ocultacao (sr-only), nao layout apertado.
                  if (el.clientWidth < minBoxPx || el.clientHeight < minBoxPx) {
                     continue;
                  }

                  const style = getComputedStyle(el);
                  const faltaX = el.scrollWidth - el.clientWidth;
                  const faltaY = el.scrollHeight - el.clientHeight;

                  const cortaX =
                     escondeEixo(style.overflowX) && faltaX >= minOverflowPx;
                  const cortaY =
                     escondeEixo(style.overflowY) && faltaY >= minOverflowPx;
                  if (!cortaX && !cortaY) continue;

                  const item = {
                     selector: selectorOf(el),
                     texto: texto.replace(/\s+/g, " ").slice(0, 40),
                     eixo: cortaX ? "horizontal" : "vertical",
                     precisaPx: cortaX ? el.scrollWidth : el.scrollHeight,
                     temPx: cortaX ? el.clientWidth : el.clientHeight,
                     faltaPx: cortaX ? faltaX : faltaY,
                  };

                  // Reticencias so resolvem o eixo horizontal; `line-clamp`
                  // resolve o vertical. Corte no outro eixo segue sendo corte.
                  const avisa = cortaX
                     ? style.textOverflow === "ellipsis"
                     : style.webkitLineClamp !== "none";

                  (avisa ? truncados : cortados).push(item);
               }

               const ordena = (lista) =>
                  lista
                     .sort((a, b) => b.faltaPx - a.faltaPx)
                     .slice(0, maxItems);

               return {
                  cortados: ordena(cortados),
                  truncados: ordena(truncados),
                  totalCortados: cortados.length,
                  totalTruncados: truncados.length,
               };
            },
            { minOverflowPx, minBoxPx, maxItems }
         ),

      render: (data) => ({
         rows: [
            [
               "Conteudo cortado",
               data.totalCortados === 0
                  ? "nao"
                  : `SIM — ${data.totalCortados} elemento(s) sem reticencias`,
            ],
            ["Truncado com reticencias", data.totalTruncados],
         ],
         sections: data.cortados.length
            ? [
                 {
                    title: "Texto cortado sem aviso (corta no meio do glifo)",
                    items: data.cortados.map(
                       (c) =>
                          `\`${c.selector}\` — "${c.texto}" precisa de ${c.precisaPx}px ${c.eixo === "horizontal" ? "de largura" : "de altura"} e tem ${c.temPx}px (faltam ${c.faltaPx}px)`
                    ),
                 },
              ]
            : [],
      }),
   };
}
