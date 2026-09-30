import { describe, expect, it } from "vitest";
import { ApiError } from "services/Api";
import { formatSaveError } from "@/app/(home)/estatistica/etapas/missao/context/saveErrors";
import type {
   DraftEtapa,
   MissaoDraft,
} from "@/app/(home)/estatistica/etapas/missao/context/types";

const item = (serverId: number | null, dirty: boolean): DraftEtapa =>
   ({ localId: `l${serverId ?? "n"}`, serverId, dirty }) as DraftEtapa;
const draft = {
   etapas: [item(10, false), item(11, true), item(null, true)],
} as MissaoDraft;

const business = new ApiError(
   "update[0](id=11): conflito; create[0]: colisão; update[5](id=99): x; create[7]: y"
);
const fields = new ApiError("Erro de validação", {
   "body.update.0.pousos": "Field required",
   "body.create.0.dep": "Field required",
});

describe("formatSaveError", () => {
   it("usa 'Etapa' por padrão (Estatística)", () => {
      expect(formatSaveError(business, draft).message).toBe(
         "Etapa 2: conflito; Etapa 3: colisão; Etapa (#99): x; Etapa nova: y"
      );
      expect(formatSaveError(fields, draft).message).toMatch(
         /^• Etapa 2 · Qtd\. Pousos: .*\n• Etapa 3 · Decolagem: /
      );
   });

   it("troca o rótulo pelo da tela, mantendo a numeração da sidebar", () => {
      expect(formatSaveError(business, draft, "Sessão").message).toBe(
         "Sessão 2: conflito; Sessão 3: colisão; Sessão (#99): x; Sessão nova: y"
      );
      expect(formatSaveError(fields, draft, "Sessão").message).toMatch(
         /^• Sessão 2 · Qtd\. Pousos: .*\n• Sessão 3 · Decolagem: /
      );
   });
});
