/**
 * Navegacao por teclado: percorre a pagina com Tab e verifica se cada parada
 * tem indicador de foco visivel.
 *
 * Usa Tab de verdade (nao `element.focus()`) porque `:focus-visible` so acende
 * quando o foco veio do teclado — que e exatamente o caso que interessa.
 */
export function createFocusRingCollector({ maxStops }) {
   return {
      name: "focusRing",

      async collect({ page }) {
         const stops = [];

         for (let i = 0; i < maxStops; i++) {
            await page.keyboard.press("Tab");

            const stop = await page.evaluate(() => {
               const el = document.activeElement;
               if (!el || el === document.body) return null;

               const style = getComputedStyle(el);
               const outlineWidth = parseFloat(style.outlineWidth) || 0;
               const hasOutline =
                  outlineWidth > 0 && style.outlineStyle !== "none";
               const hasShadow = style.boxShadow !== "none";

               return {
                  selector: window.__audit.selectorOf(el),
                  label: (el.getAttribute("aria-label") ?? el.textContent ?? "")
                     .trim()
                     .slice(0, 40),
                  hasRing: hasOutline || hasShadow,
                  indicator: hasOutline
                     ? `outline ${style.outlineWidth} ${style.outlineColor}`
                     : hasShadow
                       ? "box-shadow"
                       : null,
               };
            });

            if (!stop) break;
            stops.push(stop);
         }

         return { stops, withoutRing: stops.filter((s) => !s.hasRing) };
      },

      render: (data) => ({
         rows: [
            ["Paradas de Tab", data.stops.length],
            ["Sem foco visivel", data.withoutRing.length],
         ],
         sections: data.withoutRing.length
            ? [
                 {
                    title: "Foco invisivel ao teclado",
                    items: data.withoutRing.map(
                       (s) => `\`${s.selector}\` — "${s.label}"`
                    ),
                 },
              ]
            : [],
      }),
   };
}
