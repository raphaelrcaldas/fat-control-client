/**
 * Tamanho dos alvos interativos (Lei de Fitts).
 *
 * WCAG 2.2 (2.5.8) exige 24x24 CSS px; 44x44 e o alvo confortavel de dedo. Um
 * icone-botao de 16px so e clicavel por quem tem mouse e paciencia — e este
 * sistema roda em tablet no hangar.
 */
export function createTouchTargetsCollector({ minSizePx, wcagMinPx }) {
   const INTERACTIVE =
      "a[href], button, input, select, textarea, [role=button], [role=link], [role=tab], [role=checkbox], [tabindex]:not([tabindex='-1'])";

   return {
      name: "touchTargets",

      collect: ({ page }) =>
         page.evaluate(
            ({ selector, minSizePx, wcagMinPx }) => {
               const { selectorOf, visibleElements } = window.__audit;
               const small = [];

               for (const el of visibleElements()) {
                  if (!el.matches(selector)) continue;
                  if (el.matches("input[type=hidden]")) continue;

                  const rect = el.getBoundingClientRect();
                  const minSide = Math.min(rect.width, rect.height);
                  if (minSide >= minSizePx) continue;

                  small.push({
                     selector: selectorOf(el),
                     width: Math.round(rect.width),
                     height: Math.round(rect.height),
                     violatesWcag: minSide < wcagMinPx,
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
                  total: small.length,
                  wcagViolations: small.filter((t) => t.violatesWcag).length,
                  items: small.slice(0, 20),
               };
            },
            { selector: INTERACTIVE, minSizePx, wcagMinPx }
         ),

      render: (data) => ({
         rows: [
            [`Alvos abaixo de ${minSizePx}x${minSizePx}px`, data.total],
            [`Abaixo do minimo WCAG (${wcagMinPx}px)`, data.wcagViolations],
         ],
         sections: data.items.length
            ? [
                 {
                    title: "Alvos pequenos",
                    items: data.items.map(
                       (t) =>
                          `\`${t.selector}\` — ${t.width}x${t.height}px${t.violatesWcag ? " **(reprova WCAG 2.5.8)**" : ""} — "${t.label}"`
                    ),
                 },
              ]
            : [],
      }),
   };
}
