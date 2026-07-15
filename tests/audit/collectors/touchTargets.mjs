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
export function createTouchTargetsCollector({ coarseMinPx, fineMinPx }) {
   const INTERACTIVE =
      "a[href], button, input, select, textarea, [role=button], [role=link], [role=tab], [role=checkbox], [tabindex]:not([tabindex='-1'])";

   return {
      name: "touchTargets",

      collect: ({ page, breakpoint }) => {
         const coarse = Boolean(breakpoint.touch);
         const minSizePx = coarse ? coarseMinPx : fineMinPx;

         return page.evaluate(
            ({ selector, minSizePx, coarse }) => {
               const { selectorOf, visibleElements } = window.__audit;
               const small = [];

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
                  if (minSide >= minSizePx) continue;

                  small.push({
                     selector: selectorOf(el),
                     width: Math.round(rect.width),
                     height: Math.round(rect.height),
                     label: (el.getAttribute("aria-label") ?? el.textContent ?? "")
                        .trim()
                        .slice(0, 40),
                  });
               }

               return {
                  pointer: coarse ? "coarse (dedo)" : "fine (mouse)",
                  minSizePx,
                  total: small.length,
                  items: small.slice(0, 20),
               };
            },
            { selector: INTERACTIVE, minSizePx, coarse },
         );
      },

      render: (data) => ({
         rows: [
            ["Ponteiro", data.pointer],
            [`Alvos abaixo de ${data.minSizePx}px`, data.total],
         ],
         sections: data.items.length
            ? [
                 {
                    title: `Alvos abaixo do minimo para ${data.pointer} (${data.minSizePx}px)`,
                    items: data.items.map(
                       (t) => `\`${t.selector}\` — ${t.width}x${t.height}px — "${t.label}"`,
                    ),
                 },
              ]
            : [],
      }),
   };
}
