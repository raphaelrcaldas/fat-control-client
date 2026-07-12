/**
 * Hierarquia de titulos.
 *
 * A arvore de headings e o indice que leitor de tela usa para navegar — e e
 * tambem um raio-x da hierarquia visual pretendida. Salto de nivel (h1 -> h3)
 * ou tela sem h1 sao sintoma de titulo escolhido por tamanho, nao por estrutura.
 */
export function createHeadingsCollector() {
   return {
      name: "headings",

      collect: ({ page }) =>
         page.evaluate(() => {
            const { px, visibleElements } = window.__audit;

            const headings = visibleElements()
               .filter((el) => /^h[1-6]$/.test(el.tagName.toLowerCase()))
               .map((el) => ({
                  level: Number(el.tagName[1]),
                  text: (el.textContent ?? "").trim().slice(0, 60),
                  fontSize: px(getComputedStyle(el).fontSize),
               }));

            const skips = [];
            let previous = 0;
            for (const heading of headings) {
               if (previous && heading.level > previous + 1) {
                  skips.push({
                     from: previous,
                     to: heading.level,
                     text: heading.text,
                  });
               }
               previous = heading.level;
            }

            return {
               headings,
               skips,
               hasH1: headings.some((h) => h.level === 1),
            };
         }),

      render: (data) => ({
         rows: [
            ["Titulos", data.headings.length],
            ["Tem h1", data.hasH1 ? "sim" : "NAO"],
            ["Saltos de nivel", data.skips.length],
         ],
         sections: [
            ...(data.headings.length
               ? [
                    {
                       title: "Arvore de titulos",
                       items: data.headings.map(
                          (h) =>
                             `${"  ".repeat(h.level - 1)}h${h.level} (${h.fontSize}px) — "${h.text}"`
                       ),
                    },
                 ]
               : []),
            ...(data.skips.length
               ? [
                    {
                       title: "Saltos de nivel",
                       items: data.skips.map(
                          (s) => `h${s.from} -> h${s.to} em "${s.text}"`
                       ),
                    },
                 ]
               : []),
         ],
      }),
   };
}
