import fs from "node:fs";
import path from "node:path";

/**
 * Relatorio legivel.
 *
 * Nao sabe o que e tipografia nem contraste: renderiza o `view` que cada
 * coletor produziu de si mesmo. Coletor novo aparece aqui sozinho.
 */
export function createMarkdownReporter() {
   return {
      emit({ report, outDir }) {
         const lines = [];
         const push = (line = "") => lines.push(line);

         push(`# Auditoria de UI — ${report.url}`);
         push();
         push(
            `${report.timestamp} · Chromium · sessao autenticada: ${report.authenticated ? "sim" : "nao"}`
         );
         if (report.actions?.length)
            push(
               `\nEstado alcancado por: \`${JSON.stringify(report.actions)}\``
            );
         push();

         for (const breakpoint of report.breakpoints) {
            push(`## ${breakpoint.name} — ${breakpoint.viewport}`);
            push();

            if (breakpoint.error) {
               push(`> Falhou: ${breakpoint.error}`);
               push();
               continue;
            }

            push(`Screenshot: \`${breakpoint.screenshot}\``);
            push();

            const rows = breakpoint.results.flatMap((result) =>
               (result.view?.rows ?? []).map(
                  ([label, value]) => `| ${label} | ${value} |`
               )
            );

            if (rows.length) {
               push("| Metrica | Valor |");
               push("| --- | --- |");
               rows.forEach(push);
               push();
            }

            for (const result of breakpoint.results) {
               if (result.error) {
                  push(`### ${result.name} — ERRO: ${result.error}`);
                  push();
                  continue;
               }

               for (const section of result.view?.sections ?? []) {
                  if (!section.items.length) continue;
                  push(`### ${section.title}`);
                  push();
                  section.items.forEach((item) => push(`- ${item}`));
                  push();
               }
            }
         }

         fs.writeFileSync(
            path.join(outDir, "report.md"),
            lines.join("\n"),
            "utf8"
         );
      },
   };
}
