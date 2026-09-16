/**
 * Tamanho dos alvos interativos (Lei de Fitts).
 *
 * UMA regua so, igual em qualquer ponteiro: o minimo do WCAG 2.2 (2.5.8),
 * 24x24. O controle tem o mesmo tamanho no desktop e no celular — ver
 * `docs/ai/rules/frontend.md`.
 *
 * A regua ja foi dupla (44px no dedo, 24px no mouse) e isso produzia duas
 * telas diferentes do mesmo sistema. Pior: as tentativas de cumprir os 44px
 * sem engordar o layout introduziram bug — halo de pseudo-elemento sobre
 * chips numa lista que quebra linha se sobrepunha ao vizinho e roteava o
 * toque para o item ERRADO. Densidade uniforme vale mais que o alvo maior.
 */
export function createTouchTargetsCollector({
   minPx,
   bandMinPx,
   bandWidthFactor,
}) {
   const INTERACTIVE =
      "a[href], button, input, select, textarea, [role=button], [role=link], [role=tab], [role=checkbox], [tabindex]:not([tabindex='-1'])";

   return {
      name: "touchTargets",

      collect: ({ page }) =>
         page.evaluate(
            ({ selector, minPx, bandMinPx, bandWidthFactor }) => {
               const { selectorOf, visibleElements } = window.__audit;
               const small = [];
               const bandWidthPx = minPx * bandWidthFactor;

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
                  const floor = band ? bandMinPx : minPx;
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
                  minPx,
                  bandMinPx,
                  total: small.length,
                  items: small.slice(0, 20),
               };
            },
            {
               selector: INTERACTIVE,
               minPx,
               bandMinPx,
               bandWidthFactor,
            }
         ),

      render: (data) => ({
         rows: [
            ["Regua", `${data.minPx}px (faixa: ${data.bandMinPx}px alt.)`],
            ["Alvos abaixo da regua", data.total],
         ],
         sections: data.items.length
            ? [
                 {
                    // A regua vem escrita em cada item: sem isso o achado era
                    // lido como "faltam 44px" e a correcao virava altura de
                    // linha inflada. Faixa deve ser corrigida na ALTURA.
                    title: `Alvos abaixo do minimo (compacto ${data.minPx}px; faixa ${data.bandMinPx}px de altura)`,
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
