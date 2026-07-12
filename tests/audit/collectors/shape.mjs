/**
 * Raios e sombras.
 *
 * O padrao visual do projeto e fechado (`rules/frontend/components.md`):
 * `rounded` (4px), `rounded-md` (6px) so em caixa de icone, sombra `shadow-sm`
 * ou `shadow`. Raio de 8px+ nao e questao de gosto aqui — e desvio do sistema.
 */
export function createShapeCollector({ allowedRadiiPx }) {
   return {
      name: "shape",

      collect: ({ page }) =>
         page.evaluate((allowed) => {
            const { px, selectorOf, visibleElements, counter } = window.__audit;
            const radii = counter();
            const shadows = counter();

            for (const el of visibleElements()) {
               const style = getComputedStyle(el);

               const radius = px(style.borderTopLeftRadius);
               if (radius > 0) radii.add(radius, selectorOf(el));

               if (style.boxShadow !== "none")
                  shadows.add(style.boxShadow, selectorOf(el));
            }

            const entries = radii
               .entries(Number)
               .sort((a, b) => a.value - b.value);

            return {
               radii: entries,
               offSystemRadii: entries.filter(
                  (e) => !allowed.includes(e.value)
               ),
               shadows: shadows.entries().slice(0, 8),
            };
         }, allowedRadiiPx),

      render: (data) => ({
         rows: [
            [
               "Raios de borda",
               data.radii.map((r) => `${r.value}px (${r.count}x)`).join(", ") ||
                  "nenhum",
            ],
            ["Sombras distintas", data.shadows.length],
         ],
         sections: data.offSystemRadii.length
            ? [
                 {
                    title: `Raio fora do padrao do projeto (permitidos: ${allowedRadiiPx.join(", ")}px)`,
                    items: data.offSystemRadii.map(
                       (r) =>
                          `${r.value}px — ${r.count}x (ex: \`${r.samples[0] ?? "?"}\`)`
                    ),
                 },
              ]
            : [],
      }),
   };
}
