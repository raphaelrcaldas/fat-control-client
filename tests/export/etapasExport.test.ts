import { describe, expect, it } from "vitest";
import { sortEtapasForExport } from "@/app/(home)/estatistica/etapas/exportColumns";

describe("sortEtapasForExport", () => {
   it("ordena por data, DEP e ID sem alterar o carrinho", () => {
      const selecionadas = [
         { id: 30, data: "2026-09-07", dep: "08:00:00" },
         { id: 20, data: "2026-09-06", dep: "10:00:00" },
         { id: 11, data: "2026-09-06", dep: "08:00:00" },
         { id: 10, data: "2026-09-06", dep: "08:00:00" },
      ];

      const ordenadas = sortEtapasForExport(selecionadas);

      expect(ordenadas.map((etapa) => etapa.id)).toEqual([10, 11, 20, 30]);
      expect(selecionadas.map((etapa) => etapa.id)).toEqual([30, 20, 11, 10]);
   });
});
