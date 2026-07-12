/**
 * Ritmo de espacamento.
 *
 * Tailwind opera numa grade de 4px: um valor fora dela quase sempre veio de um
 * `px` cravado a mao para "consertar" um alinhamento — e o conserto vira
 * divida. Muitos valores distintos tambem indicam espacamento decidido caso a
 * caso, nao por sistema.
 */
export function createSpacingCollector({ gridPx }) {
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
            ({ props, gridPx }) => {
               const { px, selectorOf, visibleElements, counter } =
                  window.__audit;
               const values = counter();

               for (const el of visibleElements()) {
                  const style = getComputedStyle(el);
                  for (const prop of props) {
                     const raw = style[prop];
                     if (!raw || raw === "normal" || raw === "auto") continue;
                     const value = px(raw);
                     if (value > 0)
                        values.add(`${prop}:${value}`, selectorOf(el));
                  }
               }

               const entries = values.entries();
               const offGrid = entries.filter(
                  (e) => Number(e.value.split(":")[1]) % gridPx !== 0
               );

               return {
                  distinctValues: entries.length,
                  offGridCount: offGrid.length,
                  offGrid: offGrid.slice(0, 15),
                  top: entries.slice(0, 12),
               };
            },
            { props: PROPS, gridPx }
         ),

      render: (data) => ({
         rows: [
            ["Valores de espacamento distintos", data.distinctValues],
            [`Fora da grade de ${gridPx}px`, data.offGridCount],
         ],
         sections: data.offGrid.length
            ? [
                 {
                    title: `Espacamento fora da grade de ${gridPx}px`,
                    items: data.offGrid.map(
                       (e) =>
                          `${e.value}px — ${e.count}x (ex: \`${e.samples[0] ?? "?"}\`)`
                    ),
                 },
              ]
            : [],
      }),
   };
}
