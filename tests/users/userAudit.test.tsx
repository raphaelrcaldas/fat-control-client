// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Historico } from "@/components/audit/Historico";
import type { UserActionLog } from "services/routes/logs";
import {
   formatUserAuditFieldValue,
   USER_AUDIT_ACTION_LABELS,
} from "@/app/(home)/users/[id]/components/userAuditFormat";
import { USER_FIELD_LABELS } from "@/app/(home)/users/[id]/components/userFieldLabels";

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
      resource: "users",
      resource_id: 317,
      action: "patch",
      before: null,
      after: null,
      timestamp: "2026-08-31T17:40:13",
      ...overrides,
   };
}

function renderHistorico(logs: UserActionLog[]) {
   render(
      <Historico
         logs={logs}
         fieldLabels={USER_FIELD_LABELS}
         actionLabels={USER_AUDIT_ACTION_LABELS}
         formatFieldValue={formatUserAuditFieldValue}
      />
   );
}

describe("auditoria de usuários", () => {
   it("nomeia reset legado sem before/after como senha redefinida", () => {
      renderHistorico([log({ action: "reset-pwd" })]);

      expect(screen.getByText(/Senha redefinida · TC AUDITOR/)).not.toBeNull();
   });

   it("reserva senha alterada para a troca feita pelo próprio usuário", () => {
      renderHistorico([log({ action: "change-pwd" })]);

      expect(screen.getByText(/Senha alterada · TC AUDITOR/)).not.toBeNull();
   });

   it("distingue criação de alteração", () => {
      renderHistorico([log({ action: "create" })]);

      expect(screen.getByText(/Criado · TC AUDITOR/)).not.toBeNull();
      expect(screen.queryByText(/Alterado · TC AUDITOR/)).toBeNull();
   });

   it("mostra a mudança de status como Ativo/Inativo", () => {
      renderHistorico([
         log({
            before: JSON.stringify({ active: true }),
            after: JSON.stringify({ active: false }),
         }),
      ]);

      expect(screen.getByText("Status:")).not.toBeNull();
      expect(screen.getByText("Ativo")).not.toBeNull();
      expect(screen.getByText("Inativo")).not.toBeNull();
   });

   it("mostra o reset de senha com a transição do flag de troca obrigatória", () => {
      renderHistorico([
         log({
            action: "reset-pwd",
            before: JSON.stringify({ first_login: false }),
            after: JSON.stringify({ first_login: true }),
         }),
      ]);

      expect(screen.getByText(/Senha redefinida · TC AUDITOR/)).not.toBeNull();
      const fieldLabel = screen.getByText("Troca de senha pendente:");
      const row = fieldLabel.closest("li");
      expect(row?.textContent).toContain("Não");
      expect(row?.textContent).toContain("Sim");
   });

   it("humaniza o flag de troca obrigatória de senha", () => {
      expect(formatUserAuditFieldValue("first_login", "true")).toBe("Sim");
      expect(formatUserAuditFieldValue("first_login", "false")).toBe("Não");
   });
});
