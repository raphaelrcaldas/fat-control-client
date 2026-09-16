import { BREAKPOINTS } from "../core/breakpoints.mjs";

const USAGE = `
Peek — ciclo curto de refino de UI. Anexa num Chromium persistente (CDP), mede a
aba viva e devolve screenshot + console. Nao recarrega a pagina por padrao: o
Fast Refresh do Next ja repintou, e o estado (modal aberto, aba, filtro) fica.

  node tests/audit/peek.mjs --url <url> [opcoes]

Opcoes:
  --url <url>          Rota alvo (obrigatorio). Ex: http://localhost:4000/ops/operacoes
  --viewport <v>       Nome (mobile|tablet|desktop|wide) ou WxH. Default: desktop
                       Nome = aparelho inteiro (mobile = Galaxy S25, dedo e dpr 3);
                       WxH = so o retangulo, com ponteiro de mouse
  --only <a,b>         So estes coletores. Default: movimento, estouro, espacamento,
                       raios, alvos e paleta
  --all                Todos os coletores disponiveis no peek
  --actions <json>     Passos ate o estado alvo. Ex: '[{"click":"button"},{"wait":"[role=dialog]"}]'
  --wait <selector>    Espera o seletor antes de medir
  --settle <ms>        Espera adicional (default: 400)
  --token <jwt>        Token de sessao (default: AUDIT_TOKEN ou client/.e2e_token)
  --token-file <path>  Arquivo com o token
  --no-auth            Nao injeta cookie de sessao (telas publicas)
  --scheme <s>         Emula prefers-color-scheme: light|dark (tema do sistema)
  --reload             Recarrega a rota em vez de reusar o estado da aba
  --solo               Fecha as outras abas e mede numa so (limpa sobra de
                       execucao anterior; o estado das demais e descartado)
  --port <n>           Porta de depuracao do Chromium (default: 9222)
  --headless           Sobe o Chromium sem janela (so vale na primeira execucao)
  --full               Screenshot da pagina inteira (default: so a viewport)
  --no-shot            Nao tira screenshot
  --out <dir>          Onde gravar (default: client/.peek/<slug-da-rota>)

`;

/** Coletores que fazem sentido no ciclo curto (ver peek.mjs para o porque). */
export const DEFAULT_COLLECTORS = [
   "motion",
   "overflow",
   "spacing",
   "shape",
   "touchTargets",
   "color",
];

// Fonte unica com a auditoria: nome de viewport aqui e o mesmo aparelho medido
// la (mobile = Galaxy S25), senao os dois modos mediriam telas diferentes.
const NAMED_VIEWPORTS = Object.fromEntries(
   BREAKPOINTS.map((breakpoint) => [breakpoint.name, breakpoint])
);

function parseViewport(value) {
   const named = NAMED_VIEWPORTS[value];
   if (named) return { ...named };

   const match = /^(\d+)x(\d+)$/.exec(value);
   if (!match) {
      throw new Error(
         `Viewport invalida: ${value}. Use ${Object.keys(NAMED_VIEWPORTS).join("|")} ou WxH (ex: 1024x768).`
      );
   }
   // Retangulo avulso nao e aparelho: sem toque e sem dpr, e o peek avisa
   return {
      name: value,
      width: Number(match[1]),
      height: Number(match[2]),
      dpr: 1,
      touch: false,
   };
}

const FLAGS = {
   "--url": (args, value) => (args.url = value),
   "--token": (args, value) => (args.token = value),
   "--token-file": (args, value) => (args.tokenFile = value),
   "--viewport": (args, value) => (args.viewport = parseViewport(value)),
   "--scheme": (args, value) => {
      if (!["light", "dark"].includes(value)) {
         throw new Error(`--scheme aceita light|dark, recebeu: ${value}`);
      }
      args.scheme = value;
   },
   "--only": (args, value) =>
      (args.only = value.split(",").map((name) => name.trim())),
   "--actions": (args, value) => (args.actions = JSON.parse(value)),
   "--wait": (args, value) => (args.wait = value),
   "--settle": (args, value) => (args.settle = Number(value)),
   "--port": (args, value) => (args.port = Number(value)),
   "--out": (args, value) => (args.out = value),
   "--all": (args) => (args.all = true),
   "--reload": (args) => (args.reload = true),
   "--solo": (args) => (args.solo = true),
   "--headless": (args) => (args.headless = true),
   "--full": (args) => (args.full = true),
   "--no-shot": (args) => (args.shot = false),
   "--no-auth": (args) => (args.auth = false),
};

const VALUELESS = new Set([
   "--all",
   "--reload",
   "--solo",
   "--headless",
   "--full",
   "--no-shot",
   "--no-auth",
]);

export function parsePeekArgs(argv) {
   const args = {
      url: null,
      token: process.env.AUDIT_TOKEN ?? null,
      tokenFile: null,
      auth: true,
      viewport: parseViewport("desktop"),
      scheme: null,
      only: null,
      all: false,
      actions: [],
      wait: null,
      settle: 400,
      reload: false,
      solo: false,
      port: Number(process.env.PEEK_PORT ?? 9222),
      headless: false,
      full: false,
      shot: true,
      out: null,
   };

   for (let i = 2; i < argv.length; i++) {
      const flag = argv[i];
      if (flag === "--help" || flag === "-h") {
         console.log(USAGE);
         process.exit(0);
      }

      const apply = FLAGS[flag];
      if (!apply) throw new Error(`Flag desconhecida: ${flag}\n${USAGE}`);
      apply(args, VALUELESS.has(flag) ? undefined : argv[++i]);
   }

   if (!args.url) throw new Error(`--url e obrigatorio.\n${USAGE}`);
   return args;
}
