#!/usr/bin/env node
/**
 * Peek — ciclo curto de refino de UI. Composition root.
 *
 * O `audit.mjs` responde "esta tela esta pronta?": sobe um browser limpo, mede
 * quatro breakpoints, grava relatorio. E caro e e para ser — auditoria se faz
 * uma vez, no fim.
 *
 * Este responde "e agora, ficou melhor?", que e a pergunta que se faz vinte
 * vezes seguidas enquanto se mexe num easing. Por isso ele anexa num Chromium
 * que fica de pe entre as execucoes (`core/devChrome.mjs`), reusa a aba com a
 * sessao e o estado que ja estao la (`core/liveSession.mjs`), mede UMA viewport
 * e nao grava relatorio nenhum — so o resumo no terminal e um PNG.
 *
 *   node tests/audit/peek.mjs --url http://localhost:4000/ops/operacoes
 *   node tests/audit/peek.mjs --url http://localhost:4000/users --only motion
 *   node tests/audit/peek.mjs --url http://localhost:4000/users --viewport mobile \
 *     --actions '[{"click":"button:has-text(\"Novo Usuário\")"},{"wait":"[role=dialog]"}]'
 *
 * O dev server precisa estar no ar; este script nao sobe servidor.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parsePeekArgs, DEFAULT_COLLECTORS } from "./cli/parsePeekArgs.mjs";
import { resolveToken } from "./cli/resolveToken.mjs";
import { HEURISTICS } from "./config/heuristics.mjs";
import { ensureDevChrome } from "./core/devChrome.mjs";
import { LiveSession } from "./core/liveSession.mjs";

import { createMotionCollector } from "./collectors/motion.mjs";
import { createTypographyCollector } from "./collectors/typography.mjs";
import { createColorCollector } from "./collectors/color.mjs";
import { createSpacingCollector } from "./collectors/spacing.mjs";
import { createShapeCollector } from "./collectors/shape.mjs";
import { createLineMeasureCollector } from "./collectors/lineMeasure.mjs";
import { createTouchTargetsCollector } from "./collectors/touchTargets.mjs";
import { createOverflowCollector } from "./collectors/overflow.mjs";
import { createHeadingsCollector } from "./collectors/headings.mjs";
import { createAccessibilityCollector } from "./collectors/accessibility.mjs";

const CLIENT_DIR = path.resolve(
   path.dirname(fileURLToPath(import.meta.url)),
   "../.."
);
const DEFAULT_TOKEN_FILE = path.join(CLIENT_DIR, ".e2e_token");

/**
 * Coletores disponiveis no ciclo curto.
 *
 * `layoutShift` e `focusRing` ficam de fora de proposito, e nao por esquecimento:
 * o primeiro precisa instrumentar a pagina ANTES do primeiro paint (aqui a carga
 * ja aconteceu), e o segundo percorre a tela inteira com Tab — numa aba que
 * persiste, isso deixaria o foco pousado em algum controle e um combobox aberto
 * para a proxima execucao encontrar. Ambos continuam no `audit.mjs`.
 */
const REGISTRY = {
   motion: (h) => createMotionCollector(h.motion),
   typography: (h) => createTypographyCollector(h.typography),
   color: () => createColorCollector(),
   spacing: (h) => createSpacingCollector(h.spacing),
   shape: (h) => createShapeCollector(h.shape),
   lineMeasure: (h) => createLineMeasureCollector(h.lineMeasure),
   touchTargets: (h) => createTouchTargetsCollector(h.touchTarget),
   overflow: () => createOverflowCollector(),
   headings: () => createHeadingsCollector(),
   accessibility: (h) => createAccessibilityCollector(h.accessibility),
};

function buildCollectors(names) {
   const unknown = names.filter((name) => !REGISTRY[name]);
   if (unknown.length) {
      throw new Error(
         `Coletor desconhecido: ${unknown.join(", ")}. ` +
            `Disponiveis: ${Object.keys(REGISTRY).join(", ")}`
      );
   }
   return names.map((name) => REGISTRY[name](HEURISTICS));
}

function slugify(url) {
   const slug = new URL(url).pathname
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
   return slug || "root";
}

