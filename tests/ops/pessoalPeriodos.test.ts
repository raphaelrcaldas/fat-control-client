import { describe, expect, it } from "vitest";
import {
   agruparPessoal,
   compararLinhas,
   contarPorCirculo,
   diasFora,
   faixasPresenca,
   type LinhaPeriodo,
   numerarPorMilitar,
} from "@/app/(home)/ops/operacoes/components/pessoalAgrupado";
import type { OperacaoPessoalOut } from "services/routes/ops/operacoes";

// Só os campos que o agrupamento e a ordenação leem; `UserPublic` traz muitos
// outros que não participam do cálculo de períodos.
const user = (id: number, ant = 10, circulo?: string) =>
   ({
      id,
      p_g: "2S",
      nome_guerra: `M${id}`,
      nome: `MILITAR ${id}`,
      posto: { ant, circulo },
      ult_promo: "2020-01-01",
      ant_rel: id,
   }) as unknown as OperacaoPessoalOut["user"];

function periodo(
   id: number,
   userId: number,
   ingresso: string,
   regresso: string,
   dias: number,
   ant = 10
): OperacaoPessoalOut {
   return {
      id,
      user: user(userId, ant),
      func: "Tripulante",
      sit: "d",
      data_ingresso: ingresso,
      data_regresso: regresso,
      dias,
   };
}

describe("agruparPessoal", () => {
   it("junta os vínculos do mesmo militar e soma os dias", () => {
      const grupos = agruparPessoal([
         periodo(1, 10, "2026-05-09", "2026-05-16", 8),
         periodo(2, 20, "2026-05-10", "2026-05-12", 3),
         periodo(3, 10, "2026-05-20", "2026-05-24", 5),
      ]);

      expect(grupos).toHaveLength(2);
      const [primeiro] = grupos;
      expect(primeiro.userId).toBe(10);
      expect(primeiro.periodos).toHaveLength(2);
      expect(primeiro.diasTotal).toBe(13);
   });

   it("ordena os períodos por ingresso, mesmo fora de ordem na origem", () => {
      const [m] = agruparPessoal([
         periodo(1, 10, "2026-05-20", "2026-05-24", 5),
         periodo(2, 10, "2026-05-09", "2026-05-16", 8),
      ]);

      expect(m.periodos.map((p) => p.data_ingresso)).toEqual([
         "2026-05-09",
         "2026-05-20",
      ]);
   });
});

describe("diasFora", () => {
   it("conta só os dias do vão, sem as pontas dos períodos", () => {
      // Sai em 22/05, volta em 26/05: fora nos dias 23, 24 e 25.
      expect(
         diasFora([
            periodo(1, 10, "2026-05-15", "2026-05-22", 8),
            periodo(2, 10, "2026-05-26", "2026-05-30", 5),
         ])
      ).toEqual([3]);
   });

   it("não reporta ausência entre períodos consecutivos", () => {
      // Regressa dia 22 e reingressa dia 23: não houve dia fora.
      expect(
         diasFora([
            periodo(1, 10, "2026-05-15", "2026-05-22", 8),
            periodo(2, 10, "2026-05-23", "2026-05-30", 8),
         ])
      ).toEqual([]);
   });

   it("é vazio para um único período", () => {
      expect(
         diasFora([periodo(1, 10, "2026-05-09", "2026-05-31", 23)])
      ).toEqual([]);
   });

   it("reporta um vão por intervalo quando há três períodos", () => {
      expect(
         diasFora([
            periodo(1, 10, "2026-05-01", "2026-05-05", 5),
            periodo(2, 10, "2026-05-10", "2026-05-12", 3),
            periodo(3, 10, "2026-05-20", "2026-05-22", 3),
         ])
      ).toEqual([4, 7]);
   });
});

describe("faixasPresenca", () => {
   it("cobre a régua inteira quando o período é a operação toda", () => {
      const [faixa] = faixasPresenca(
         [periodo(1, 10, "2026-05-09", "2026-05-31", 23)],
         "2026-05-09",
         "2026-05-31"
      );

      expect(faixa.leftPct).toBe(0);
      expect(Math.round(faixa.widthPct)).toBe(100);
   });

   it("recorta o período que extrapola as bordas da operação", () => {
      // Ingresso antes do início da operação: a faixa não pode sair da caixa.
      const [faixa] = faixasPresenca(
         [periodo(1, 10, "2026-05-01", "2026-06-10", 41)],
         "2026-05-09",
         "2026-05-31"
      );

      expect(faixa.leftPct).toBe(0);
      expect(faixa.leftPct + faixa.widthPct).toBeLessThanOrEqual(100);
   });

   it("mantém visível um período de um só dia", () => {
      const [faixa] = faixasPresenca(
         [periodo(1, 10, "2026-05-20", "2026-05-20", 1)],
         "2026-05-09",
         "2026-05-31"
      );

      expect(faixa.widthPct).toBeGreaterThanOrEqual(1.5);
   });

   it("desenha duas faixas separadas quando há dois períodos", () => {
      const faixas = faixasPresenca(
         [
            periodo(1, 10, "2026-05-09", "2026-05-15", 7),
            periodo(2, 10, "2026-05-25", "2026-05-31", 7),
         ],
         "2026-05-09",
         "2026-05-31"
      );

      expect(faixas).toHaveLength(2);
      // A segunda começa depois do fim da primeira — o vão é a ausência.
      expect(faixas[1].leftPct).toBeGreaterThan(
         faixas[0].leftPct + faixas[0].widthPct
      );
   });
});

