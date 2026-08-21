/**
 * Tamanho dos alvos interativos (Lei de Fitts).
 *
 * A regua segue o ponteiro, nao o tamanho da tela: no dedo cobramos 44x44 (o
 * alvo confortavel — este sistema roda em tablet no hangar); no mouse, o minimo
 * do WCAG 2.2 (2.5.8), 24x24. Cobrar 44px no desktop inflaria o shell e mataria
 * a densidade, que num sistema operacional e qualidade e nao defeito.
 *
 * Por isso os breakpoints de toque rodam com `hasTouch` (ver browserSession):
 * o que medimos aqui e a mesma condicao que a pagina ve em
 * `@media (pointer: coarse)`.
 */
export function createTouchTargetsCollector({
   coarseMinPx,
   fineMinPx,
   bandMinPx,
   bandWidthFactor,
}) {
   const INTERACTIVE =
      "a[href], button, input, select, textarea, [role=button], [role=link], [role=tab], [role=checkbox], [tabindex]:not([tabindex='-1'])";

   return {
      name: "touchTargets",

      collect: ({ page, breakpoint }) => {
         const coarse = Boolean(breakpoint.touch);
         const minSizePx = coarse ? coarseMinPx : fineMinPx;

         return page.evaluate(
            ({ selector, minSizePx, coarse, bandMinPx, bandWidthFactor }) => {
               const { selectorOf, visibleElements } = window.__audit;
               const small = [];
               const bandWidthPx = minSizePx * bandWidthFactor;

               for (const el of visibleElements()) {
                  if (!el.matches(selector)) continue;
                  if (el.matches("input[type=hidden]")) continue;

                  const rect = el.getBoundingClientRect();
                  const minSide = Math.min(rect.width, rect.height);
                  // Sentinelas de focus-trap (floating-ui, Radix, etc.) medem
                  // <=1px por design — sao invisiveis, nao alvos de toque. O
                  // sinal e GEOMETRICO, nao um atributo de vendor: cobre
                  // qualquer lib, e nao isenta botao real marcado (errado)
                  // com aria-hidden, que continua sendo medido.
                  if (minSide <= 1) continue;

                  // Alvo em FAIXA (linha de tabela/lista clicavel): atravessa o
                  // container, entao so erra no eixo vertical — cobrar dele os
                  // 44px do menor lado engordava a tabela inteira. Regua
                  // geometrica, nao por tag: pega <tr role=button>, <li>, <a>
                  // de lista e qualquer faixa larga.
                  const band = rect.width >= bandWidthPx;
                  const floor = band ? bandMinPx : minSizePx;
                  // Na faixa so a ALTURA e cobrada (a largura ja sobra); no
                  // alvo compacto continuam valendo os dois lados.
                  if (band ? rect.height >= floor : minSide >= floor) continue;

                  small.push({
                     selector: selectorOf(el),
                     width: Math.round(rect.width),
                     height: Math.round(rect.height),
                     floor,
                     band,
                     label: (
                        el.getAttribute("aria-label") ??
                        el.textContent ??
                        ""
                     )
                        .trim()
                        .slice(0, 40),
                  });
               }

               return {
                  pointer: coarse ? "coarse (dedo)" : "fine (mouse)",
                  minSizePx,
                  bandMinPx,
                  total: small.length,
                  items: small.slice(0, 20),
               };
            },
            {
               selector: INTERACTIVE,
               minSizePx,
               coarse,
               bandMinPx,
               bandWidthFactor,
            }
         );
      },

      render: (data) => ({
         rows: [
            ["Ponteiro", data.pointer],
            ["Regua", `${data.minSizePx}px (faixa: ${data.bandMinPx}px alt.)`],
            ["Alvos abaixo da regua", data.total],
         ],
         sections: data.items.length
            ? [
                 {
                    // A regua vem escrita em cada item: sem isso o achado era
                    // lido como "faltam 44px" e a correcao virava altura de
                    // linha inflada. Faixa deve ser corrigida na ALTURA.
                    title: `Alvos abaixo do minimo para ${data.pointer} (compacto ${data.minSizePx}px; faixa ${data.bandMinPx}px de altura)`,
                    items: data.items.map(
                       (t) =>
                          `\`${t.selector}\` — ${t.width}x${t.height}px — minimo ${t.floor}px${t.band ? " (faixa: so a altura conta)" : ""} — "${t.label}"`
                    ),
                 },
              ]
            : [],
      }),
   };
}
