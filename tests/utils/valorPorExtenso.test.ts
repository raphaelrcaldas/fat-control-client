import { describe, expect, it } from "vitest";
import {
   formatarValorEmReais,
   valorEmReaisPorExtenso,
} from "utils/valorPorExtenso";

describe("valorEmReaisPorExtenso", () => {
   it("escreve reais e centavos sem imprecisão de ponto flutuante", () => {
      expect(valorEmReaisPorExtenso("1281.30")).toBe(
         "mil, duzentos e oitenta e um reais e trinta centavos"
      );
      expect(formatarValorEmReais("1281.30")).toBe("R$ 1.281,30");
   });

   it("trata zero, singulares e centenas exatas", () => {
      expect(valorEmReaisPorExtenso("0.00")).toBe("zero reais");
      expect(valorEmReaisPorExtenso("1.01")).toBe("um real e um centavo");
      expect(valorEmReaisPorExtenso("100.00")).toBe("cem reais");
      expect(valorEmReaisPorExtenso("101.00")).toBe("cento e um reais");
      expect(valorEmReaisPorExtenso("1000.00")).toBe("mil reais");
   });

   it("exige 'de' antes da moeda nas escalas redondas", () => {
      // "um milhão reais" é agramatical: milhão é substantivo e rege a
      // preposição. Mil não rege, então "mil reais" continua certo.
      expect(valorEmReaisPorExtenso("1000000.00")).toBe("um milhão de reais");
      expect(valorEmReaisPorExtenso("2000000.00")).toBe(
         "dois milhões de reais"
      );
      expect(valorEmReaisPorExtenso("1000000000.00")).toBe(
         "um bilhão de reais"
      );
      expect(valorEmReaisPorExtenso("1000.00")).toBe("mil reais");
      // Com resto, quem rege a moeda é o último grupo, não a escala.
      expect(valorEmReaisPorExtenso("1000050.00")).toBe(
         "um milhão e cinquenta reais"
      );
   });

   it("liga o último grupo com 'e' quando ele é centena redonda", () => {
      // "mil, cem reais" soa como enumeração; a conjunção é obrigatória.
      expect(valorEmReaisPorExtenso("1100.00")).toBe("mil e cem reais");
      expect(valorEmReaisPorExtenso("1200.00")).toBe("mil e duzentos reais");
      // Já com resto na centena o "e" aparece dentro do grupo, e repeti-lo
      // fora daria "mil e cento e quinze" — aqui a vírgula é o certo.
      expect(valorEmReaisPorExtenso("1115.00")).toBe(
         "mil, cento e quinze reais"
      );
   });

   it("recusa entrada malformada em vez de inventar valor", () => {
      // Dinheiro que não dá para ler não vira "zero reais" num documento de
      // pagamento: lança e o chamador mostra o erro. Negativo entra aqui de
      // propósito — GLE não tem valor a menor.
      for (const ruim of ["", ".50", "1.", "1e3", "-5.00", "abc", "1 281.30"]) {
         expect(() => valorEmReaisPorExtenso(ruim)).toThrow(/inválido/);
      }
   });

   it("aceita vírgula decimal além do ponto", () => {
      expect(valorEmReaisPorExtenso("1281,30")).toBe(
         "mil, duzentos e oitenta e um reais e trinta centavos"
      );
   });

   it("combina o 'de' da escala com os centavos", () => {
      // A interação mais sutil: o "de" da escala redonda convive com o "e"
      // dos centavos, e o resto em milhares não pode disparar o "de".
      expect(valorEmReaisPorExtenso("1000000.01")).toBe(
         "um milhão de reais e um centavo"
      );
      expect(valorEmReaisPorExtenso("1100000.00")).toBe(
         "um milhão e cem mil reais"
      );
   });

   it("arredonda a string decimal em centavos antes de escrevê-la", () => {
      expect(valorEmReaisPorExtenso("1.005")).toBe("um real e um centavo");
      expect(formatarValorEmReais("9,999")).toBe("R$ 10,00");
   });
});