describe("compararLinhas", () => {
   /** Monta as linhas como o modal monta: uma por período, agrupadas. */
   function linhas(lista: OperacaoPessoalOut[]): LinhaPeriodo[] {
      return agruparPessoal(lista).flatMap((m) =>
         m.periodos.map((p, i) => ({
            periodo: p,
            militar: m,
            ordem: i + 1,
            total: m.periodos.length,
         }))
      );
   }

   /*
    * Os dados precisam ser capazes de intercalar, senão o teste passa mesmo
    * com a regra quebrada (verificado sabotando o comparador).
    *
    * Militar 10 tem dois períodos de tamanhos MUITO diferentes (2 e 20 dias);
    * militar 20 tem um de tamanho intermediário (9). Comparando por período
    * — o erro — a ordem por dias fica 2(m10), 9(m20), 20(m10): o vínculo de
    * 20 no meio dos dois de 10. Comparando pelo militar, os dois de 10 ficam
    * juntos porque a chave é o total dele (22), igual nas duas linhas.
    */
   const lista = [
      periodo(1, 10, "2026-05-01", "2026-05-02", 2, 5),
      periodo(2, 10, "2026-05-10", "2026-05-29", 20, 5),
      periodo(3, 20, "2026-05-03", "2026-05-11", 9, 9),
   ];

   it("mantém os períodos de um militar contíguos ao ordenar por dias", () => {
      for (const direction of ["asc", "desc"] as const) {
         const ordenadas = linhas(lista).sort((a, b) =>
            compararLinhas(a, b, "dias", direction)
         );
         const ids = ordenadas.map((l) => l.militar.userId);
         // Cada militar aparece num bloco só: nenhum id reaparece depois de
         // outro ter surgido no meio.
         const blocos = ids.filter((id, i) => id !== ids[i - 1]);
         expect(new Set(blocos).size).toBe(blocos.length);
      }
   });

   it("nunca inverte a ordem cronológica dentro do mesmo militar", () => {
      const ordenadas = linhas(lista).sort((a, b) =>
         compararLinhas(a, b, "dias", "desc")
      );
      const doMilitar = ordenadas.filter((l) => l.militar.userId === 10);
      expect(doMilitar.map((l) => l.ordem)).toEqual([1, 2]);
   });

   it("ordena por antiguidade do mais antigo ao mais moderno em asc", () => {
      const ordenadas = linhas(lista).sort((a, b) =>
         compararLinhas(a, b, "militar", "asc")
      );
      // ant 5 (militar 10) é mais antigo que ant 9 (militar 20).
      expect(ordenadas[0].militar.userId).toBe(10);
      expect(ordenadas[ordenadas.length - 1].militar.userId).toBe(20);
   });

   it("inverte a antiguidade em desc", () => {
      const ordenadas = linhas(lista).sort((a, b) =>
         compararLinhas(a, b, "militar", "desc")
      );
      expect(ordenadas[0].militar.userId).toBe(20);
   });

   it("mantém os períodos contíguos ao ordenar por período", () => {
      // Mesmo risco de intercalar que em "dias": os ingressos são 01/05 (m10),
      // 03/05 (m20) e 10/05 (m10). Comparando o período da LINHA, o vínculo do
      // militar 20 cai entre os dois do militar 10; comparando o primeiro
      // período do MILITAR, os dois de 10 ficam juntos.
      for (const direction of ["asc", "desc"] as const) {
         const ordenadas = linhas(lista).sort((a, b) =>
            compararLinhas(a, b, "periodo", direction)
         );
         const ids = ordenadas.map((l) => l.militar.userId);
         const blocos = ids.filter((id, i) => id !== ids[i - 1]);
         expect(new Set(blocos).size).toBe(blocos.length);
      }
   });

   it("desempata pela ordem quando a chave e a antiguidade empatam", () => {
      // Dois períodos do mesmo militar, mesma função: a chave "func" empata e
      // a antiguidade também (é a mesma pessoa), então só o desempate por
      // `ordem` decide.
      //
      // A entrada é dada INVERTIDA de propósito: o `sort` do V8 é estável e
      // preservaria a ordem de entrada sozinho, mascarando a falta do
      // desempate. Entrando fora de ordem, só o comparador pode consertar.
      const m = agruparPessoal([
         periodo(1, 10, "2026-05-01", "2026-05-02", 2, 5),
         periodo(2, 10, "2026-05-10", "2026-05-29", 20, 5),
      ])[0];
      const invertidas: LinhaPeriodo[] = [
         { periodo: m.periodos[1], militar: m, ordem: 2, total: 2 },
         { periodo: m.periodos[0], militar: m, ordem: 1, total: 2 },
      ];

      const ordenadas = invertidas.sort((a, b) =>
         compararLinhas(a, b, "func", "asc")
      );
      expect(ordenadas.map((l) => l.periodo.id)).toEqual([1, 2]);
   });
});

