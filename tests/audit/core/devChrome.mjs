import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";

/**
 * Garante um Chromium de longa duracao com a porta de depuracao aberta.
 *
 * A auditoria formal (`audit.mjs`) sobe um browser por execucao e o descarta —
 * isolamento e o que ela quer. O ciclo de refino quer o oposto: a MESMA aba,
 * logada, com o modal ja aberto, sobrevivendo entre uma invocacao e a proxima,
 * enquanto o Fast Refresh do Next repinta a tela sozinho. Um browser que morre
 * junto com o processo Node nao serve para isso.
 *
 * Por isso o processo e `detached` + `unref()`: ele sai da arvore do Node e
 * continua vivo depois que o `peek` termina. A conexao seguinte so reencontra a
 * porta (`probe`) e reata.
 *
 * O binario e o Chromium que o Playwright ja instalou (`executablePath()`) —
 * nao ha Chrome de sistema nesta maquina, e depender de um seria uma instalacao
 * a mais para o dev. O perfil e proprio (`--user-data-dir`), entao a sessao do
 * FATCONTROL vive aqui sem encostar em nenhum navegador pessoal.
 */

const DEFAULT_PORT = 9222;

/** O endpoint HTTP basta para `connectOverCDP` — nao e preciso o ws://. */
const endpointOf = (port) => `http://127.0.0.1:${port}`;

async function probe(port, timeoutMs = 800) {
   try {
      const res = await fetch(`${endpointOf(port)}/json/version`, {
         signal: AbortSignal.timeout(timeoutMs),
      });
      return res.ok ? await res.json() : null;
   } catch {
      // Porta fechada, DNS, timeout: para o chamador e tudo "nao esta no ar".
      return null;
   }
}

function flags({ port, userDataDir, headless }) {
   const args = [
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${userDataDir}`,
      // Sem isto o perfil novo abre assistente de boas-vindas e aba de
      // importacao, que roubam o foco e viram a "pagina 0" do contexto.
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-features=Translate",
      "about:blank",
   ];
   if (headless) args.unshift("--headless=new");
   return args;
}

/**
 * Devolve `{ endpoint, reused }`. Se ja havia um Chromium na porta, reata nele
 * — nunca sobe um segundo, senao o estado que justifica a ferramenta se perde.
 */
export async function ensureDevChrome({
   port = DEFAULT_PORT,
   userDataDir,
   headless = false,
   startupTimeoutMs = 15000,
   logger = console,
} = {}) {
   const running = await probe(port);
   if (running) {
      logger.log(`[peek] reatando no Chromium da porta ${port}`);
      return { endpoint: endpointOf(port), reused: true };
   }

   const executablePath = chromium.executablePath();
   const child = spawn(executablePath, flags({ port, userDataDir, headless }), {
      detached: true,
      stdio: "ignore",
   });
   child.unref();

   const deadline = Date.now() + startupTimeoutMs;
   while (Date.now() < deadline) {
      const version = await probe(port);
      if (version) {
         logger.log(
            `[peek] Chromium iniciado na porta ${port} (${version.Browser})`
         );
         return { endpoint: endpointOf(port), reused: false };
      }
      await new Promise((r) => setTimeout(r, 200));
   }

   throw new Error(
      `Chromium nao respondeu na porta ${port} em ${startupTimeoutMs}ms. ` +
         `Binario: ${executablePath}`
   );
}
