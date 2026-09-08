import { describe, expect, it } from "vitest";
import { RestricoesDerivadasEntrySchema } from "services/routes/ops/restricoes";
import {
   computeIndispStatus,
   filterRestricoesForDate,
} from "@/app/(home)/ops/indisp/utils/indispStatus";
import { buildBuckets } from "@/app/(home)/ops/escala/utils/buildEscala";

const cemalVencido = {
   origem: "cemal" as const,
   codigo: "cemal_vencido" as const,
   inicio: "2026-09-08",
   fim: null,
   efeito: "bloqueio" as const,
};

const desadaptacao = {
   origem: "recencia_voo" as const,
   codigo: "desadaptacao" as const,
   inicio: "2026-09-10",
   fim: null,
   efeito: "aviso" as const,
};

describe("restrições derivadas operacionais", () => {
   it("rejeita campo derivado ausente ou datas inválidas", () => {
      expect(() => RestricoesDerivadasEntrySchema.parse({})).toThrow();
      expect(() =>
         RestricoesDerivadasEntrySchema.parse({
            restricoes_derivadas: [],
         })
      ).toThrow();
      expect(() =>
         RestricoesDerivadasEntrySchema.parse({
            restricoes_derivadas: [{ ...cemalVencido, inicio: "08/09/2026" }],
            elegivel_desadaptacao: true,
         })
      ).toThrow();
   });

   it("preserva validade inclusiva e aplica o bloqueio no dia seguinte", () => {
      expect(
         filterRestricoesForDate([cemalVencido], new Date(2026, 8, 7))
      ).toEqual([]);
      expect(
         filterRestricoesForDate([cemalVencido], new Date(2026, 8, 8))
      ).toEqual([cemalVencido]);
   });

   it("abre a célula por uma derivada, sem transformá-la em indisponibilidade editável", () => {
      const status = computeIndispStatus(
         {
            trip: {} as never,
            indisps: [],
            restricoes_derivadas: [desadaptacao],
            elegivel_desadaptacao: true,
         },
         new Date(2026, 8, 10)
      );

      expect(status.canOpen).toBe(true);
      expect(status.filterIndisp).toEqual([]);
      expect(status.restricoesDerivadas).toEqual([desadaptacao]);
      expect(status.color).toContain("slate");
   });

   it("mantém desadaptação como aviso na escala", () => {
      const [bucket] = buildBuckets(
         [
            {
               func: "mc",
               trips: [
                  {
                     id: 1,
                     user_id: 1,
                     nome_guerra: "TESTE",
                     p_g: "CAP",
                     trig: "TST",
                     func: "mc",
                     oper: "op",
                     quads_count: 0,
                     tvoo_year: 0,
                     data_ult_voo: "2026-07-27",
                     cemal_date: "2027-01-01",
                     indisps: [],
                     restricoes_derivadas: [desadaptacao],
                     elegivel_desadaptacao: true,
                  },
               ],
            },
         ],
         "2026-09-10"
      );

      expect(bucket.disponiveis).toHaveLength(1);
      expect(bucket.disponiveis[0].isDesadaptado).toBe(true);
   });
});
