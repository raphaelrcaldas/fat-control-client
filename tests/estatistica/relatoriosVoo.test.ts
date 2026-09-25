import { describe, it, expect, vi, afterEach } from "vitest";
import { formatDiaSemana } from "utils/dateHandler";
import {
   periodoPadrao,
   dataIsoValida,
   ajustarPeriodo,
   periodoSeValido,
   agruparPorDia,
   executarComLimite,
   separarFrota,
   formatarTamanho,
} from "@/app/(home)/estatistica/relatorios-voo/utils/relatorios";
import type { RelatorioVoo } from "services/routes/estatistica/relatoriosVoo";

const rel = (id: number, data: string): RelatorioVoo => ({
   id,
   anv: "2850",
   data,
   seq: 1,
   file_path: `11gt/2026/2850_${data}.pdf`,
   file_name: "scan.pdf",
   file_size: 1000,
   num_paginas: 1,
   obs: null,
   uploaded_by: 1,
   uploaded_by_p_g: "1t",
   uploaded_by_nome_guerra: "costa",
   created_at: "2026-09-21T12:00:00+00:00",
});

describe("formatDiaSemana", () => {
   it("usa o dia da semana da data, sem fuso", () => {
      expect(formatDiaSemana("2026-09-20")).toBe("Domingo, 20/09/2026");
      expect(formatDiaSemana("2026-09-22")).toBe("Terça, 22/09/2026");
   });
});

describe("periodoPadrao", () => {
   afterEach(() => {
      vi.useRealTimers();
   });

   it("devolve os últimos 15 dias (hoje - 14 até hoje, inclusivo)", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 8, 23)); // 2026-09-23
      expect(periodoPadrao()).toEqual({
         data_ini: "2026-09-09",
         data_fim: "2026-09-23",
      });
   });

   it("cruza o mês corretamente", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 2, 5)); // 2026-03-05
      expect(periodoPadrao()).toEqual({
         data_ini: "2026-02-19",
         data_fim: "2026-03-05",
      });
   });
});

describe("dataIsoValida", () => {
   it("aceita 'AAAA-MM-DD' que forma uma data real", () => {
      expect(dataIsoValida("2026-09-23")).toBe(true);
   });

   it("recusa dia inexistente no mês", () => {
      expect(dataIsoValida("2026-02-30")).toBe(false);
   });

   it("recusa mês inexistente", () => {
      expect(dataIsoValida("2026-13-01")).toBe(false);
   });

   it("recusa formato sem separador", () => {
      expect(dataIsoValida("20260901")).toBe(false);
   });

   it("recusa null", () => {
      expect(dataIsoValida(null)).toBe(false);
   });

   it("recusa ano intermediário emitido durante a digitação (Chrome)", () => {
      expect(dataIsoValida("0002-09-09")).toBe(false);
   });
});

describe("ajustarPeriodo", () => {
   const atual = { data_ini: "2026-09-09", data_fim: "2026-09-23" };
   const hoje = "2026-09-30"; // fixo por parâmetro — não depende da data real

   it("troca a data inicial mantendo a final quando não inverte", () => {
      expect(ajustarPeriodo(atual, "data_ini", "2026-09-15", hoje)).toEqual({
         data_ini: "2026-09-15",
         data_fim: "2026-09-23",
      });
   });

   it("troca a data final mantendo a inicial quando não inverte", () => {
      expect(ajustarPeriodo(atual, "data_fim", "2026-09-20", hoje)).toEqual({
         data_ini: "2026-09-09",
         data_fim: "2026-09-20",
      });
   });

   it("puxa a final junto quando a nova inicial vem depois dela", () => {
      expect(ajustarPeriodo(atual, "data_ini", "2026-09-25", hoje)).toEqual({
         data_ini: "2026-09-25",
         data_fim: "2026-09-25",
      });
   });

   it("puxa a inicial junto quando a nova final vem antes dela", () => {
      expect(ajustarPeriodo(atual, "data_fim", "2026-09-01", hoje)).toEqual({
         data_ini: "2026-09-01",
         data_fim: "2026-09-01",
      });
   });

   it("ignora valor inválido e devolve o período inalterado", () => {
      expect(ajustarPeriodo(atual, "data_ini", "2026-02-30", hoje)).toEqual(
         atual
      );
      expect(ajustarPeriodo(atual, "data_fim", "0002-09-09", hoje)).toEqual(
         atual
      );
      expect(ajustarPeriodo(atual, "data_ini", "", hoje)).toEqual(atual);
   });

   it("limita a data confirmada a hoje quando ela é futura", () => {
      expect(ajustarPeriodo(atual, "data_fim", "2026-10-15", hoje)).toEqual({
         data_ini: "2026-09-09",
         data_fim: "2026-09-30",
      });
   });

   it("limita a inicial a hoje mesmo puxando a final junto", () => {
      expect(ajustarPeriodo(atual, "data_ini", "2026-10-15", hoje)).toEqual({
         data_ini: "2026-09-30",
         data_fim: "2026-09-30",
      });
   });
});