async function main() {
   const args = parsePeekArgs(process.argv);

   const names = args.all
      ? Object.keys(REGISTRY)
      : (args.only ?? DEFAULT_COLLECTORS);
   const collectors = buildCollectors(names);

   // Viewport nomeada carrega o aparelho inteiro (ponteiro e dpr); WxH avulsa e
   // so um retangulo, e ai o ponteiro fica fino. Dizer isso e o que impede o
   // numero de alvo de ser lido como medida de dedo.
   const breakpoint = args.viewport;
   if (
      !breakpoint.touch &&
      breakpoint.width <= 768 &&
      names.includes("touchTargets")
   ) {
      console.warn(
         `[peek] aviso: viewport estreita mas ponteiro FINE (24px). ` +
            `Para a regua de dedo use uma viewport nomeada: --viewport mobile`
      );
   }

   // Carimba o aparelho medido: sem isto, um screenshot estreito nao diz se
   // saiu do aparelho de referencia ou de um WxH avulso com ponteiro de mouse.
   console.log(
      `[peek] ${breakpoint.device ?? breakpoint.name} — ` +
         `${breakpoint.width}x${breakpoint.height} @${breakpoint.dpr ?? 1}x · ` +
         `ponteiro ${breakpoint.touch ? "COARSE (dedo, 44px)" : "fine (mouse, 24px)"}`
   );

   const { endpoint } = await ensureDevChrome({
      port: args.port,
      userDataDir: path.join(CLIENT_DIR, ".peek-chrome"),
      headless: args.headless,
   });

   const token = resolveToken(args, DEFAULT_TOKEN_FILE);
   if (args.auth && !token) {
      console.warn(
         "[peek] aviso: sem token (--token, AUDIT_TOKEN ou client/.e2e_token). Rota protegida vai cair no login."
      );
   }

   const messages = [];
   const session = new LiveSession({
      endpoint,
      url: args.url,
      token,
      actions: args.actions,
      wait: args.wait,
      settle: args.settle,
      scheme: args.scheme,
      reload: args.reload,
      onConsole: (message) => {
         const type = message.type();
         if (type === "error" || type === "warning" || type === "pageerror") {
            messages.push({ type, text: message.text().slice(0, 200) });
         }
      },
   });

   await session.start();

   try {
      const handle = await session.open(breakpoint);

      for (const collector of collectors) {
         // Um coletor que quebra nao pode levar o ciclo inteiro junto.
         try {
            const data = await collector.collect({
               page: handle.page,
               breakpoint,
            });
            report(collector.name, collector.render(data));
         } catch (error) {
            console.error(`[peek] ${collector.name}: ${error.message}`);
         }
      }

      if (args.shot) {
         const outDir = path.resolve(
            args.out ?? path.join(CLIENT_DIR, ".peek", slugify(args.url))
         );
         fs.mkdirSync(outDir, { recursive: true });
         const file = path.join(outDir, `${breakpoint.name}.png`);
         // Sem Escape, sem blur, sem scrollTo (o que o `audit.mjs` faz antes de
         // fotografar): ali a pagina e descartavel, aqui ela e o estado que se
         // esta refinando. Fotografa-se como esta.
         // `scale: "css"` fotografa em pixel CSS: num aparelho dpr 3 o PNG
         // sairia com 3x a largura e diria a mesma coisa, so que ilegivel de
         // tao grande ao lado da regua em px CSS do relatorio.
         await handle.page.screenshot({
            path: file,
            fullPage: args.full,
            scale: "css",
         });
         console.log(`\n[peek] screenshot: ${file}`);
      }

      if (messages.length) {
         console.log(`\n[peek] console (${messages.length}):`);
         for (const { type, text } of messages.slice(0, 10)) {
            console.log(`  ${type}: ${text}`);
         }
      }
   } finally {
      // Desconecta a sessao CDP; o Chromium e a aba seguem de pe para a
      // proxima execucao. E o ponto da ferramenta.
      await session.stop();
   }
}

function report(name, view) {
   const summary = (view?.rows ?? [])
      .map(([label, value]) => `${label}: ${value}`)
      .join(" · ");
   console.log(`[peek] ${name} — ${summary}`);

   for (const { title, items } of view?.sections ?? []) {
      console.log(`   ${title}`);
      for (const item of items) console.log(`     · ${item}`);
   }
}

main().catch((error) => {
   console.error(`[peek] falhou: ${error.message}`);
   process.exit(1);
});
