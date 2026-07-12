import axePkg from "@axe-core/playwright";

const AxeBuilder = axePkg.default ?? axePkg;

/**
 * axe-core: a suite padrao da industria para WCAG (2.0/2.1/2.2, nivel AA).
 *
 * Cobre o que nao vale a pena reimplementar: contraste texto/fundo (inclusive
 * fundo composto), rotulo ausente em campo de formulario, ARIA quebrada, ordem
 * de titulos, idioma do documento. `incomplete` = o axe nao conseguiu decidir
 * sozinho (tipicamente texto sobre imagem/gradiente) e pede olho humano — e o
 * olho e o do agente, olhando o screenshot.
 */
export function createAccessibilityCollector({ tags }) {
   return {
      name: "accessibility",

      async collect({ page }) {
         const results = await new AxeBuilder({ page })
            .withTags(tags)
            .analyze();

         return {
            violations: results.violations.map((violation) => ({
               id: violation.id,
               impact: violation.impact,
               help: violation.help,
               helpUrl: violation.helpUrl,
               nodes: violation.nodes.length,
               targets: violation.nodes
                  .slice(0, 5)
                  .map((node) => node.target.join(" ")),
               failureSummary:
                  violation.nodes[0]?.failureSummary?.slice(0, 200) ?? null,
            })),
            incomplete: results.incomplete.map((item) => ({
               id: item.id,
               help: item.help,
               nodes: item.nodes.length,
            })),
            passCount: results.passes.length,
         };
      },

      render: (data) => {
         const critical = data.violations.filter(
            (v) => v.impact === "critical" || v.impact === "serious"
         );

         return {
            rows: [
               ["Violacoes WCAG", data.violations.length],
               ["Criticas/serias", critical.length],
               ["Inconclusivas (pedem olho humano)", data.incomplete.length],
               ["Regras aprovadas", data.passCount],
            ],
            sections: [
               ...(data.violations.length
                  ? [
                       {
                          title: "Violacoes",
                          items: data.violations.flatMap((v) => [
                             `**${v.impact ?? "?"}** \`${v.id}\` — ${v.help} (${v.nodes}x) — ${v.helpUrl}`,
                             ...v.targets.map((target) => `   \`${target}\``),
                          ]),
                       },
                    ]
                  : []),
               ...(data.incomplete.length
                  ? [
                       {
                          title: "Inconclusivas",
                          items: data.incomplete.map(
                             (i) => `\`${i.id}\` — ${i.help} (${i.nodes}x)`
                          ),
                       },
                    ]
                  : []),
            ],
         };
      },
   };
}
