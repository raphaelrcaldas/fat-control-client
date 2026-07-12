/**
 * Layout shift acumulado (CLS) durante o carregamento.
 *
 * E a metrica que prova (ou desmente) a regra de skeleton do projeto: um
 * skeleton "fiel" que ainda produz CLS alto nao esta espelhando o layout real.
 * O observer precisa existir antes do primeiro paint — dai o `initScript`.
 */
export function createLayoutShiftCollector({ goodClsThreshold }) {
   return {
      name: "layoutShift",

      initScript: () => {
         window.__audit_cls = 0;
         window.__audit_shifts = [];

         new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
               if (entry.hadRecentInput) continue;

               window.__audit_cls += entry.value;
               if (window.__audit_shifts.length < 10) {
                  window.__audit_shifts.push({
                     value: Math.round(entry.value * 10000) / 10000,
                     sources: (entry.sources ?? [])
                        .slice(0, 2)
                        .map((source) => source.node?.nodeName ?? "?"),
                  });
               }
            }
         }).observe({ type: "layout-shift", buffered: true });
      },

      collect: ({ page }) =>
         page.evaluate(() => ({
            cls: Math.round((window.__audit_cls ?? 0) * 10000) / 10000,
            shifts: window.__audit_shifts ?? [],
         })),

      render: (data) => ({
         rows: [
            [
               "CLS",
               `${data.cls}${data.cls > goodClsThreshold ? ` (acima de ${goodClsThreshold})` : ""}`,
            ],
         ],
         sections: data.shifts.length
            ? [
                 {
                    title: "Maiores deslocamentos",
                    items: data.shifts.map(
                       (s) =>
                          `${s.value} — origem: ${s.sources.join(", ") || "?"}`
                    ),
                 },
              ]
            : [],
      }),
   };
}