describe("periodoSeValido", () => {
   const atual = { data_ini: "2026-09-09", data_fim: "2026-09-23" };
   const hoje = "2026-09-30";

   it("grava a inicial quando o valor sozinho não inverte nem é futuro", () => {
      expect(periodoSeValido(atual, "data_ini", "2026-09-15", hoje)).toEqual({
         data_ini: "2026-09-15",
         data_fim: "2026-09-23",
      });
   });

   it("grava a final quando o valor sozinho não inverte nem é futuro", () => {
      expect(periodoSeValido(atual, "data_fim", "2026-09-20", hoje)).toEqual({
         data_ini: "2026-09-09",
         data_fim: "2026-09-20",
      });
   });

   it("devolve null (não puxa a outra ponta) quando o dígito de dia forma um valor abaixo da inicial", () => {
      // Regressão: digitar "20" no dia da final (período 09-09..09-23)
      // passa por "2026-09-02" como estado intermediário do <input
      // type="date"> do Chrome — isso não pode arrastar a inicial.
      expect(periodoSeValido(atual, "data_fim", "2026-09-02", hoje)).toBeNull();
   });

   it("devolve null quando o dígito de mês forma um valor acima da final", () => {
      expect(periodoSeValido(atual, "data_ini", "2026-10-01", hoje)).toBeNull();
   });

   it("devolve null para data futura", () => {
      expect(periodoSeValido(atual, "data_fim", "2026-10-05", hoje)).toBeNull();
   });

   it("devolve null para valor inválido ou vazio", () => {
      expect(periodoSeValido(atual, "data_ini", "2026-02-30", hoje)).toBeNull();
      expect(periodoSeValido(atual, "data_ini", "", hoje)).toBeNull();
      expect(periodoSeValido(atual, "data_fim", "0002-09-09", hoje)).toBeNull();
   });
});

describe("agruparPorDia", () => {
   it("preserva a ordem da API e agrupa dias iguais", () => {
      const grupos = agruparPorDia([
         rel(3, "2026-09-20"),
         rel(2, "2026-09-20"),
         rel(1, "2026-09-18"),
      ]);
      expect(grupos.map((g) => [g.data, g.itens.map((i) => i.id)])).toEqual([
         ["2026-09-20", [3, 2]],
         ["2026-09-18", [1]],
      ]);
   });
});

describe("executarComLimite", () => {
   it("processa todos sem passar do limite de concorrência", async () => {
      let ativos = 0;
      let pico = 0;
      const feitos: number[] = [];
      await executarComLimite([1, 2, 3, 4, 5], 2, async (n) => {
         ativos += 1;
         pico = Math.max(pico, ativos);
         await new Promise((r) => setTimeout(r, 5));
         feitos.push(n);
         ativos -= 1;
      });
      expect(pico).toBe(2);
      expect(feitos.sort()).toEqual([1, 2, 3, 4, 5]);
   });
});

