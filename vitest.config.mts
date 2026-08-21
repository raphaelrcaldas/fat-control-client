import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

// `.mts` e não `.ts`: o projeto não é `"type": "module"`, então um
// `vitest.config.ts` com ESM é carregado como CommonJS e o Vite avisa que
// vai deixar de funcionar. A extensão resolve na raiz.

/**
 * Vitest só para a camada de RBAC (visibilidade por role/permissão).
 *
 * Não é infra de teste "do front" em geral: é a suíte que trava a lógica
 * que decide o que cada perfil enxerga. O que valida NOME de recurso é
 * outra coisa e roda no lint (`tests/rbac/check.mjs`), sem runner.
 */
export default defineConfig({
   test: {
      // `node` como padrão, jsdom só onde precisa: o teste do filtro de
      // menu é dado puro e roda em milissegundos. Quem precisa de DOM
      // declara `@vitest-environment jsdom` no topo do próprio arquivo.
      environment: "node",
      include: ["tests/**/*.test.{ts,tsx}"],
      // Sem `globals: true`: os testes importam describe/it/expect de
      // "vitest" explicitamente. O `tsc --noEmit` do lint varre `**/*.ts`,
      // então global implícito exigiria poluir os tipos do projeto inteiro
      // para conveniência de meia dúzia de arquivos.
      globals: false,
   },
   resolve: {
      // Espelha os `paths` do tsconfig.json. Divergir aqui faz o teste
      // resolver um módulo diferente do que o build resolve.
      alias: {
         "@": resolve(import.meta.dirname, "./src"),
         services: resolve(import.meta.dirname, "./services"),
         utils: resolve(import.meta.dirname, "./utils"),
         src: resolve(import.meta.dirname, "./src"),
         public: resolve(import.meta.dirname, "./public"),
      },
   },
});
