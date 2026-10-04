// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { RelatorioMensalConteudo } from "@/app/(home)/estatistica/tripulante/components/RelatorioMensalConteudo";
import {
   relatorioMensalFixture,
   metricasVazias,
} from "./fixtures/relatorioMensal";

afterEach(cleanup);
describe("relatório mensal", () => {
   it("mostra uma etapa com suas funções e mantém NVG separado do noturno", () => {
      render(<RelatorioMensalConteudo relatorio={relatorioMensalFixture} />);
      const etapas = within(
         screen.getByRole("region", { name: "Aeronaves: etapas do mês" })
      );
      expect(etapas.getAllByRole("row")).toHaveLength(2);
      expect(etapas.queryByText("lm, ml")).toBeNull();
      expect(etapas.getByText("AC, IN")).toBeTruthy();
      expect(etapas.queryByText("Loadmaster")).toBeNull();
      expect(etapas.getByText("SBGL")).toBeTruthy();
      expect(etapas.getByText("SBBR")).toBeTruthy();
      expect(etapas.getByText("2870")).toBeTruthy();
      expect(etapas.getByText("10/05/26")).toBeTruthy();
      const cells = etapas.getAllByRole("row")[1].querySelectorAll("td");
      const headers = etapas
         .getAllByRole("columnheader")
         .map((cell) => cell.textContent);
      const value = (header: string) =>
         cells[headers.indexOf(header)].textContent;
      expect(headers.slice(0, 2)).toEqual(["Tipo", "Matrícula"]);
      expect(headers).not.toContain("Bordo");
      expect(headers).not.toContain("Missão");
      expect(value("Tipo")).toBe("kc-390");
      expect(value("Matrícula")).toBe("2870");
      expect(value("Origem")).toBe("SBGL");
      expect(value("Destino")).toBe("SBBR");
      expect(value("DEP")).toBe("10:00");
      expect(value("PSO")).toBe("12:00");
      expect(value("Função")).toBe("AC, IN");
      expect(value("Noturno")).toBe("00:30");
      expect(value("NVG")).toBe("00:30");
      const resumo = screen.getByRole("region", { name: "Resumo do mês" });
      expect(within(resumo).queryByText("Último voo (ANV)")).toBeNull();
      expect(resumo.querySelectorAll("dt")).toHaveLength(2);
   });
   it("preserva identificação e acumulados quando não há etapas no mês", () => {
      render(
         <RelatorioMensalConteudo
            relatorio={{
               ...relatorioMensalFixture,
               aeronaves: {
                  ...relatorioMensalFixture.aeronaves,
                  total: metricasVazias,
                  etapas: [],
                  por_aeronave_funcao: [],
               },
            }}
         />
      );
      expect(screen.getByText("Fulano da Silva")).toBeTruthy();
      expect(
         screen.getAllByText("Nenhuma etapa registrada neste mês.")
      ).toHaveLength(2);
      const totais = within(
         screen.getByRole("region", { name: "Aeronaves: totais por período" })
      );
      expect(totais.getByText("10:00")).toBeTruthy();
      expect(totais.getByText("500:00")).toBeTruthy();
      expect(totais.getByText("Geral")).toBeTruthy();
   });
});
