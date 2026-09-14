import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { origemDaRestricao } from "@/app/(home)/ops/indisp/components/derivada/derivadaDetalhe";
import type { RestricaoDerivada } from "services/routes/ops/restricoes";

/**
 * O catálogo de RBAC é a fonte da verdade dos nomes de recurso e ação.
 *
 * Este par não passa pelo lint de RBAC, que só reconhece `<PermBased>` em JSX
 * — aqui ele vive num objeto literal. Sem este teste, `perm: "read"` (a ação
 * não existe; a correta é "view") passava por tudo e escondia o botão de
 * quem não é admin, silenciosamente.
 */
const catalogo = JSON.parse(
   readFileSync(
      new URL("../../../api/rbac-resources.json", import.meta.url),
      "utf8"
   )
) as { recursos: Record<string, string[]> };

const CODIGOS = [
   "operacao",
   "cemal_ausente",
   "cemal_vencido",
   "desadaptacao",
] as const;

describe("permissões das restrições derivadas", () => {
   it.each(CODIGOS)("%s cita recurso e ação que existem", (codigo) => {
      const { resource, perm } = origemDaRestricao({
         origem: "operacao",
         codigo,
         inicio: null,
         fim: null,
         efeito: "bloqueio",
         rotulo: null,
         operacao_id: null,
      } as RestricaoDerivada);

      expect(Object.keys(catalogo.recursos)).toContain(resource);
      expect(catalogo.recursos[resource]).toContain(perm);
   });
});
