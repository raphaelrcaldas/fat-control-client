/**
 * Inventário dos pontos gateados da UI — fonte única da extração.
 *
 * Consumido por `check.mjs` (valida nomes, roda no lint) e por
 * `matriz.mjs` (relatório role × elemento). Reimplementar a extração em
 * cada consumidor recriaria exatamente o drift que essa camada existe
 * para combater.
 *
 * Casa pelo PONTO DE USO, nunca por busca de string solta: `users`,
 * `trips` e `etapas` também são segmento de rota, chave de query e nome
 * de tabela.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
export const RAIZ = join(AQUI, "..", "..");
const SRC = join(RAIZ, "src");
const NAV_ITEMS = "components/layout/navItems.tsx";

/**
 * `resource:` fica restrito ao navItems porque fora dele a mesma chave é
 * o label do log de auditoria — outro namespace (`missao`, `pwd`...) que
 * não segue o catálogo RBAC.
 */
const FORMAS = [
   {
      re: /<PermBased[^>]*?resource=\{?\s*"([^"]+)"[^>]*?requiredPerm=\{?\s*"([^"]+)"/gs,
      onde: "PermBased",
   },
   {
      re: /<PermBased[^>]*?requiredPerm=\{?\s*"([^"]+)"[^>]*?resource=\{?\s*"([^"]+)"/gs,
      onde: "PermBased",
      invertido: true,
   },
   { re: /hasPerm\(\s*"([^"]+)"\s*,\s*"([^"]+)"/g, onde: "hasPerm" },
   {
      re: /resource:\s*"([^"]+)",\s*\n?\s*permission:\s*"([^"]+)"/g,
      onde: "navItems",
      soEm: NAV_ITEMS,
   },
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

/**
 * Pares (recurso, ação) completos — a grade da matriz.
 *
 * LIMITE CONHECIDO: só entra quem tem os DOIS como literal. Uma chamada
 * como `hasPerm("inteligencia.passaportes", isEdit ? "update" : "create")`
 * fica de fora da matriz, porque a ação só existe em runtime. O recurso
 * dela continua validado por `extrairCitacoes`, que exige só o primeiro.
 *
 * @returns {{recurso: string, acao: string, onde: string, arquivo: string,
 *            linha: number}[]} um item por ponto gateado, ordenado.
 */
export function extrairInventario() {
   const itens = [];
   const vistos = new Set();

   for (const arquivo of arquivos(SRC)) {
      const rel = relative(SRC, arquivo);
      const texto = readFileSync(arquivo, "utf8");

      for (const { re, onde, soEm, invertido } of FORMAS) {
         if (soEm && !rel.endsWith(soEm)) continue;

         for (const m of texto.matchAll(re)) {
            const recurso = invertido ? m[2] : m[1];
            const acao = invertido ? m[1] : m[2];
            const linha = texto.slice(0, m.index).split("\n").length;

            // As duas formas de PermBased (resource antes ou depois de
            // requiredPerm) podem casar o mesmo trecho; dedup por posição.
            const chave = `${rel}:${linha}:${recurso}:${acao}`;
            if (vistos.has(chave)) continue;
            vistos.add(chave);

            itens.push({ recurso, acao, onde, arquivo: `src/${rel}`, linha });
         }
      }
   }

   return itens.sort(
      (a, b) =>
         a.recurso.localeCompare(b.recurso) ||
         a.acao.localeCompare(b.acao) ||
         a.arquivo.localeCompare(b.arquivo) ||
         a.linha - b.linha
   );
}

/** Só os recursos citados, para o check de nomes. */
export function extrairCitacoes() {
   const itens = [];

   for (const arquivo of arquivos(SRC)) {
      const rel = relative(SRC, arquivo);
      const texto = readFileSync(arquivo, "utf8");

      const simples = [
         {
            re: /<PermBased[^>]*?resource=\{?\s*"([^"]+)"/gs,
            onde: "PermBased",
         },
         { re: /hasPerm\(\s*"([^"]+)"/g, onde: "hasPerm" },
         { re: /resource:\s*"([^"]+)"/g, onde: "navItems", soEm: NAV_ITEMS },
      ];

      for (const { re, onde, soEm } of simples) {
         if (soEm && !rel.endsWith(soEm)) continue;

         for (const m of texto.matchAll(re)) {
            itens.push({
               recurso: m[1],
               onde,
               arquivo: `src/${rel}`,
               linha: texto.slice(0, m.index).split("\n").length,
            });
         }
      }
   }

   return itens;
}

export function carregarCatalogo() {
   return JSON.parse(readFileSync(join(AQUI, "resources.json"), "utf8"));
}
