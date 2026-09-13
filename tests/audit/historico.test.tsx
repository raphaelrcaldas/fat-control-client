// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Historico } from "@/components/audit/Historico";
import type { UserActionLog } from "services/routes/logs";

afterEach(cleanup);

const actor = {
   id: 240,
   p_g: "TC",
   nome_guerra: "AUDITOR",
   unidade: "11gt",
};

function log(overrides: Partial<UserActionLog>): UserActionLog {
   return {
      id: 1,
      user: actor,
      resource: "ops.tripulantes",
      resource_id: 317,
      action: "create",
      before: null,
      after: null,
      timestamp: "2026-08-31T17:40:13",
      ...overrides,
   };
}

const fieldLabels = { func: "Função", oper: "Operacionalidade" };

function renderHistorico(logs: UserActionLog[]) {
   render(<Historico logs={logs} fieldLabels={fieldLabels} />);
}

describe("Historico", () => {
   it("create com after preenchido lista os valores novos", () => {
      renderHistorico([
         log({
            action: "create",
            after: JSON.stringify({ func: "pil", oper: "op" }),
         }),
      ]);

      expect(screen.getByText(/Criado · TC AUDITOR/)).not.toBeNull();
      expect(screen.getByText("pil")).not.toBeNull();
      expect(screen.getByText("op")).not.toBeNull();
   });

   it("create sem after não lista nada e mostra o rótulo de criado", () => {
      renderHistorico([log({ action: "create", after: null })]);

      expect(screen.getByText(/Criado · TC AUDITOR/)).not.toBeNull();
      expect(screen.queryByText("Função:")).toBeNull();
      expect(screen.queryByText("Operacionalidade:")).toBeNull();
   });

   it("delete não lista mudanças mesmo com before preenchido", () => {
      renderHistorico([
         log({
            action: "delete",
            before: JSON.stringify({ func: "pil" }),
            after: null,
         }),
      ]);

      expect(screen.getByText(/Removido · TC AUDITOR/)).not.toBeNull();
      expect(screen.queryByText("Função:")).toBeNull();
   });

   it("after como texto livre (não-JSON) não derruba o componente nem lista caracteres", () => {
      renderHistorico([
         log({
            action: "update",
            after: "Tentou acessar recurso sem permissão",
         }),
      ]);

      expect(screen.getByText(/Alterado · TC AUDITOR/)).not.toBeNull();
      // Se `Object.keys` tivesse iterado a string, sobrariam nós "0", "1"...
      expect(screen.queryByText("0:")).toBeNull();
   });

   it("after como JSON inválido não derruba o componente", () => {
      renderHistorico([log({ action: "update", after: "{ not: valid json" })]);

      expect(screen.getByText(/Alterado · TC AUDITOR/)).not.toBeNull();
   });

   it("after como array JSON válido é tratado como sem campos (não é objeto)", () => {
      renderHistorico([log({ action: "update", after: "[1,2,3]" })]);

      expect(screen.getByText(/Alterado · TC AUDITOR/)).not.toBeNull();
      expect(screen.queryByText("0:")).toBeNull();
   });

   it("dois logs com mesmo timestamp saem em ordem de id", () => {
      renderHistorico([
         log({
            id: 5,
            timestamp: "2026-08-31T17:40:13",
            after: JSON.stringify({ func: "cop" }),
         }),
         log({
            id: 2,
            timestamp: "2026-08-31T17:40:13",
            after: JSON.stringify({ func: "pil" }),
         }),
      ]);

      // O item de id menor (2, valor "pil") deve vir antes do de id maior
      // (5, valor "cop") no DOM — mesmo timestamp, desempate por id.
      const posicao = screen
         .getByText("pil")
         .compareDocumentPosition(screen.getByText("cop"));

      expect(posicao & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
   });
});
