// @vitest-environment jsdom

/**
 * Tabela-verdade do predicado de permissão.
 *
 * Todos os 116 pontos gateados da UI passam por estas ~50 linhas de
 * `usePermBased.tsx`. Testar cada componente sob cada uma das 9 roles
 * seria exercitar este mesmo predicado 1.044 vezes; testar o predicado
 * exaustivamente uma vez cobre o mesmo terreno e não quebra quando um
 * card muda de layout.
 *
 * O que este arquivo NÃO cobre, e nenhum teste estático cobre: gate certo
 * no elemento errado (`requiredPerm="delete"` envolvendo o botão Editar).
 * Isso só olho humano ou E2E pega.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, renderHook, cleanup } from "@testing-library/react";

// Mockado em vez de usar o AuthProvider real: o provider faz fetch de
// `/users/me` no boot e resolve org ativa. O que está sob teste é o
// predicado, não a hidratação da sessão.
const useAuthMock = vi.fn();
vi.mock("@/app/context/auth", () => ({
   useAuth: () => useAuthMock(),
}));

const { PermBased, usePermBased } =
   await import("@/app/(home)/hooks/usePermBased");

interface Perm {
   resource: string;
   name: string;
}

function sessao(role: string | null, perms: Perm[] = []) {
   useAuthMock.mockReturnValue({ role, perms });
}

const VER_TRIP: Perm = { resource: "ops.tripulantes", name: "view" };

beforeEach(() => {
   useAuthMock.mockReset();
});

// Com `globals: false` no vitest.config, o auto-cleanup do Testing Library
// não se registra sozinho — sem isto o DOM acumula entre os casos e
// `queryByText` acha o alvo de um teste anterior.
afterEach(cleanup);

describe("PermBased — falha FECHADA", () => {
   it("admin passa sem ter a permissão (bypass do gate)", () => {
      // O mesmo bypass do backend (`security.py`): é ele que faz nome de
      // recurso errado ser invisível para quem desenvolve como admin.
      sessao("admin", []);

      render(
         <PermBased resource="ops.tripulantes" requiredPerm="delete">
            <span>alvo</span>
         </PermBased>
      );

      expect(screen.queryByText("alvo")).not.toBeNull();
   });

   it("role com a permissão exata renderiza", () => {
      sessao("ops_basico", [VER_TRIP]);

      render(
         <PermBased resource="ops.tripulantes" requiredPerm="view">
            <span>alvo</span>
         </PermBased>
      );

      expect(screen.queryByText("alvo")).not.toBeNull();
   });

   it("recurso certo com AÇÃO diferente esconde", () => {
      sessao("ops_basico", [VER_TRIP]);

      render(
         <PermBased resource="ops.tripulantes" requiredPerm="delete">
            <span>alvo</span>
         </PermBased>
      );

      expect(screen.queryByText("alvo")).toBeNull();
   });

   it("ação certa em RECURSO diferente esconde", () => {
      sessao("ops_basico", [VER_TRIP]);

      render(
         <PermBased resource="cegep.comiss" requiredPerm="view">
            <span>alvo</span>
         </PermBased>
      );

      expect(screen.queryByText("alvo")).toBeNull();
   });

   it("recurso inexistente esconde EM SILÊNCIO, sem erro", () => {
      // A regressão que já aconteceu três vezes (`esfaer`, `etp_mis`,
      // `operacoes.etapa`): nome errado não avisa, só some. Por isso a
      // validação de nome vive no lint (`tests/rbac/check.mjs`), e não
      // aqui — em runtime é tarde.
      sessao("ops_basico", [VER_TRIP]);

      expect(() =>
         render(
            <PermBased resource="recurso.que.nao.existe" requiredPerm="view">
               <span>alvo</span>
            </PermBased>
         )
      ).not.toThrow();

      expect(screen.queryByText("alvo")).toBeNull();
   });

   it("sem role esconde, mesmo com a permissão na lista", () => {
      sessao(null, [VER_TRIP]);

      render(
         <PermBased resource="ops.tripulantes" requiredPerm="view">
            <span>alvo</span>
         </PermBased>
      );

      expect(screen.queryByText("alvo")).toBeNull();
   });

   it("role sem permissão nenhuma esconde", () => {
      sessao("apoio_basico", []);

      render(
         <PermBased resource="ops.tripulantes" requiredPerm="view">
            <span>alvo</span>
         </PermBased>
      );

      expect(screen.queryByText("alvo")).toBeNull();
   });
});

describe("usePermBased().hasPerm — falha ABERTA", () => {
   function hasPerm(role: string | null, perms: Perm[] = []) {
      sessao(role, perms);
      return renderHook(() => usePermBased()).result.current.hasPerm;
   }

   it("admin libera qualquer recurso, inclusive inexistente", () => {
      expect(hasPerm("admin")("qualquer.coisa", "delete")).toBe(true);
   });

   it("permissão exata libera", () => {
      expect(hasPerm("ops_basico", [VER_TRIP])("ops.tripulantes", "view")).toBe(
         true
      );
   });

   it("ação diferente nega", () => {
      expect(
         hasPerm("ops_basico", [VER_TRIP])("ops.tripulantes", "delete")
      ).toBe(false);
   });

   it("recurso diferente nega", () => {
      expect(hasPerm("ops_basico", [VER_TRIP])("cegep.comiss", "view")).toBe(
         false
      );
   });

   /**
    * As três asserções abaixo documentam comportamento SURPREENDENTE, não
    * desejado: `hasPerm` e `PermBased` moram no mesmo arquivo e têm
    * posturas OPOSTAS em caso de dúvida.
    *
    * - `PermBased` sem role => esconde.
    * - `hasPerm` sem role   => decide só pela lista de perms.
    * - `hasPerm` sem argumento (ou com só um) => LIBERA.
    *
    * O sidebar depende disso: item de menu sem `resource` tem que
    * aparecer, e ele chama `hasPerm(child.resource, child.permission)`
    * com ambos possivelmente `undefined`. Ou seja, o default aberto é
    * carga útil, não descuido — mas é frágil: um `resource` que chega
    * `undefined` por engano vira "liberado" em vez de "escondido".
    *
    * Se um dia isso for corrigido, estes testes falham de propósito —
    * são o registro de que a decisão foi consciente.
    */
   it("sem argumento nenhum LIBERA (default aberto)", () => {
      expect(hasPerm("apoio_basico", [])()).toBe(true);
   });

   it("com só o recurso, sem a ação, LIBERA", () => {
      expect(hasPerm("apoio_basico", [])("ops.tripulantes")).toBe(true);
   });

   it("sem role, decide pela lista de perms (diverge do PermBased)", () => {
      expect(hasPerm(null, [VER_TRIP])("ops.tripulantes", "view")).toBe(true);
   });
});
