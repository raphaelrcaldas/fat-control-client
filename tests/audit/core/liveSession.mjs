import { chromium } from "@playwright/test";
import { installDomUtils } from "../browser/domUtils.mjs";

/**
 * Adapter do Playwright para o ciclo de refino: em vez de subir um browser,
 * ANEXA num Chromium ja aberto (CDP) e reusa a aba que estiver la.
 *
 * Cumpre o mesmo contrato do `BrowserSession` (`start`/`stop`/`open`), entao o
 * orquestrador nao sabe a diferenca — mas as trocas sao outras, e e por isso
 * que sao duas classes e nao uma com flag:
 *
 * | | `BrowserSession` (auditoria) | `LiveSession` (refino) |
 * |-|-|-|
 * | Sessao | contexto novo por breakpoint | a aba viva, com o login que ja esta la |
 * | Estado | recomeca do zero | sobrevive entre execucoes |
 * | Toque | emula `pointer: coarse` | impossivel (ver abaixo) |
 *
 * **Nao ha emulacao de toque aqui.** `hasTouch`/`isMobile` sao opcoes de
 * CONTEXTO, e o contexto e o do browser ja aberto — nao da para recria-lo sem
 * perder o perfil logado, que e justamente o que se veio buscar. Encolher a
 * viewport para 360px sem isso deixa `@media (pointer: coarse)` desligado, e a
 * regua de alvo de toque passa a ser a de mouse (24px) com cara de mobile. Esse
 * falso positivo ja custou caro uma vez (ver o comentario do screenshot em
 * `auditor.mjs`), entao aqui a viewport estreita e permitida mas o breakpoint
 * sai sempre com `touch: false` — e o `peek` avisa. Medida de toque de verdade
 * continua sendo com `audit.mjs`.
 *
 * Sobre `stop()`: `browser.close()` numa conexao CDP apenas DESCONECTA — o
 * Chromium continua no ar (verificado). E o que se quer: o proximo `peek`
 * reencontra a mesma aba.
 */
export class LiveSession {
   #browser = null;
   #context = null;

   constructor({
      endpoint,
      url,
      token = null,
      actions = [],
      wait = null,
      settle = 400,
      scheme = null,
      reload = false,
      onConsole = null,
   }) {
      this.endpoint = endpoint;
      this.url = url;
      this.token = token;
      this.actions = actions;
      this.wait = wait;
      this.settle = settle;
      this.scheme = scheme;
      this.reload = reload;
      this.onConsole = onConsole;
   }

