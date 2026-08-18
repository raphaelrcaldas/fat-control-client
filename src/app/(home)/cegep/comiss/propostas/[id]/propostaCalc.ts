import type { ComissSummaryStats } from "services/routes/cegep/comiss";
import type { PropostaLinha } from "services/routes/cegep/propostas";

/**
 * Helpers puros do sandbox de propostas.
 *
 * Duas regras governam este arquivo:
 * 1. **Dinheiro soma em centavos inteiros.** Os valores viajam em reais (float,
 *    como `Comiss.valor_aj_ab`), mas toda acumulação acontece em centavos para
 *    não herdar erro binário — a comparação com o teto depende disso.
 * 2. **O exercício é o dado**, não uma data: a linha guarda `ano_ab`/`ano_fc`
 *    direto. Enquanto era data ISO, extrair o ano exigia `isoStrToDate` (o
 *    parser nativo trata naive como UTC e, em 31/12, muda o ano fiscal).
 */

const toCents = (reais: number): number =>
   Math.round((Number(reais) || 0) * 100);

const toReais = (cents: number): number => cents / 100;

/** Valor de uma perna (base × quantidade) já em centavos inteiros. */
export const pernaEmCents = (base: number, qtd: number): number =>
   Math.round(toCents(base) * (Number(qtd) || 0));

export interface ImpactoFY {
   aberturas: number;
   fechamentos: number;
   total: number;
}

const IMPACTO_ZERO: ImpactoFY = { aberturas: 0, fechamentos: 0, total: 0 };

/** Exercícios que a linha toca: o da abertura e o do fechamento. */
export function anosImpactados(l: PropostaLinha): {
   anoAb: number | null;
   anoFc: number | null;
} {
   return { anoAb: l.ano_ab || null, anoFc: l.ano_fc || null };
}

/** Parcela da linha que recai sobre um exercício fiscal específico. */
export function calcImpactoLinhaFY(l: PropostaLinha, ano: number): number {
   const { anoAb, anoFc } = anosImpactados(l);
   return toReais(
      (anoAb === ano ? pernaEmCents(l.base_ab, l.qtd_ab) : 0) +
         (anoFc === ano ? pernaEmCents(l.base_fc, l.qtd_fc) : 0)
   );
}

/** Impacto do cenário no exercício, separado por abertura e fechamento. */
export function calcImpactoCenario(
   linhas: readonly PropostaLinha[],
   ano: number
): ImpactoFY {
   if (!linhas.length) return IMPACTO_ZERO;

   let aberturasCents = 0;
   let fechamentosCents = 0;

   for (const l of linhas) {
      const { anoAb, anoFc } = anosImpactados(l);
      if (anoAb === ano) aberturasCents += pernaEmCents(l.base_ab, l.qtd_ab);
      if (anoFc === ano) fechamentosCents += pernaEmCents(l.base_fc, l.qtd_fc);
   }

   return {
      aberturas: toReais(aberturasCents),
      fechamentos: toReais(fechamentosCents),
      total: toReais(aberturasCents + fechamentosCents),
   };
}

export interface PlanoStats {
   orcamento: number;
   pago: number;
   previsto: number;
   rascunho: number;
   projetado: number;
   disponivel: number;
   excedeTeto: boolean;
   /** Sem teto cadastrado no exercício — a tela não divide por zero nem acusa excesso. */
   semTeto: boolean;
   /** Percentual do teto já projetado (0 quando não há teto). */
   pctProjetado: number;
}

/**
 * Combina o consolidado real do exercício (pago + previsto, do
 * `/comiss/summary`) com o impacto do rascunho, contra o teto orçamentário.
 */
export function combinarComTeto(
   stats: ComissSummaryStats | undefined,
   rascunho: number
): PlanoStats {
   const orcamentoCents = toCents(stats?.orcamento ?? 0);
   const pagoCents = toCents(stats?.soma ?? 0);
   const previstoCents = toCents(stats?.previsao ?? 0);
   const rascunhoCents = toCents(rascunho);
   const projetadoCents = pagoCents + previstoCents + rascunhoCents;
   const semTeto = orcamentoCents <= 0;

   return {
      orcamento: toReais(orcamentoCents),
      pago: toReais(pagoCents),
      previsto: toReais(previstoCents),
      rascunho: toReais(rascunhoCents),
      projetado: toReais(projetadoCents),
      disponivel: toReais(orcamentoCents - projetadoCents),
      excedeTeto: !semTeto && projetadoCents > orcamentoCents,
      semTeto,
      pctProjetado: semTeto
         ? 0
         : Math.round((projetadoCents / orcamentoCents) * 100),
   };
}

/** Código posicional do cenário: 0 → "A", 1 → "B"… 26 → "A1". */
export function cenarioCodigo(index: number): string {
   if (index < 0) return "?";
   const letra = String.fromCharCode(65 + (index % 26));
   const ciclo = Math.floor(index / 26);
   return ciclo === 0 ? letra : `${letra}${ciclo}`;
}
