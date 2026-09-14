// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { IndicadoresGrid } from "@/app/(home)/ops/operacoes/components/IndicadoresGrid";
import type { OperacaoKpis } from "services/routes/ops/operacoes";

afterEach(cleanup);

const baseKpis: OperacaoKpis = {
   horas: 120,
   etapas: 2,
   anv: 1,
   pax: 10,
   carga: 500,
   comb: 800,
   lub: 12.5,
   pqd: 7,
   comb_transf: 2500,
   heavy_qtd: 1,
   cds_qtd: 2,
   peso_lancado: 1250,
   missoes: 1,
   modelos: 1,
};

// O cartão é o `KpiCard` compartilhado, uma pilha de `div`s sem papel ARIA —
// então sobe-se do rótulo até o elemento que é filho direto da grade, em vez
// de contar `parentElement`s (que quebra a cada ajuste de markup do cartão).
function metric(label: string) {
   const term = screen.getByText(label);
   const grade = term.closest("section")?.querySelector(".grid");
   let card: HTMLElement | null = term;
   while (card && card.parentElement !== grade) card = card.parentElement;
   if (!card) throw new Error(`Indicador sem card: ${label}`);
   return within(card);
}

describe("indicadores da operação", () => {
   it("compõe Heavy e CDS e mantém as unidades", () => {
      render(<IndicadoresGrid kpis={baseKpis} />);

      expect(metric("PQDs lançados").getByText("7")).not.toBeNull();

      const cargas = metric("Cargas lançadas");
      expect(cargas.getByText("3")).not.toBeNull();
      expect(cargas.getByText(/1 Heavy \/ 2 CDS/)).not.toBeNull();

      const combustivel = metric("Combustível transferido");
      expect(combustivel.getByText("2.500")).not.toBeNull();
      expect(combustivel.getByText("L")).not.toBeNull();
   });

   it("mantém 'Indisponível' no cartão quando o dado não veio", () => {
      render(
         <IndicadoresGrid
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

      // Ausente não é zero: continua na grade, sinalizado, em vez de descer
      // para a faixa de "sem registro" — que afirmaria que não houve.
      expect(screen.getAllByText("Indisponível")).toHaveLength(3);
      expect(screen.queryByText(/Sem registro nesta operação/)).toBeNull();
   });

   it("desce para a faixa o que veio zerado, sem sumir da tela", () => {
      render(
         <IndicadoresGrid
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

      const faixa = screen
         .getByText(/Sem registro nesta operação/)
         .closest("p");
      if (!faixa) throw new Error("faixa de zerados não encontrada");

      for (const label of [
         "PQDs lançados",
         "Cargas lançadas",
         "Combustível transferido",
      ]) {
         expect(within(faixa).getByText(label)).not.toBeNull();
         // saiu da grade: não há mais cartão com esse rótulo
         expect(screen.getAllByText(label)).toHaveLength(1);
      }
   });

   it("mostra o efetivo junto das demais dimensões quando informado", () => {
      render(<IndicadoresGrid kpis={baseKpis} efetivo={41} />);
      expect(metric("Efetivo").getByText("41")).not.toBeNull();
   });
});
