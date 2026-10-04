// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { RelatorioConteudo } from "@/app/(home)/estatistica/tripulante/components/RelatorioConteudo";

afterEach(cleanup);

const metricas = {
   tvoo: 120,
   diurno: 60,
   noturno: 30,
   nvg: 30,
   sem_regime: 0,
   pousos: 2,
   etapas: 1,
   ultimo_voo: "2025-03-10",
};
const vazio = {
   total: {
      ...metricas,
      tvoo: 0,
      diurno: 0,
      noturno: 0,
      nvg: 0,
      pousos: 0,
      etapas: 0,
      ultimo_voo: null,
   },
   por_aeronave_funcao: [],
};
const relatorio = {
   ano: 2025,
   tripulante: {
      id: 7,
      user_id: 8,
      p_g: "2s",
      nome_guerra: "Fulano",
      nome_completo: "Fulano da Silva",
      trig: "FUL",
   },
   aeronaves: {
      total: {
         ...metricas,
         tvoo: 360,
         diurno: 180,
         noturno: 90,
         nvg: 90,
         pousos: 6,
         etapas: 3,
      },
      por_aeronave_funcao: [
         { ...metricas, modelo: "kc-390", func: "lm" },
         { ...metricas, modelo: "kc-390", func: "ml" },
         { ...metricas, modelo: "kc-390", func: "zz" },
      ],
   },
   simuladores: vazio,
};

describe("relatório anual individual", () => {
   it("exibe todas as funções recebidas sem uma função principal", () => {
      render(<RelatorioConteudo relatorio={relatorio} />);
      expect(screen.getByText("Fulano da Silva")).toBeTruthy();
      expect(screen.getAllByText("ml").length).toBeGreaterThan(0);
      expect(screen.getAllByText("zz").length).toBeGreaterThan(0);
      expect(screen.queryByText(/função principal/i)).toBeNull();
      const resumo = screen.getByRole("region", { name: "Resumo do ano" });
      expect(within(resumo).getByText("06:00")).toBeTruthy();
      expect(within(resumo).getByText("Último voo (ANV)")).toBeTruthy();
      expect(within(resumo).getByText("10/03/2025")).toBeTruthy();
      expect(within(resumo).getByText("10/03/25")).toBeTruthy();
      expect(within(resumo).queryByText("Etapas")).toBeNull();
      // Uma tabela só (sem variante de cartões para o celular).
      expect(screen.getAllByRole("table")).toHaveLength(1);
      expect(screen.getAllByText("Total").length).toBe(2);
   });

   it("informa ausência de regime sem apresentar tudo como diurno", () => {
      render(
         <RelatorioConteudo
            relatorio={{
               ...relatorio,
               aeronaves: {
                  ...relatorio.aeronaves,
                  total: {
                     ...metricas,
                     diurno: 0,
                     noturno: 0,
                     nvg: 0,
                     sem_regime: 120,
                  },
               },
            }}
         />
      );
      expect(screen.getByText(/02:00 sem regime informado/)).toBeTruthy();
   });

   it("um ano vazio conserva a identificação e informa ausência de etapas", () => {
      render(
         <RelatorioConteudo
            relatorio={{ ...relatorio, aeronaves: vazio, simuladores: vazio }}
         />
      );
      expect(screen.getByText("Fulano da Silva")).toBeTruthy();
      expect(screen.getByText(/Nenhuma etapa registrada em 2025/)).toBeTruthy();
      const resumo = screen.getByRole("region", { name: "Resumo do ano" });
      expect(within(resumo).getByText("—")).toBeTruthy();
   });
});
