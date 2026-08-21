/**
 * Cobra que todo recurso RBAC citado na UI exista no catálogo do backend.
 *
 * Por que isto é um script de lint e não um teste de componente: o defeito
 * que acontece de verdade neste sistema não é de renderização, é de
 * string. `PermBased` falha FECHADO — recurso inexistente esconde o
 * elemento em vez de avisar — e admin bypassa o gate, então quem
 * desenvolve nunca vê. Já viveram assim `esfaer`, `etp_mis`,
 * `operacoes.etapa`, e um rename deixou 22 call sites para trás por não
 * casar a forma `resource={"x"}`.
 *
 * O catálogo (`resources.json`) é gerado por `uv run task rbac:export` na
 * api e copiado para cá. Recurso novo => regerar lá e commitar nos dois.
 *
 * A extração mora em `inventario.mjs`, compartilhada com `matriz.mjs`.
 *
 * Roda no `npm run lint`.
 */

import { extrairCitacoes, carregarCatalogo } from "./inventario.mjs";

const catalogo = carregarCatalogo();
const conhecidos = new Set([
   ...Object.keys(catalogo.recursos),
   ...Object.keys(catalogo.sem_gate_backend ?? {}),
]);

const citacoes = extrairCitacoes();
const problemas = citacoes
   .filter((c) => !conhecidos.has(c.recurso))
   .map((c) => `  ${c.arquivo}:${c.linha}  ${c.onde}("${c.recurso}")`);

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

console.log(`✓ RBAC: ${citacoes.length} citações, todas no catálogo.`);
