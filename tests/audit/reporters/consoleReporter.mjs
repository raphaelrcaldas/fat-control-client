import path from "node:path";

/** Resumo no terminal: o agente le isso antes de decidir onde olhar. */
export function createConsoleReporter({ logger = console } = {}) {
   return {
      emit({ report, outDir }) {
         for (const breakpoint of report.breakpoints) {
            if (breakpoint.error) {
               logger.log(
                  `[audit] ${breakpoint.name}: FALHOU — ${breakpoint.error}`
               );
               continue;
            }

            const summary = breakpoint.results
               .flatMap((result) => result.view?.rows ?? [])
               .map(([label, value]) => `${label}: ${value}`)
               .join(" · ");

            logger.log(
               `[audit] ${breakpoint.name} (${breakpoint.viewport}) — ${summary}`
            );
         }

         logger.log(`\n[audit] relatorio: ${path.join(outDir, "report.md")}`);
         logger.log(`[audit] screenshots: ${outDir}/<breakpoint>.png`);
      },
   };
}