describe("formatarTamanho", () => {
   it("abaixo de 1 MB, mostra KB arredondado", () => {
      expect(formatarTamanho(4 * 1024)).toBe("4 KB");
      expect(formatarTamanho(500)).toBe("0 KB");
      expect(formatarTamanho(1024 * 1024 - 1)).toBe("1024 KB");
   });

   it("a partir de 1 MB, mostra MB com uma casa decimal", () => {
      expect(formatarTamanho(1024 * 1024)).toBe("1.0 MB");
      expect(formatarTamanho(2.5 * 1024 * 1024)).toBe("2.5 MB");
   });
});

describe("separarFrota", () => {
   const frota = ["2853", "2854", "2855", "2856"];

   it("contagem undefined (primeira carga): tudo em comRelatorio, na ordem da frota", () => {
      expect(separarFrota(frota, undefined, undefined)).toEqual({
         comRelatorio: ["2853", "2854", "2855", "2856"],
         semRelatorio: [],
      });
   });

   it("frota com zeros: separa quem tem contagem > 0 de quem tem 0", () => {
      const contagem = { "2853": 3, "2854": 0, "2855": 1, "2856": 0 };
      expect(separarFrota(frota, contagem, undefined)).toEqual({
         comRelatorio: ["2853", "2855"],
         semRelatorio: ["2854", "2856"],
      });
   });

   it("chave de contagem fora da frota entra no fim de comRelatorio, em ordem alfabética", () => {
      const contagem = { "2853": 1, "2999": 2, "2001": 5 };
      expect(separarFrota(frota, contagem, undefined)).toEqual({
         comRelatorio: ["2853", "2001", "2999"],
         semRelatorio: ["2854", "2855", "2856"],
      });
   });

   it("anvAtiva com contagem 0: entra em comRelatorio (nunca em semRelatorio)", () => {
      const contagem = { "2853": 3, "2854": 0, "2855": 1, "2856": 0 };
      expect(separarFrota(frota, contagem, "2854")).toEqual({
         comRelatorio: ["2853", "2854", "2855"],
         semRelatorio: ["2856"],
      });
   });

   it("anvAtiva fora da frota e sem contagem: entra no fim de comRelatorio", () => {
      const contagem = { "2853": 1 };
      expect(separarFrota(frota, contagem, "9999")).toEqual({
         comRelatorio: ["2853", "9999"],
         semRelatorio: ["2854", "2855", "2856"],
      });
   });

   it("sem duplicatas: aeronave da frota com relatório e ativa ao mesmo tempo", () => {
      const contagem = { "2853": 3 };
      expect(separarFrota(frota, contagem, "2853")).toEqual({
         comRelatorio: ["2853"],
         semRelatorio: ["2854", "2855", "2856"],
      });
   });

   it("anvAtiva já presente em comRelatorio por já ter contagem fora da frota: sem duplicar", () => {
      const contagem = { "2999": 2 };
      expect(separarFrota(frota, contagem, "2999")).toEqual({
         comRelatorio: ["2999"],
         semRelatorio: ["2853", "2854", "2855", "2856"],
      });
   });

   it("chave de contagem fora da frota com valor 0 não entra em comRelatorio", () => {
      const contagem = { "2853": 1, "2999": 0 };
      expect(separarFrota(frota, contagem, undefined)).toEqual({
         comRelatorio: ["2853"],
         semRelatorio: ["2854", "2855", "2856"],
      });
   });

   it("contagem undefined com anvAtiva fora da frota: entra no fim de comRelatorio", () => {
      expect(separarFrota(frota, undefined, "9999")).toEqual({
         comRelatorio: ["2853", "2854", "2855", "2856", "9999"],
         semRelatorio: [],
      });
   });

   it("contagem undefined com anvAtiva já na frota: sem duplicar nem mudar a ordem", () => {
      expect(separarFrota(frota, undefined, "2854")).toEqual({
         comRelatorio: ["2853", "2854", "2855", "2856"],
         semRelatorio: [],
      });
   });
});
