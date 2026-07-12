/**
 * Ritmo de espacamento.
 *
 * Tailwind opera numa grade de 0.25rem: um valor fora dela quase sempre veio de
 * um `px` cravado a mao para "consertar" um alinhamento — e o conserto vira
 * divida. Muitos valores distintos tambem indicam espacamento decidido caso a
 * caso, nao por sistema.
 *
 * Medido em REM, nao em px: com `html {font-size:14px}` (o caso do `client`) a
 * grade de 4px simplesmente nao existe — `p-2` rende 7px. Em rem a regua vale
 * para qualquer base.
 */
export function createSpacingCollector({ gridRem }) {
   const PROPS = [
      "paddingTop",
      "paddingRight",
      "paddingBottom",
      "paddingLeft",
      "marginTop",
      "marginBottom",
      "rowGap",
      "columnGap",
   ];

   return {
      name: "spacing",

      collect: ({ page }) =>
         page.evaluate(
            ({ props, gridRem }) => {
               const { px, toRem, rootFontSize, selectorOf, visibleElements, counter } =
                  window.__audit;
               const values = counter();

               for (const el of visibleElements()) {
                  const style = getComputedStyle(el);
                  for (const prop of props) {
                     const raw = style[prop];
                     if (!raw || raw === "normal" || raw === "auto") continue;

                     const value = px(raw);
                     if (value > 0) values.add(`${prop}:${toRem(value)}`, selectorOf(el));
                  }
               }

               const entries = values.entries();

               // Tolerancia de 0.001rem: arredondamento de subpixel nao e desvio.
               const offGrid = entries.filter((entry) => {
                  const rem = Number(entry.value.split(":")[1]);
                  const steps = rem / gridRem;
                  return Math.abs(steps - Math.round(steps)) > 0.004;
               });

               return {
                  rootFontSize,
                  distinctValues: entries.length,
                  offGridCount: offGrid.length,
                  offGrid: offGrid.slice(0, 15),
                  top: entries.slice(0, 12),
               };
            },
            { props: PROPS, gridRem },
         ),

      render: (data) => ({
         rows: [
            ["Raiz (1rem)", `${data.rootFontSize}px`],
            ["Valores de espacamento distintos", data.distinctValues],
            [`Fora da grade de ${gridRem}rem`, data.offGridCount],
         ],
         sections: data.offGrid.length
            ? [
                 {
                    title: `Espacamento fora da grade de ${gridRem}rem`,
                    items: data.offGrid.map(
                       (entry) =>
                          `\`${entry.value}rem\` — ${entry.count}x (ex: \`${entry.samples[0] ?? "?"}\`)`,
                    ),
                 },
              ]
            : [],
      }),
   };
}
