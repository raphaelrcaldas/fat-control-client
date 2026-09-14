import { describe, expect, it } from "vitest";
import {
   descreverRestricao,
   origemDaRestricao,
} from "@/app/(home)/ops/indisp/components/derivada/derivadaDetalhe";
import type { RestricaoDerivada } from "services/routes/ops/restricoes";

function restricao(over: Partial<RestricaoDerivada>): RestricaoDerivada {
   return {
      origem: "operacao",
      codigo: "operacao",
      inicio: "2026-09-11",
      fim: "2026-09-22",
      efeito: "bloqueio",
      rotulo: "SLOP",
      operacao_id: 2,
      ...over,
   } as RestricaoDerivada;
}

describe("origem da restrição derivada", () => {
   it("leva ao dossiê da operação que originou a faixa", () => {
      expect(origemDaRestricao(restricao({})).href).toBe("/ops/operacoes/2");
   });

   it("cai na lista quando a operação não veio identificada", () => {
      const semId = restricao({ operacao_id: null });
      expect(origemDaRestricao(semId).href).toBe("/ops/operacoes");
   });

   it("não oferece link para o CEMAL: a tela de destino é uma lista", () => {
      for (const codigo of ["cemal_vencido", "cemal_ausente"] as const) {
         const cem = restricao({
            origem: "cemal",
            codigo,
            rotulo: null,
            operacao_id: null,
         });
         expect(origemDaRestricao(cem).href).toBeNull();
      }
   });

   it("nenhuma derivada além da operação tem deeplink", () => {
      const semLink = (
         ["cemal_ausente", "cemal_vencido", "desadaptacao"] as const
      ).map((codigo) => origemDaRestricao(restricao({ codigo })));
      expect(semLink.map((o) => o.href)).toEqual([null, null, null]);
   });

   it("não oferece link para desadaptação: some sozinha com um voo novo", () => {
      const dsp = restricao({
         origem: "recencia_voo",
         codigo: "desadaptacao",
         rotulo: null,
         operacao_id: null,
      });
      expect(origemDaRestricao(dsp).href).toBeNull();
   });
});

describe("descrição da restrição", () => {
   it("nomeia a operação e o período numa frase só", () => {
      const texto = descreverRestricao(restricao({}), "MJ GLAUBER");
      expect(texto).toContain("na operação SLOP");
      expect(texto).toContain("de 11/09 a 22/09");
   });

   it("não inventa nome quando a operação não veio", () => {
      const anon = restricao({ rotulo: null });
      const texto = descreverRestricao(anon, "MJ GLAUBER");
      expect(texto).toContain("em operação");
      expect(texto).not.toContain("null");
   });

   it("omite o período quando falta uma das pontas", () => {
      const aberto = restricao({ fim: null });
      const texto = descreverRestricao(aberto, "MJ GLAUBER");
      expect(texto).not.toContain("null");
      expect(texto).not.toMatch(/\bde\s+\d/);
   });

   it("diz desde quando o CEMAL venceu", () => {
      const cem = restricao({
         origem: "cemal",
         codigo: "cemal_vencido",
         inicio: "2026-09-28",
         fim: null,
         rotulo: null,
         operacao_id: null,
      });
      expect(descreverRestricao(cem, "MJ GLAUBER")).toContain("desde 28/09");
   });

   it("não promete data que não veio no CEMAL ausente", () => {
      const cem = restricao({
         origem: "cemal",
         codigo: "cemal_ausente",
         inicio: null,
         fim: null,
         rotulo: null,
         operacao_id: null,
      });
      const texto = descreverRestricao(cem, "MJ GLAUBER");
      expect(texto).not.toContain("desde");
      expect(texto).not.toContain("null");
   });
});
