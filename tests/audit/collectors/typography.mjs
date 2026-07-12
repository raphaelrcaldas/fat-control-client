/**
 * Escala tipografica realmente renderizada.
 *
 * O sintoma que importa: quantos estilos de texto distintos a tela usa. Uma
 * escala saudavel tem poucos degraus deliberados (4-6 tamanhos); dezenas de
 * tamanhos/pesos ad-hoc sao hierarquia por acidente — o olho nao consegue
 * ranquear o que nao tem degrau claro.
 */
export function createTypographyCollector({
   minLineHeightRatio,
   bodyMaxFontSizePx,
}) {
   return {
      name: "typography",

      collect: ({ page }) =>
         page.evaluate(
            (config) => {
               const { px, ownText, visibleElements, counter } = window.__audit;
               const styles = counter();

               for (const el of visibleElements()) {
                  const text = ownText(el);
                  if (!text) continue;

                  const style = getComputedStyle(el);
                  const fontSize = px(style.fontSize);
                  const lineHeight =
                     style.lineHeight === "normal"
                        ? null
                        : px(style.lineHeight);

                  styles.add(
                     JSON.stringify({
                        fontSize,
                        fontWeight: Number(style.fontWeight),
                        lineHeight,
                        lineHeightRatio: lineHeight
                           ? Math.round((lineHeight / fontSize) * 100) / 100
                           : null,
                        letterSpacing:
                           style.letterSpacing === "normal"
                              ? null
                              : px(style.letterSpacing),
                        fontFamily: style.fontFamily
                           .split(",")[0]
                           .replace(/["']/g, ""),
                        textTransform:
                           style.textTransform === "none"
                              ? null
                              : style.textTransform,
                     }),
                     text
                  );
               }

               const entries = styles.entries(JSON.parse);

               return {
                  distinctStyles: entries.length,
                  sizes: [
                     ...new Set(entries.map((e) => e.value.fontSize)),
                  ].sort((a, b) => a - b),
                  weights: [
                     ...new Set(entries.map((e) => e.value.fontWeight)),
                  ].sort((a, b) => a - b),
                  families: [
                     ...new Set(entries.map((e) => e.value.fontFamily)),
                  ],
                  tightLineHeights: entries.filter(
                     (e) =>
                        e.value.lineHeightRatio !== null &&
                        e.value.lineHeightRatio < config.minLineHeightRatio &&
                        e.value.fontSize <= config.bodyMaxFontSizePx
                  ),
                  styles: entries.slice(0, 25),
               };
            },
            { minLineHeightRatio, bodyMaxFontSizePx }
         ),

      render: (data) => ({
         rows: [
            ["Estilos de texto distintos", data.distinctStyles],
            ["Tamanhos", `${data.sizes.join(", ")} px`],
            ["Pesos", data.weights.join(", ")],
            ["Familias", data.families.join(", ")],
         ],
         sections: data.tightLineHeights.length
            ? [
                 {
                    title: `Entrelinha apertada (< ${minLineHeightRatio}x em texto de leitura)`,
                    items: data.tightLineHeights.map(
                       (e) =>
                          `${e.value.fontSize}px / line-height ${e.value.lineHeight}px (${e.value.lineHeightRatio}x) — ${e.count}x — "${e.samples[0] ?? ""}"`
                    ),
                 },
              ]
            : [],
      }),
   };
}
