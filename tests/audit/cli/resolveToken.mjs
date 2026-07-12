import fs from "node:fs";

/**
 * O cookie `token` e o mesmo mecanismo que os e2e ja usam para pular o login
 * (ver playwright.config.ts). Sem ele, rota protegida redireciona e a auditoria
 * mede a tela errada.
 */
export function resolveToken({ auth, token, tokenFile }, defaultTokenFile) {
   if (!auth) return null;
   if (token) return token;

   const file = tokenFile ?? defaultTokenFile;
   if (file && fs.existsSync(file)) return fs.readFileSync(file, "utf8").trim();

   return null;
}
