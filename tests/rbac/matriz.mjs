/**
 * Relatório: o que cada role de fato enxerga na UI.
 *
 * Cruza o inventário de elementos gateados (extraído do código) com as
 * concessões reais do banco (exportadas pela api). Responde uma pergunta
 * que hoje só se responde clicando: "o `ops_basico` vê o botão de excluir
 * tripulante?".
 *
 * É RELATÓRIO, não teste. Concessão é dado por ambiente — DEV e PROD
 * divergem, e editar uma role pela tela /admin/roles mudaria o resultado
 * sem nenhum commit. Assert em cima disso falharia por motivo que não é
 * defeito. O que é código (o predicado, o filtro do menu, os nomes) está
 * coberto por teste de verdade em `permBased.test.tsx`,
 * `filtrarNavItems.test.ts` e `check.mjs`.
 *
 * Uso:
 *   cd api && uv run python -m scripts.rbac_grants   # gera .grants.json
 *   cd client && npm run rbac:matriz
 *   npm run rbac:matriz -- --role ops_basico         # detalha uma role
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { extrairInventario } from "./inventario.mjs";

const AQUI = dirname(fileURLToPath(import.meta.url));
const GRANTS = join(AQUI, ".grants.json");

if (!existsSync(GRANTS)) {
   console.error(
      "\n✗ .grants.json não encontrado.\n\n" +
         "As concessões vêm do banco, não do código. Gere com:\n" +
         "  cd api && uv run python -m scripts.rbac_grants\n" +
         '  (ou DATABASE_URL="<prod>" ... para ver o que PROD concede)\n'
   );
   process.exit(1);
}

const { concessoes } = JSON.parse(readFileSync(GRANTS, "utf8"));
const inventario = extrairInventario();

const alvo = process.argv.includes("--role")
   ? process.argv[process.argv.indexOf("--role") + 1]
   : null;

/**
 * Admin BYPASSA o gate (`usePermBased`: `if (role === "admin") return true`),
 * então as concessões dele na tabela são decorativas. Uma matriz que
 * ignorasse isso mentiria justamente sobre o perfil mais poderoso.
 */
const enxerga = (role, recurso, acao) =>
   role === "admin" || concessoes[role].includes(`${recurso}.${acao}`);

const roles = Object.keys(concessoes).sort();
const elementos = [
   ...new Map(inventario.map((i) => [`${i.recurso}.${i.acao}`, i])).entries(),
].sort(([a], [b]) => a.localeCompare(b));

if (alvo) {
   if (!concessoes[alvo]) {
      console.error(`✗ role "${alvo}" não existe. Roles: ${roles.join(", ")}`);
      process.exit(1);
   }

   const visiveis = inventario.filter((i) => enxerga(alvo, i.recurso, i.acao));
   const ocultos = inventario.filter((i) => !enxerga(alvo, i.recurso, i.acao));

   console.log(`\n═══ ${alvo} ═══`);
   console.log(
      `${visiveis.length} de ${inventario.length} elementos visíveis` +
         (alvo === "admin" ? "  (bypassa o gate — vê tudo)" : "")
   );

   console.log(`\n── Vê (${visiveis.length}) ──`);
   for (const i of visiveis) {
      console.log(
         `  ${`${i.recurso}.${i.acao}`.padEnd(42)} ${i.arquivo}:${i.linha}`
      );
   }

   console.log(`\n── Não vê (${ocultos.length}) ──`);
   for (const i of ocultos) {
      console.log(
         `  ${`${i.recurso}.${i.acao}`.padEnd(42)} ${i.arquivo}:${i.linha}`
      );
   }
   console.log();
   process.exit(0);
}

// ─── Matriz completa ───
const larguraNome = Math.max(...elementos.map(([k]) => k.length));
const abrev = roles.map((r) => r.slice(0, 6).padStart(6));

console.log(
   `\nMatriz RBAC — ${elementos.length} elementos × ${roles.length} roles`
);
console.log(`(● vê   · não vê   —   admin bypassa o gate)\n`);
console.log(`${"".padEnd(larguraNome)}  ${abrev.join(" ")}`);
console.log(
   `${"".padEnd(larguraNome)}  ${roles.map(() => "──────").join(" ")}`
);

for (const [chave, item] of elementos) {
   const celulas = roles.map((r) =>
      (enxerga(r, item.recurso, item.acao) ? "●" : "·").padStart(6)
   );
   console.log(`${chave.padEnd(larguraNome)}  ${celulas.join(" ")}`);
}

console.log(`\n${"".padEnd(larguraNome)}  ${abrev.join(" ")}`);
const totais = roles.map((r) => {
   const n = elementos.filter(([, i]) => enxerga(r, i.recurso, i.acao)).length;
   return String(n).padStart(6);
});
console.log(`${"TOTAL".padEnd(larguraNome)}  ${totais.join(" ")}`);

// Órfãos importam mais que os totais: elemento que NINGUÉM vê é gate
// morto — ou a permissão nunca foi concedida, ou o nome está errado.
const orfaos = elementos.filter(
   ([, i]) => !roles.some((r) => r !== "admin" && enxerga(r, i.recurso, i.acao))
);

if (orfaos.length > 0) {
   console.log(
      `\n⚠  ${orfaos.length} elemento(s) que NENHUMA role (fora admin) enxerga:`
   );
   for (const [chave, i] of orfaos) {
      console.log(`   ${chave.padEnd(larguraNome)}  ${i.arquivo}:${i.linha}`);
   }
   console.log(
      "\n   Ou a permissão nunca foi concedida, ou o gate está errado.\n" +
         "   Só admin usa esses botões hoje.\n"
   );
} else {
   console.log("\n✓ Todo elemento é visível para pelo menos uma role.\n");
}