describe("numerarPorMilitar", () => {
   it("numera pelo recorte: filtro que mata o 1º vínculo não deixa órfã", () => {
      // Militar com dois períodos; o filtro (já aplicado pelo componente) só
      // deixou passar o SEGUNDO. Ele é a única linha visível, então precisa
      // ser a primeira — é `ordem === 1` que desenha nome e barra.
      const m = agruparPessoal([
         periodo(1, 10, "2026-05-01", "2026-05-05", 5),
         periodo(2, 10, "2026-05-20", "2026-05-25", 6),
      ])[0];

      const linhas = numerarPorMilitar([
         { periodo: m.periodos[1], militar: m },
      ]);

      expect(linhas[0].ordem).toBe(1);
      expect(linhas[0].total).toBe(1);
      expect(linhas[0].periodo.id).toBe(2);
   });

   it("mantém a sequência quando os dois períodos passam", () => {
      const m = agruparPessoal([
         periodo(1, 10, "2026-05-01", "2026-05-05", 5),
         periodo(2, 10, "2026-05-20", "2026-05-25", 6),
      ])[0];

      const linhas = numerarPorMilitar(
         m.periodos.map((p) => ({ periodo: p, militar: m }))
      );

      expect(linhas.map((l) => [l.ordem, l.total])).toEqual([
         [1, 2],
         [2, 2],
      ]);
   });

   it("conta cada militar separadamente", () => {
      const [a, b] = agruparPessoal([
         periodo(1, 10, "2026-05-01", "2026-05-05", 5),
         periodo(2, 10, "2026-05-20", "2026-05-25", 6),
         periodo(3, 20, "2026-05-03", "2026-05-11", 9, 9),
      ]);

      const linhas = numerarPorMilitar([
         { periodo: a.periodos[0], militar: a },
         { periodo: b.periodos[0], militar: b },
         { periodo: a.periodos[1], militar: a },
      ]);

      expect(linhas.map((l) => [l.militar.userId, l.ordem, l.total])).toEqual([
         [10, 1, 2],
         [20, 1, 1],
         [10, 2, 2],
      ]);
   });
});

describe("contarPorCirculo", () => {
   /** Militar com um período, num círculo dado. */
   const doCirculo = (id: number, circulo?: string) =>
      ({
         userId: id,
         user: user(id, 10, circulo),
         periodos: [],
         diasTotal: 0,
      }) as never;

   it("conta militares e ordena do mais antigo ao mais moderno", () => {
      // Entrada fora de ordem de propósito: a saída segue a hierarquia do
      // catálogo, não a ordem de chegada.
      const r = contarPorCirculo([
         doCirculo(1, "grad"),
         doCirculo(2, "of_sup"),
         doCirculo(3, "grad"),
         doCirculo(4, "of_int"),
      ]);

      expect(r.map((c) => [c.circulo, c.total])).toEqual([
         ["of_sup", 1],
         ["of_int", 1],
         ["grad", 2],
      ]);
   });

   it("omite círculo ausente em vez de criar uma faixa vazia", () => {
      const r = contarPorCirculo([doCirculo(1, "of_sup"), doCirculo(2)]);
      expect(r).toEqual([
         { circulo: "of_sup", label: "Of. Superior", total: 1 },
      ]);
   });

   it("conta pessoas, não vínculos", () => {
      const grupos = agruparPessoal([
         periodo(1, 10, "2026-05-01", "2026-05-05", 5),
         periodo(2, 10, "2026-05-20", "2026-05-25", 6),
      ]);
      // O mesmo militar, com dois períodos, conta uma vez só.
      const comCirculo = grupos.map((g) => ({
         ...g,
         user: user(g.userId, 10, "of_sup"),
      }));
      expect(contarPorCirculo(comCirculo)[0].total).toBe(1);
   });
});
