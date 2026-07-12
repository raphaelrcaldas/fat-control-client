/**
 * Raios e sombras.
 *
 * O padrao visual do projeto e fechado (`rules/frontend/components.md`):
 * `rounded` (0.25rem), `rounded-md` (0.375rem) so em caixa de icone, sombra
 * `shadow-sm` ou `shadow`. Raio maior nao e questao de gosto aqui — e desvio
 * do sistema.
 *
 * Em rem, pelo mesmo motivo do spacing: com raiz de 14px, `rounded` renderiza
 * 3.5px, e uma regua cravada em px acusaria todo card da tela.
 */
export function createShapeCollector({ allowedRadiiRem, pillMinPx }) {
   return {
      name: "shape",

      collect: ({ page }) =>
         page.evaluate(
            ({ allowed, pillMinPx }) => {
               const { px, toRem, selectorOf, visibleElements, counter } = window.__audit;
               const radii = counter();
               const shadows = counter();

               for (const el of visibleElements()) {
                  const style = getComputedStyle(el);

                  const radius = px(style.borderTopLeftRadius);
                  if (radius > 0) radii.add(toRem(radius), selectorOf(el));

                  if (style.boxShadow !== "none") shadows.add(style.boxShadow, selectorOf(el));
               }

               const entries = radii.entries(Number).sort((a, b) => a.value - b.value);
               const pillMinRem = toRem(pillMinPx);

               return {
                  radii: entries.map((entry) =>
                     entry.value >= pillMinRem
                        ? { ...entry, value: "pill" }
                        : entry,
                  ),
                  offSystemRadii: entries.filter(
                     (entry) =>
                        entry.value < pillMinRem &&
                        !allowed.some((ok) => Math.abs(entry.value - ok) < 0.005),
                  ),
                  shadows: shadows.entries().slice(0, 8),
               };
            },
            { allowed: allowedRadiiRem, pillMinPx },
         ),

      render: (data) => ({
         rows: [
            [
               "Raios de borda",
               data.radii
                  .map((r) => (r.value === "pill" ? `pill (${r.count}x)` : `${r.value}rem (${r.count}x)`))
                  .join(", ") || "nenhum",
            ],
            ["Sombras distintas", data.shadows.length],
         ],
         sections: data.offSystemRadii.length
            ? [
                 {
                    title: `Raio fora do padrao (permitidos: ${allowedRadiiRem.join(", ")}rem, ou pill)`,
                    items: data.offSystemRadii.map(
                       (r) => `${r.value}rem — ${r.count}x (ex: \`${r.samples[0] ?? "?"}\`)`,
                    ),
                 },
              ]
            : [],
      }),
   };
}
