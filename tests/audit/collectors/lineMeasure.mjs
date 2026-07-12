/**
 * Medida (comprimento de linha) dos blocos de texto.
 *
 * Abaixo de ~45 caracteres o olho salta de linha cedo demais; acima de ~75 ele
 * perde o inicio da proxima. E o defeito classico de texto que ocupa 100% de um
 * container largo — invisivel no mobile, gritante no monitor de 1920px.
 */
export function createLineMeasureCollector({
   minChars,
   maxChars,
   minTextLength,
}) {
   return {
      name: "lineMeasure",

      collect: ({ page }) =>
         page.evaluate(
            (config) => {
               const { px, selectorOf, ownText, visibleElements } =
                  window.__audit;
               const BLOCKS = [
                  "p",
                  "li",
                  "td",
                  "div",
                  "span",
                  "dd",
                  "blockquote",
               ];
               const findings = [];

               for (const el of visibleElements()) {
                  const tag = el.tagName.toLowerCase();
                  if (!BLOCKS.includes(tag)) continue;

                  const text = ownText(el);
                  if (text.length < config.minTextLength) continue;

                  const style = getComputedStyle(el);
                  const fontSize = px(style.fontSize);
                  const width = el.getBoundingClientRect().width;

                  // Aproximacao usual: a largura media de um caractere e ~0.5em.
                  const charsPerLine = Math.round(width / (fontSize * 0.5));
                  if (
                     charsPerLine >= config.minChars &&
                     charsPerLine <= config.maxChars
                  )
                     continue;

                  findings.push({
                     selector: selectorOf(el),
                     charsPerLine,
                     widthPx: Math.round(width),
                     fontSize,
                     sample: text.slice(0, 60),
                  });
               }

               return {
                  findings: findings.slice(0, 12),
                  total: findings.length,
               };
            },
            { minChars, maxChars, minTextLength }
         ),

      render: (data) => ({
         rows: [
            [
               `Blocos fora de ${minChars}-${maxChars} caracteres/linha`,
               data.total,
            ],
         ],
         sections: data.findings.length
            ? [
                 {
                    title: "Medida de linha fora da faixa legivel",
                    items: data.findings.map(
                       (f) =>
                          `\`${f.selector}\` — ~${f.charsPerLine} car/linha (${f.widthPx}px @ ${f.fontSize}px) — "${f.sample}"`
                    ),
                 },
              ]
            : [],
      }),
   };
}
