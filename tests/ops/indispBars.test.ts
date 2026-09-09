import { describe, expect, it } from "vitest";
import { buildRowBars } from "@/app/(home)/ops/indisp/components/board/utils/indispBars";
import type { CrewIndispList } from "services/routes/indisps";
import type { RestricaoDerivada } from "services/routes/ops/restricoes";
const dates = Array.from({ length: 7 }, (_, i) => new Date(2026, 8, 7 + i));
const dsp: RestricaoDerivada = {
   origem: "recencia_voo",
   codigo: "desadaptacao",
   inicio: "2026-09-08",
   fim: null,
   efeito: "aviso",
};
function entry(restricoes: RestricaoDerivada[]): CrewIndispList {
   return {
      trip: { id: 1 } as CrewIndispList["trip"],
      indisps: [],
      restricoes_derivadas: restricoes,
      elegivel_desadaptacao: true,
   };
}
describe("faixas derivadas", () => {
   it("usa a primeira pista para desadaptação isolada", () => {
      const result = buildRowBars(entry([dsp]), dates);
      expect(result.lanes).toBe(1);
      expect(result.bars[0]).toMatchObject({
         lane: 0,
         from: 1,
         to: 7,
         effect: "aviso",
         indisp: null,
         cutRight: true,
      });
   });
   it("preserva barras próprias quando CEMAL e desadaptação se sobrepõem", () => {
      const cem: RestricaoDerivada = {
         origem: "cemal",
         codigo: "cemal_ausente",
         inicio: null,
         fim: null,
         efeito: "bloqueio",
      };
      const result = buildRowBars(entry([cem, dsp]), dates);
      expect(result.lanes).toBe(2);
      expect(result.bars.map((b) => b.code)).toEqual(["CEM", "DSP"]);
      expect(result.bars.map((b) => b.effect)).toEqual(["bloqueio", "aviso"]);
   });
   it("respeita fim inclusivo e descarta restrições fora da janela", () => {
      const result = buildRowBars(
         entry([
            { ...dsp, inicio: null, fim: "2026-09-08" },
            { ...dsp, inicio: "2026-09-14" },
         ]),
         dates
      );
      expect(result.bars).toHaveLength(1);
      expect(result.bars[0]).toMatchObject({
         from: 0,
         to: 2,
         cutLeft: true,
         cutRight: false,
      });
   });
   it("reutiliza pista administrativa sem sobreposição", () => {
      const data = entry([{ ...dsp, inicio: "2026-09-10" }]);
      data.indisps = [
         {
            id: 2,
            mtv: "svc",
            date_start: "2026-09-07",
            date_end: "2026-09-09",
            obs: null,
         },
      ];
      const result = buildRowBars(data, dates);
      expect(result.lanes).toBe(1);
      expect(result.bars).toHaveLength(2);
   });
});
