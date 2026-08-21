// @vitest-environment jsdom

/**
 * Visibilidade do menu por perfil — 12 grupos de topo, 8 deles com filhos
 * gateados por recurso.
 *
 * Usa os hooks REAIS (`usePermBased`, `useRoleBased`) via `renderHook`, e
 * não uma reimplementação do predicado no fixture. A primeira versão deste
 * arquivo imitava `hasRole` à mão e errou: esqueceu que ele também tem
 * bypass de admin. Fixture que copia a regra é a mesma duplicata que esta
 * camada inteira existe para combater — por isso paga-se o jsdom aqui.
 *
 * As permissões são SINTÉTICAS, não as concessões reais do banco. O que as
 * roles de verdade enxergam é dado por ambiente (DEV e PROD divergem, e
 * editar uma role pela tela mudaria o resultado) — isso vira relatório
 * (`npm run rbac:matriz`), não assert. Aqui trava-se a LÓGICA.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, cleanup } from "@testing-library/react";

const useAuthMock = vi.fn();
vi.mock("@/app/context/auth", () => ({
   useAuth: () => useAuthMock(),
}));

const { navItems } = await import("@/app/(home)/components/layout/navItems");
const { filtrarNavItems } =
   await import("@/app/(home)/components/layout/filtrarNavItems");
const { usePermBased } = await import("@/app/(home)/hooks/usePermBased");
const { useRoleBased } = await import("@/app/(home)/hooks/useRoleBased");

interface Perm {
   resource: string;
   name: string;
}

afterEach(cleanup);

/** Monta o contexto de filtro a partir dos hooks de produção. */
function ctx(opts: {
   role?: string | null;
   perms?: Perm[];
   isSystemContext?: boolean;
}) {
   const { role = "algum_perfil", perms = [], isSystemContext = false } = opts;
   useAuthMock.mockReturnValue({ role, perms });

   const { hasPerm } = renderHook(() => usePermBased()).result.current;
   const { hasRole } = renderHook(() => useRoleBased()).result.current;

   return { hasPerm, hasRole, isSystemContext };
}

const labels = (itens: ReturnType<typeof filtrarNavItems>) =>
   itens.map((i) => i.label);

const filhos = (itens: ReturnType<typeof filtrarNavItems>, grupo: string) =>
   itens.find((i) => i.label === grupo)?.children?.map((c) => c.label) ?? [];

describe("escopo system × tenant", () => {
   it("dentro de uma org, item de sistema não aparece", () => {
      const visiveis = labels(
         filtrarNavItems(navItems, ctx({ role: "admin" }))
      );

      expect(visiveis).toContain("Início");
      expect(visiveis).not.toContain("Admin");
   });

   it("no contexto Sistema, item de unidade não aparece", () => {
      const visiveis = labels(
         filtrarNavItems(
            navItems,
            ctx({ role: "admin", isSystemContext: true })
         )
      );

      expect(visiveis).toContain("Admin");
      expect(visiveis).not.toContain("Operações");
   });

   it("item `shared` aparece nos dois contextos", () => {
      for (const isSystemContext of [false, true]) {
         const visiveis = labels(
            filtrarNavItems(navItems, ctx({ role: "admin", isSystemContext }))
         );
         expect(visiveis).toContain("Início");
      }
   });
});

describe("gate por permissão nos filhos", () => {
   it("admin vê todos os filhos de Operações (bypass)", () => {
      const todos = filhos(
         filtrarNavItems(navItems, ctx({ role: "admin" })),
         "Operações"
      );

      expect(todos.length).toBeGreaterThan(5);
   });

   it("uma permissão só revela exatamente um filho", () => {
      const visiveis = filtrarNavItems(
         navItems,
         ctx({
            role: "ops_basico",
            perms: [{ resource: "ops.tripulantes", name: "view" }],
         })
      );

      expect(filhos(visiveis, "Operações")).toEqual(["Tripulantes"]);
   });

   it("ação errada não revela o filho", () => {
      const visiveis = filtrarNavItems(
         navItems,
         ctx({
            role: "ops_basico",
            perms: [{ resource: "ops.tripulantes", name: "delete" }],
         })
      );

      expect(filhos(visiveis, "Operações")).not.toContain("Tripulantes");
   });

   it("grupo sem nenhum filho visível some inteiro", () => {
      // Não basta esvaziar: um collapse vazio deixaria um acordeão morto.
      const visiveis = labels(
         filtrarNavItems(navItems, ctx({ role: "ops_basico", perms: [] }))
      );

      expect(visiveis).not.toContain("Operações");
      expect(visiveis).not.toContain("Estatística");
   });

   it("role sem permissão nenhuma fica só com o que não é gateado", () => {
      const visiveis = labels(
         filtrarNavItems(navItems, ctx({ role: "sem_nada", perms: [] }))
      );

      expect(visiveis).toEqual(["Início"]);
   });
});

describe("gate por role no grupo de topo", () => {
   it("role fora da lista do grupo não vê o grupo, mesmo com a permissão", () => {
      // O grupo é gateado por `roles`; o filho, por `resource`. Ter a
      // permissão do filho não fura o gate do pai.
      const visiveis = labels(
         filtrarNavItems(
            navItems,
            ctx({
               role: "role_inexistente",
               perms: [{ resource: "ops.tripulantes", name: "view" }],
            })
         )
      );

      expect(visiveis).not.toContain("Operações");
   });
});

describe("invariantes da estrutura de navItems", () => {
   const todosOsFilhos = navItems.flatMap((i) =>
      "children" in i && i.children
         ? i.children.map((c) => ({ grupo: i.label, ...c }))
         : []
   );

   it("nenhum filho combina `resource` e `roles`", () => {
      // Armadilha silenciosa: o filtro checa `resource` PRIMEIRO e retorna,
      // então um filho com os dois nunca teria o `roles` avaliado — o gate
      // por role seria decorativo. Enquanto ninguém combina os dois, o
      // atalho é seguro; esta guarda avisa no dia em que alguém combinar.
      const ambos = todosOsFilhos.filter(
         (c) =>
            "resource" in c &&
            c.resource &&
            "roles" in c &&
            Array.isArray(c.roles) &&
            c.roles.length > 0
      );

      expect(ambos.map((c) => `${c.grupo} > ${c.label}`)).toEqual([]);
   });

   it("todo filho com `resource` tem `permission`", () => {
      // `hasPerm` LIBERA quando falta um dos dois. Um filho com `resource`
      // e sem `permission` ficaria visível para todo mundo, parecendo
      // gateado.
      const capengas = todosOsFilhos.filter(
         (c) => "resource" in c && c.resource && !("permission" in c)
      );

      expect(capengas.map((c) => `${c.grupo} > ${c.label}`)).toEqual([]);
   });

   it("todo grupo `collapse` tem pelo menos um filho", () => {
      const vazios = navItems.filter(
         (i) =>
            i.type === "collapse" && (!("children" in i) || !i.children?.length)
      );

      expect(vazios.map((i) => i.label)).toEqual([]);
   });
});
