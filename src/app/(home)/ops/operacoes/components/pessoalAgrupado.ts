import { daysInclusive } from "@/../utils/dateHandler";
import { CIRCULO_LABELS } from "@/constants/militar/circulos";
import { compareByAntiguidade } from "@/../utils/sortByAntiguidade";
import {
   compareValues,
   type SortDirection,
} from "@/components/ui/SortableTable";
import type { OperacaoPessoalOut } from "services/routes/ops/operacoes";

/**
 * Um militar na operação, com todos os seus períodos.
 *
 * O mesmo militar pode ter mais de um vínculo na mesma operação: sai no meio e
 * volta depois, às vezes em outra função ou situação (quem foi Tripulante na
 * primeira fase pode voltar como Apoio). Por isso `func` e `sit` pertencem ao
 * período, não ao militar.
 *
 * A lista do modal é uma linha por período — é lá que se confere lançamento de
 * diária, e um vínculo escondido atrás de um expansor não se confere. Este
 * agrupamento serve ao que continua sendo por militar: a barra de presença (que
 * desenha todos os períodos sobre a mesma régua), a contagem de efetivo e o
 * total de dias da pessoa.
 */
export interface MilitarAgrupado {
   userId: number;
   user: OperacaoPessoalOut["user"];
   periodos: OperacaoPessoalOut[];
   /** Soma dos dias de todos os períodos. */
   diasTotal: number;
}

/** Agrupa os vínculos por militar, preservando a ordem de chegada do backend. */
export function agruparPessoal(lista: OperacaoPessoalOut[]): MilitarAgrupado[] {
   const porUser = new Map<number, MilitarAgrupado>();

   for (const p of lista) {
      const atual = porUser.get(p.user.id);
      if (atual) {
         atual.periodos.push(p);
         atual.diasTotal += p.dias;
      } else {
         porUser.set(p.user.id, {
            userId: p.user.id,
            user: p.user,
            periodos: [p],
            diasTotal: p.dias,
         });
      }
   }

   // Períodos de um mesmo militar em ordem cronológica: a barra de presença os
   // desenha na sequência, e fora de ordem a leitura fica truncada.
   for (const m of porUser.values()) {
      m.periodos.sort((a, b) => a.data_ingresso.localeCompare(b.data_ingresso));
   }

   return Array.from(porUser.values());
}

/**
 * Dias em que o militar esteve fora, entre dois períodos seus.
 *
 * É o dado que só existe no vão: com dois períodos, "13 dias" não conta que ele
 * saiu no meio, e a barra desenha a ausência sem nomeá-la. O backend recusa
 * períodos sobrepostos (409), então a sequência ordenada não tem intervalo
 * negativo — mas períodos coladas (regresso num dia, ingresso no seguinte) dão
 * zero, e zero não é ausência.
 */
export function diasFora(periodos: OperacaoPessoalOut[]): number[] {
   const vaos: number[] = [];
   for (let i = 1; i < periodos.length; i++) {
      const fimAnterior = periodos[i - 1].data_regresso;
      const inicioAtual = periodos[i].data_ingresso;
      // `daysInclusive` conta as duas pontas; entre 22/05 e 26/05 ele devolve
      // 5, e os dias realmente fora são os 3 do meio — daí o -2.
      const bruto = daysInclusive(fimAnterior, inicioAtual);
      const fora = bruto == null ? 0 : bruto - 2;
      if (fora > 0) vaos.push(fora);
   }
   return vaos;
}

/** Quantos militares do efetivo há em cada círculo hierárquico. */
export interface ContagemCirculo {
   circulo: string;
   label: string;
   total: number;
}

/**
 * Conta o efetivo por círculo hierárquico, do mais antigo ao mais moderno.
 *
 * Conta MILITARES, não vínculos: quem tem dois períodos na operação é uma
 * pessoa só. A ordem vem das chaves de `CIRCULO_LABELS`, que já estão em
 * ordem hierárquica — alfabética misturaria general com praça.
 *
 * Círculo ausente ou desconhecido no catálogo é ignorado em silêncio: é resumo
 * de cabeçalho, e um rótulo "undefined" ali diria menos que a sua ausência.
 */
export function contarPorCirculo(
   militares: MilitarAgrupado[]
): ContagemCirculo[] {
   const contagem = new Map<string, number>();
   for (const m of militares) {
      const circulo = m.user.posto?.circulo;
      if (!circulo) continue;
      contagem.set(circulo, (contagem.get(circulo) ?? 0) + 1);
   }

   return Object.keys(CIRCULO_LABELS)
      .filter((c) => contagem.has(c))
      .map((c) => ({
         circulo: c,
         label: CIRCULO_LABELS[c],
         total: contagem.get(c) ?? 0,
      }));
}

/** Uma linha da lista de efetivo: o período, mais o militar a que pertence. */
export interface LinhaPeriodo {
   periodo: OperacaoPessoalOut;
   militar: MilitarAgrupado;
   /** Posição deste período entre os do mesmo militar (1-based). */
   ordem: number;
   total: number;
}

