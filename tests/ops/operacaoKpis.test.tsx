// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { KpiGrid } from "@/app/(home)/ops/operacoes/components/KpiGrid";
import type { OperacaoKpis } from "services/routes/ops/operacoes";

afterEach(cleanup);

const baseKpis: OperacaoKpis = {
   horas: 120,
   etapas: 2,
   anv: 1,
   pax: 10,
   carga: 500,
   comb: 800,
   pqd: 7,
   comb_transf: 2500,
   heavy_qtd: 1,
   cds_qtd: 2,
   peso_lancado: 1250,
   missoes: 1,
   modelos: 1,
};

function metric(label: string) {
   const term = screen.getByText(label);
   const container = term.closest("div");
   if (!container) throw new Error(`Indicador sem card: ${label}`);
   return within(container);
}

describe("indicadores da operação", () => {
   it("renderiza os nove cards e compõe Heavy e CDS com as unidades corretas", () => {
      render(<KpiGrid kpis={baseKpis} />);

      expect(screen.getAllByRole("term")).toHaveLength(9);
      expect(metric("PQDs lançados").getByText("7")).not.toBeNull();

      const cargas = metric("Cargas lançadas");
      expect(cargas.getByText("3")).not.toBeNull();
      expect(cargas.getByText("1 Heavy / 2 CDS • 1.250 kg")).not.toBeNull();

      const combustivel = metric("Combustível transferido");
      expect(combustivel.getByText("2.500")).not.toBeNull();
      expect(combustivel.getByText("L")).not.toBeNull();
   });

   it("distingue métricas ausentes de valores efetivamente zerados", () => {
      const { rerender } = render(
         <KpiGrid
            kpis={
               {
                  ...baseKpis,
                  pqd: undefined,
                  comb_transf: undefined,
                  heavy_qtd: undefined,
                  cds_qtd: undefined,
                  peso_lancado: undefined,
               } as unknown as OperacaoKpis
            }
         />
      );

      expect(screen.getAllByText("Indisponível")).toHaveLength(3);

      rerender(
         <KpiGrid
            kpis={{
               ...baseKpis,
               pqd: 0,
               comb_transf: 0,
               heavy_qtd: 0,
               cds_qtd: 0,
               peso_lancado: 0,
            }}
         />
      );

      expect(screen.queryByText("Indisponível")).toBeNull();
      expect(metric("PQDs lançados").getByText("0")).not.toBeNull();
      expect(metric("Cargas lançadas").getByText("0")).not.toBeNull();
      expect(metric("Combustível transferido").getByText("0")).not.toBeNull();
      expect(metric("Combustível transferido").getByText("L")).not.toBeNull();
   });
});