   async start() {
      this.#browser = await chromium.connectOverCDP(this.endpoint);
      // Um Chromium recem-subido tem exatamente um contexto (o perfil). E nele
      // que moram os cookies da sessao — criar outro daria uma janela anonima,
      // deslogada, que anula o proposito.
      this.#context = this.#browser.contexts()[0];
      if (!this.#context) {
         throw new Error(
            "Chromium sem contexto — perfil corrompido? Feche-o e rode de novo."
         );
      }

      // O cookie vai no PERFIL, que persiste: em tese bastaria injetar uma vez.
      // Reinjetar a cada execucao e barato e idempotente, e cobre o caso de o
      // token ter sido trocado (outra org via AUDIT_TOKEN) sem exigir que o
      // Chromium seja derrubado para valer.
      if (this.token) {
         await this.#context.addCookies([
            {
               name: "token",
               value: this.token,
               domain: new URL(this.url).hostname,
               path: "/",
            },
         ]);
      }
   }

   async stop() {
      await this.#browser?.close();
      this.#browser = null;
      this.#context = null;
   }

   /**
    * `breakpoint` aqui e so `{ name, width, height }` — ver a nota sobre toque.
    * Devolve o mesmo handle do `BrowserSession`, mas `close()` e no-op: fechar
    * a aba destruiria o estado que a proxima execucao quer encontrar.
    */
   async open(breakpoint) {
      const page = await this.#resolvePage();

      if (this.onConsole) {
         // Uma aba viva ja pode ter mensagens antigas no console; o Playwright
         // nao as le retroativamente. O que se captura daqui em diante e o que
         // esta execucao provocou — que e o que interessa ao refino.
         page.on("console", this.onConsole);
         page.on("pageerror", (error) =>
            this.onConsole({
               type: () => "pageerror",
               text: () => error.message,
            })
         );
      }

      // Traz a aba para frente ANTES de medir. O Chrome congela a timeline de
      // animacao das abas em segundo plano: `playState` continua "running" mas
      // `currentTime` fica em 0 para sempre, e um coletor que amostre o estado
      // ao longo do tempo le a animacao presa no primeiro quadro — o que se
      // parece exatamente com "a entrada nao roda e o conteudo fica invisivel".
      // Como esta sessao acumula uma aba por rota visitada, a aba medida quase
      // nunca e a ativa, e o falso positivo seria a regra, nao a excecao.
      await page.bringToFront().catch(() => {});

      // Emula a preferencia do SISTEMA. So vale onde o app segue `system`; se
      // ele grava a escolha (cookie/classe no <html>), a media query nao e mais
      // quem decide e isto nao muda nada — o aviso sai no peek.
      if (this.scheme) await page.emulateMedia({ colorScheme: this.scheme });

      await page.setViewportSize({
         width: breakpoint.width,
         height: breakpoint.height,
      });

      await this.#hideDevChrome(page);
      await page.evaluate(installDomUtils);

      if (this.wait) await page.waitForSelector(this.wait, { timeout: 20000 });
      await this.#runActions(page);

      // Espera as fontes assentarem ANTES do settle. Sem isto, uma captura logo
      // apos `--reload` pega a janela em que o texto em peso ainda nao pintou
      // (FOIT) — e o screenshot mostra cartoes com descricao e sem titulo, que
      // se le como bug de contraste no tema escuro. Ja custou uma investigacao:
      // o titulo estava no DOM, com 17:1 de contraste, apenas ainda invisivel.
      await page.evaluate(() => document.fonts?.ready).catch(() => {});

      await page.waitForTimeout(this.settle);

      return { page, close: async () => {} };
   }

   /**
    * Regra de reuso — o coracao da ferramenta.
    *
    * Se a aba ja esta na rota alvo, NAO navega: o Fast Refresh do Next ja
    * repintou a tela apos a edicao, e recarregar jogaria fora o estado que se
    * quer inspecionar (modal aberto, aba selecionada, filtro aplicado). E o que
    * separa "ver o efeito da minha ultima edicao" de "recomecar do zero".
    */
   async #resolvePage() {
      const target = new URL(this.url);
      const pages = this.#context.pages();

      const match = pages.find((p) => {
         try {
            const current = new URL(p.url());
            return (
               current.origin === target.origin &&
               current.pathname === target.pathname
            );
         } catch {
            return false; // about:blank e afins
         }
      });

      if (match && !this.reload) return match;
      if (match) {
         await match.reload({ waitUntil: "networkidle", timeout: 45000 });
         return match;
      }

      // Sem aba na rota: reaproveita uma aba em branco se houver, para nao
      // acumular abas a cada rota nova visitada.
      const blank = pages.find((p) => p.url() === "about:blank");
      const page = blank ?? (await this.#context.newPage());
      await page.goto(this.url, { waitUntil: "networkidle", timeout: 45000 });
      return page;
   }

   /**
    * Mesmo motivo do `BrowserSession`: overlay do Next e devtools do TanStack
    * Query poluem screenshot, DOM e navegacao por Tab. Aqui a folha e marcada
    * com um id porque a aba persiste — sem isso, cada execucao empilharia mais
    * um `<style>` na mesma pagina.
    */
   async #hideDevChrome(page) {
      await page.evaluate(() => {
         const ID = "__peek_hide_dev_chrome";
         if (document.getElementById(ID)) return;
         const style = document.createElement("style");
         style.id = ID;
         style.textContent = `
            nextjs-portal,
            .tsqd-open-btn-container,
            .tsqd-parent-container { display: none !important; }
         `;
         document.head.append(style);
      });
   }

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
