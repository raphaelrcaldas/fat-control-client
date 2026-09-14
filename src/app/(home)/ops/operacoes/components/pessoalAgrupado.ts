import { daysInclusive } from "@/../utils/dateHandler";
import type { OperacaoPessoalOut } from "services/routes/ops/operacoes";

/**
 * Um militar na operação, com todos os seus períodos.
 *
 * O mesmo militar pode ter mais de um vínculo na mesma operação: sai no meio e
 * volta depois, às vezes em outra função ou situação (quem foi Tripulante na
 * primeira fase pode voltar como Apoio). Por isso `func` e `sit` pertencem ao
 * período, não ao militar.
 *
 * O backend ainda não permite isso — `uq_operacao_pessoal_user` limita a um
 * registro por militar por operação —, então hoje todo grupo vem com um único
 * período. O agrupamento existe para que a tela não precise mudar quando a
 * restrição cair.
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
