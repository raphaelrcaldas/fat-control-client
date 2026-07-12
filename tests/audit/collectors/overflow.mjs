/**
 * Estouro horizontal.
 *
 * Scroll lateral no mobile e o defeito de responsividade mais comum e o mais
 * facil de nao notar no desktop. Aponta o elemento que estoura, nao so o fato.
 */
export function createOverflowCollector() {
   return {
      name: "overflow",

      collect: ({ page }) =>
         page.evaluate(() => {
            const { selectorOf, visibleElements } = window.__audit;
            const viewportWidth = window.innerWidth;
            const culprits = [];

            for (const el of visibleElements()) {
               const style = getComputedStyle(el);
               if (style.position === "fixed") continue;

               const rect = el.getBoundingClientRect();
               if (rect.right <= viewportWidth + 1) continue;

               culprits.push({
                  selector: selectorOf(el),
                  overflowPx: Math.round(rect.right - viewportWidth),
               });
            }

            return {
               hasHorizontalScroll:
                  document.documentElement.scrollWidth > viewportWidth + 1,
               documentScrollWidth: document.documentElement.scrollWidth,
               viewportWidth,
               items: culprits
                  .sort((a, b) => b.overflowPx - a.overflowPx)
                  .slice(0, 10),
            };
         }),

      render: (data) => ({
         rows: [
            [
               "Scroll horizontal",
               data.hasHorizontalScroll
                  ? `SIM — documento tem ${data.documentScrollWidth}px numa viewport de ${data.viewportWidth}px`
                  : "nao",
            ],
         ],
         sections: data.items.length
            ? [
                 {
                    title: "Elementos que estouram a viewport",
                    items: data.items.map(
                       (c) =>
                          `\`${c.selector}\` — ${c.overflowPx}px alem da borda`
                    ),
                 },
              ]
            : [],
      }),
   };
}
