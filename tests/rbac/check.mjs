/**
 * Cobra que todo recurso RBAC citado na UI exista no catálogo do backend.
 *
 * Por que isto é um script e não um teste de componente: o defeito que
 * acontece de verdade neste sistema não é de renderização, é de string.
 * `PermBased` falha FECHADO — recurso inexistente esconde o elemento em vez
 * de avisar — e admin bypassa o gate, então quem desenvolve nunca vê. Já
 * viveram assim `esfaer`, `etp_mis`, `operacoes.etapa`, e um rename deixou
 * 22 call sites para trás por não casar a forma `resource={"x"}`.
 *
 * O catálogo (`resources.json`) é gerado por `uv run task rbac:export` na
 * api e copiado para cá. Recurso novo => regerar lá e commitar nos dois.
 *
 * Casa pelo PONTO DE USO, nunca por busca de string solta: `users`,
 * `trips` e `etapas` também são segmento de rota e chave de query.
 *
 * Roda no `npm run lint`.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..", "..");
const SRC = join(RAIZ, "src");
const NAV_ITEMS = "components/layout/navItems.tsx";

const catalogo = JSON.parse(readFileSync(join(AQUI, "resources.json"), "utf8"));
const conhecidos = new Set([
   ...Object.keys(catalogo.recursos),
   ...Object.keys(catalogo.sem_gate_backend ?? {}),
]);

/**
 * Formas de citação. `resource:` fica restrito ao navItems porque fora dele
 * a mesma chave é o label do log de auditoria, que é OUTRO namespace
 * (`missao`, `comissionamento`, `pwd`...) e não segue este catálogo.
 */
const FORMAS = [
   { re: /<PermBased[^>]*?resource=\{?\s*"([^"]+)"/gs, onde: "PermBased" },
   { re: /hasPerm\(\s*"([^"]+)"\s*,\s*"([^"]+)"/g, onde: "hasPerm" },
   { re: /resource:\s*"([^"]+)"/g, onde: "navItems", soEm: NAV_ITEMS },
];

function arquivos(dir) {
   const saida = [];
   for (const item of readdirSync(dir, { withFileTypes: true })) {
      const caminho = join(dir, item.name);
      if (item.isDirectory()) saida.push(...arquivos(caminho));
      else if (/\.tsx?$/.test(item.name)) saida.push(caminho);
   }
   return saida;
}

const problemas = [];
let citacoes = 0;

for (const arquivo of arquivos(SRC)) {
   const rel = relative(SRC, arquivo);
   const texto = readFileSync(arquivo, "utf8");

   for (const { re, onde, soEm } of FORMAS) {
      if (soEm && !rel.endsWith(soEm)) continue;

      for (const m of texto.matchAll(re)) {
         citacoes++;
         const recurso = m[1];
         if (conhecidos.has(recurso)) continue;

         // Linha aproximada pelo offset, para o erro ser clicável.
         const linha = texto.slice(0, m.index).split("\n").length;
         problemas.push(`  src/${rel}:${linha}  ${onde}("${recurso}")`);
      }
   }
}

if (problemas.length > 0) {
   console.error(
      `\n✗ RBAC: ${problemas.length} recurso(s) que o backend não conhece:\n`
   );
   console.error(problemas.join("\n"));
   console.error(
      "\nO botão/menu some em silêncio para todo não-admin (PermBased falha" +
         "\nfechado; admin passa por cima e não vê). Ou o nome está errado, ou" +
         "\no catálogo está velho — regere com `uv run task rbac:export` na api." +
         "\n"
   );
   process.exit(1);
}

console.log(`✓ RBAC: ${citacoes} citações, todas no catálogo.`);
