const USAGE = `
Auditoria de UI/UX — abre a rota num Chromium real e mede o que foi renderizado.

  node tests/audit/audit.mjs --url <url> [opcoes]

Opcoes:
  --url <url>            Rota a auditar (obrigatorio). Ex: http://localhost:4000/ops/operacoes
  --out <dir>            Diretorio do relatorio (default: client/.audit/<slug-da-rota>)
  --token <jwt>          Token de sessao (default: AUDIT_TOKEN ou client/.e2e_token)
  --token-file <path>    Arquivo com o token
  --no-auth              Nao injeta cookie de sessao (telas publicas, ex: login)
  --breakpoints a,b      Subconjunto de: mobile, tablet, desktop, wide
  --wait <selector>      Espera o seletor antes de medir
  --settle <ms>          Espera adicional apos carregar (default: 1200)
  --actions <json>       Passos ate o estado alvo. Ex: '[{"click":"button"},{"wait":"[role=dialog]"}]'
`;

const FLAGS = {
   "--url": (args, value) => (args.url = value),
   "--out": (args, value) => (args.out = value),
   "--token": (args, value) => (args.token = value),
   "--token-file": (args, value) => (args.tokenFile = value),
   "--breakpoints": (args, value) =>
      (args.breakpoints = value.split(",").map((b) => b.trim())),
   "--wait": (args, value) => (args.wait = value),
   "--settle": (args, value) => (args.settle = Number(value)),
   "--actions": (args, value) => (args.actions = JSON.parse(value)),
   "--no-auth": (args) => (args.auth = false),
};

const VALUELESS = new Set(["--no-auth"]);

export function parseArgs(argv) {
   const args = {
      url: null,
      out: null,
      token: process.env.AUDIT_TOKEN ?? null,
      tokenFile: null,
      auth: true,
      breakpoints: null,
      wait: null,
      settle: 1200,
      actions: [],
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
