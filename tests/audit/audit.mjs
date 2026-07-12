#!/usr/bin/env node
/**
 * Auditoria de UI/UX — composition root.
 *
 * Abre uma rota num Chromium real, em varios breakpoints, e mede o que foi
 * de fato renderizado: escala tipografica, paleta, ritmo de espacamento, raios,
 * medida de linha, alvos de toque, estouro horizontal, hierarquia de titulos,
 * foco por teclado, layout shift e WCAG 2.2 AA (axe-core).
 *
 * Serve os tres frontends — o alvo e so a URL (client:4000, fatbird:5000,
 * login:3000). O dev server do servico precisa estar no ar; este script nao
 * sobe servidor nenhum.
 *
 *   node tests/audit/audit.mjs --url http://localhost:4000/ops/operacoes
 *   node tests/audit/audit.mjs --url http://localhost:3000/ --no-auth
 *   node tests/audit/audit.mjs --url http://localhost:4000/users \
 *     --actions '[{"click":"button:has-text(\"Novo Usuário\")"},{"wait":"[role=dialog]"}]'
 *
 * Este arquivo e o unico que conhece implementacoes concretas. O orquestrador
 * (core/auditor.mjs) so fala com os contratos Collector e Reporter — metrica ou
 * formato de saida novo entra aqui, na lista, sem tocar no resto.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parseArgs } from "./cli/parseArgs.mjs";
import { resolveToken } from "./cli/resolveToken.mjs";
import { HEURISTICS } from "./config/heuristics.mjs";
import { selectBreakpoints } from "./core/breakpoints.mjs";
import { BrowserSession } from "./core/browserSession.mjs";
import { runAudit } from "./core/auditor.mjs";

import { createTypographyCollector } from "./collectors/typography.mjs";
import { createColorCollector } from "./collectors/color.mjs";
import { createSpacingCollector } from "./collectors/spacing.mjs";
import { createShapeCollector } from "./collectors/shape.mjs";
import { createLineMeasureCollector } from "./collectors/lineMeasure.mjs";
import { createTouchTargetsCollector } from "./collectors/touchTargets.mjs";
import { createOverflowCollector } from "./collectors/overflow.mjs";
import { createHeadingsCollector } from "./collectors/headings.mjs";
import { createLayoutShiftCollector } from "./collectors/layoutShift.mjs";
import { createFocusRingCollector } from "./collectors/focusRing.mjs";
import { createAccessibilityCollector } from "./collectors/accessibility.mjs";

import { createJsonReporter } from "./reporters/jsonReporter.mjs";
import { createMarkdownReporter } from "./reporters/markdownReporter.mjs";
import { createConsoleReporter } from "./reporters/consoleReporter.mjs";

const CLIENT_DIR = path.resolve(
   path.dirname(fileURLToPath(import.meta.url)),
   "../.."
);
const DEFAULT_TOKEN_FILE = path.join(CLIENT_DIR, ".e2e_token");

function buildCollectors(heuristics) {
   return [
      createTypographyCollector(heuristics.typography),
      createColorCollector(),
      createSpacingCollector(heuristics.spacing),
      createShapeCollector(heuristics.shape),
      createLineMeasureCollector(heuristics.lineMeasure),
      createTouchTargetsCollector(heuristics.touchTarget),
      createOverflowCollector(),
      createHeadingsCollector(),
      createLayoutShiftCollector(heuristics.layoutShift),
      createFocusRingCollector(heuristics.focusRing),
      createAccessibilityCollector(heuristics.accessibility),
   ];
}

function slugify(url) {
   const slug = new URL(url).pathname
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
   return slug || "root";
}

async function main() {
   const args = parseArgs(process.argv);
   const token = resolveToken(args, DEFAULT_TOKEN_FILE);

   if (args.auth && !token) {
      console.warn(
         "[audit] aviso: sem token (--token, AUDIT_TOKEN ou client/.e2e_token). Rota protegida vai cair no login."
      );
   }

   const outDir = path.resolve(
      args.out ?? path.join(CLIENT_DIR, ".audit", slugify(args.url))
   );
   fs.mkdirSync(outDir, { recursive: true });

   const collectors = buildCollectors(HEURISTICS);

   const session = new BrowserSession({
      url: args.url,
      token,
      actions: args.actions,
      wait: args.wait,
      settle: args.settle,
      initScripts: collectors.map((c) => c.initScript).filter(Boolean),
   });

   await runAudit({
      session,
      breakpoints: selectBreakpoints(args.breakpoints),
      collectors,
      reporters: [
         createJsonReporter(),
         createMarkdownReporter(),
         createConsoleReporter(),
      ],
      outDir,
      meta: {
         url: args.url,
         authenticated: Boolean(token),
         actions: args.actions,
      },
   });
}

main().catch((error) => {
   console.error(`[audit] falhou: ${error.message}`);
   process.exit(1);
});