/**
 * Numera os períodos que sobreviveram ao filtro, por militar.
 *
 * `ordem` e `total` contam o RECORTE, e não o grupo inteiro, porque é
 * `ordem === 1` que manda a linha desenhar o nome e a barra de presença. Com o
 * índice absoluto, um filtro que matasse o primeiro vínculo deixava a única
 * linha visível com `ordem === 2`: ela lia como continuação de uma linha que
 * não existe — sem nome visível e sem barra.
 *
 * Recebe os pares já filtrados; quem filtra é o componente, que é quem conhece
 * os controles da tela.
 */
export function numerarPorMilitar(
   pares: { periodo: OperacaoPessoalOut; militar: MilitarAgrupado }[]
): LinhaPeriodo[] {
   const total = new Map<number, number>();
   for (const { militar } of pares) {
      total.set(militar.userId, (total.get(militar.userId) ?? 0) + 1);
   }

   const vistos = new Map<number, number>();
   return pares.map((par) => {
      const ordem = (vistos.get(par.militar.userId) ?? 0) + 1;
      vistos.set(par.militar.userId, ordem);
      return { ...par, ordem, total: total.get(par.militar.userId) ?? 1 };
   });
}

/** Colunas por onde a lista de efetivo pode ser ordenada. */
export type SortKey = "militar" | "periodo" | "func" | "sit" | "dias";

/**
 * Compara duas linhas da lista de efetivo.
 *
 * A regra que sustenta a lista inteira: **os períodos de um militar nunca se
 * intercalam**. Por isso a chave compara sempre o MILITAR, não o período —
 * ordenar por "Dias" comparando períodos jogaria o segundo vínculo de alguém
 * para o meio de outra pessoa, e a linha sem nome (que lê como continuação da
 * de cima) passaria a continuar o militar errado.
 *
 * Mora aqui, e não no componente, porque é essa invariante — e não o desenho da
 * tabela — que um edit futuro tem mais chance de quebrar sem perceber.
 */
export function compararLinhas(
   a: LinhaPeriodo,
   b: LinhaPeriodo,
   key: SortKey,
   dir: SortDirection
): number {
   let cmp = 0;
   switch (key) {
      case "militar":
         // A antiguidade já é a ordem "natural" (do mais antigo ao mais
         // moderno), então `asc` a preserva em vez de invertê-la.
         cmp = compareByAntiguidade(a.militar.user, b.militar.user);
         cmp = dir === "asc" ? cmp : -cmp;
         break;
      case "dias":
         cmp = compareValues(a.militar.diasTotal, b.militar.diasTotal, dir);
         break;
      case "periodo":
         cmp = compareValues(
            a.militar.periodos[0].data_ingresso,
            b.militar.periodos[0].data_ingresso,
            dir
         );
         break;
      case "func":
         cmp = compareValues(a.periodo.func, b.periodo.func, dir);
         break;
      case "sit":
         cmp = compareValues(a.periodo.sit, b.periodo.sit, dir);
         break;
   }
   if (cmp !== 0) return cmp;
   // Mesmo militar: cronológico, nunca invertido.
   if (a.militar.userId === b.militar.userId) return a.ordem - b.ordem;
   return compareByAntiguidade(a.militar.user, b.militar.user);
}

export interface FaixaPresenca {
   /** Início da faixa, em % da largura do período da operação. */
   leftPct: number;
   /** Largura da faixa, em %. */
   widthPct: number;
   label: string;
}

/**
 * Converte os períodos de um militar em faixas posicionadas dentro do período
 * da operação — é o que transforma duas datas soltas em "esteve do início ao
 * fim" ou "chegou na segunda quinzena".
 *
 * Um período que extrapola a operação (ingresso antes do início, ou regresso
 * depois do fim) é recortado nas bordas: a régua é a operação, e uma faixa
 * saindo da caixa leria como erro de layout.
 */
export function faixasPresenca(
   periodos: OperacaoPessoalOut[],
   opInicio: string,
   opFim: string
): FaixaPresenca[] {
   const total = daysInclusive(opInicio, opFim);
   if (!total || total <= 0) return [];

   return periodos.map((p) => {
      const offset = daysInclusive(opInicio, p.data_ingresso);
      const dur = daysInclusive(p.data_ingresso, p.data_regresso);

      // `daysInclusive` conta o próprio dia, então um período que começa no
      // primeiro dia da operação tem offset 1 — daí o -1.
      const inicio = Math.max(0, (offset ?? 1) - 1);
      const duracao = Math.max(1, dur ?? 1);

      const leftPct = Math.min(100, (inicio / total) * 100);
      const widthPct = Math.min(100 - leftPct, (duracao / total) * 100);

      return {
         leftPct,
         widthPct: Math.max(widthPct, 1.5), // um dia isolado precisa ser visível
         label: `${p.data_ingresso} a ${p.data_regresso}`,
      };
   });
}
