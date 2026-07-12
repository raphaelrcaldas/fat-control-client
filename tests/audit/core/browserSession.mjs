import { chromium } from "@playwright/test";
import { installDomUtils } from "../browser/domUtils.mjs";

/**
 * Adapter do Playwright: e o unico modulo que sabe como um browser e dirigido.
 * O orquestrador (`auditor.mjs`) fala com esta interface — `open(breakpoint)`
 * devolve uma pagina ja no estado a medir.
 *
 * Chromium (nao o firefox do e2e) porque `layout-shift` (CLS) so existe la.
 */
export class BrowserSession {
   #browser = null;

   constructor({
      url,
      token,
      actions = [],
      wait = null,
      settle = 1200,
      initScripts = [],
   }) {
      this.url = url;
      this.token = token;
      this.actions = actions;
      this.wait = wait;
      this.settle = settle;
      this.initScripts = initScripts;
   }

   async start() {
      this.#browser = await chromium.launch();
   }

   async stop() {
      await this.#browser?.close();
      this.#browser = null;
   }

   /** Contexto novo por breakpoint: viewport e estado de sessao nao vazam entre medicoes. */
   async open(breakpoint) {
      const context = await this.#browser.newContext({
         viewport: { width: breakpoint.width, height: breakpoint.height },
         // Ponteiro grosso: faz `pointer: coarse` valer, como num tablet real.
         hasTouch: Boolean(breakpoint.touch),
         isMobile: Boolean(breakpoint.touch),
      });

      if (this.token) {
         const { hostname } = new URL(this.url);
         await context.addCookies([
            { name: "token", value: this.token, domain: hostname, path: "/" },
         ]);
      }

      const page = await context.newPage();

      // Antes do goto: o que precisa observar a pagina desde o primeiro paint.
      for (const script of this.initScripts) await page.addInitScript(script);

      await page.goto(this.url, { waitUntil: "networkidle", timeout: 45000 });

      // Instrumentacao de dev (overlay do Next, devtools do TanStack Query) nao
      // existe em producao, mas polui tudo que medimos: entra no screenshot, no
      // DOM e na navegacao por Tab — o botao do devtools chegava a ser contado
      // como "alvo pequeno". Escondida, some das tres medicoes de uma vez.
      await page.addStyleTag({
         content: `
            nextjs-portal,
            .tsqd-open-btn-container,
            .tsqd-parent-container { display: none !important; }
         `,
      });

      await page.evaluate(installDomUtils);

      if (this.wait) await page.waitForSelector(this.wait, { timeout: 20000 });
      await this.#runActions(page);
      await page.waitForTimeout(this.settle);

      return { page, close: () => context.close() };
   }

   /** Passos declarativos ate o estado alvo (abrir modal, trocar aba, filtrar). */
   async #runActions(page) {
      for (const action of this.actions) {
         if (action.click) await page.click(action.click, { timeout: 10000 });
         else if (action.fill)
            await page.fill(action.fill[0], action.fill[1], { timeout: 10000 });
         else if (action.select)
            await page.selectOption(action.select[0], action.select[1]);
         else if (action.wait)
            await page.waitForSelector(action.wait, { timeout: 15000 });
         else if (action.waitMs) await page.waitForTimeout(action.waitMs);
         else throw new Error(`Acao desconhecida: ${JSON.stringify(action)}`);
      }
   }
}
