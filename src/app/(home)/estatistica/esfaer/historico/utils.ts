/**
 * Funções puras da view "Histórico de Esforço Aéreo" (derivação de grupos,
 * escala temporal do Apex, cores por programa, carry-forward e metadados de
 * transição). Os hooks em `hooks/` apenas memoizam o que está aqui.
 */

import { getGroupPalette, KNOWN_GRUPOS } from "./constants";
import type {
   EsfAerHistorico,
   HistPoint,
   HistPrograma,
} from "services/routes/estatistica/esfAer";

/**
 * Deriva a lista de grupos A PARTIR DOS DADOS (não de allowlist): grupos
 * conhecidos primeiro, na ordem canônica (`KNOWN_GRUPOS`, apenas os presentes),
 * seguidos dos desconhecidos na ordem de aparição. Determinística para uma
 * mesma resposta do backend.
 */
export function deriveGrupos(programas: HistPrograma[]): string[] {
   const presentes = new Set(programas.map((p) => p.grupo));
   const conhecidos = KNOWN_GRUPOS.filter((g) => presentes.has(g));

   const desconhecidos: string[] = [];
   for (const p of programas) {
      if (!KNOWN_GRUPOS.includes(p.grupo) && !desconhecidos.includes(p.grupo)) {
         desconhecidos.push(p.grupo);
      }
   }

   return [...conhecidos, ...desconhecidos];
}

/** Epoch em ms (UTC) de uma data ISO "YYYY-MM-DD" — escala do eixo X do Apex. */
export function epochOf(data: string): number {
   return Date.parse(`${data}T00:00:00Z`);
}

/** Ponto de dados do ApexCharts: x = epoch (ms, UTC), y = alocado (minutos). */
export interface ApexPoint {
   x: number;
   y: number;
}

export interface ApexSeries {
   name: string;
   data: ApexPoint[];
}

/**
 * Converte uma timeline em pontos do Apex, estendendo o último `y` (segmento
 * horizontal) até `endData` — a data da ÚLTIMA ATUALIZAÇÃO do ano, não 31/dez.
 * Só acrescenta o ponto sintético se `endData` for depois do último ponto real
 * (a série que teve a última mudança já termina lá). Timeline vazia → `[]`.
 */
export function toApexData(
   timeline: HistPoint[],
   endData: string
): ApexPoint[] {
   if (timeline.length === 0) return [];
   const data = timeline.map((p) => ({ x: epochOf(p.data), y: p.alocado }));
   const last = timeline[timeline.length - 1];
   if (epochOf(endData) > epochOf(last.data)) {
      data.push({ x: epochOf(endData), y: last.alocado });
   }
   return data;
}

/**
 * Último Δ de uma timeline, em MINUTOS (timeline vazia → 0).
 *
 * NÃO zere o primeiro ponto: o backend calcula `delta` contra o valor vigente
 * ANTES da primeira mudança (`_to_hist_points`, com `valor_inicial`), que não é
 * zero. Tratar "1 ponto" como criação a partir do nada apagaria uma variação
 * real — e fazia o rail e a leitura do gráfico mostrarem números diferentes
 * para a MESMA série.
 */
export function ultimoDelta(timeline: HistPoint[]): number {
   return timeline.length > 0 ? timeline[timeline.length - 1].delta : 0;
}

/**
 * Data ISO do fim do domínio: a ÚLTIMA data de mudança conhecida no ano,
 * tomada como o máximo entre o último ponto do Total e o último ponto de
 * qualquer programa.
 *
 * Não basta olhar o Total: quando `total.timeline` vem vazio (ou defasado) e
 * há programas com pontos, usar só o Total colapsa o domínio no 1º de janeiro
 * — e as séries dos programas ficam FORA do eixo, com o gráfico renderizando
 * área vazia sem nenhuma mensagem (`hasSeries` é true, então o empty-state do
 * chart também não aparece). Comparação lexicográfica: "YYYY-MM-DD" ordena
 * como string.
 */
export function deriveEndData(historico: EsfAerHistorico): string {
   let ultima = "";

   const totalTl = historico.total.timeline;
   if (totalTl.length > 0) ultima = totalTl[totalTl.length - 1].data;

   for (const p of historico.programas) {
      const tl = p.timeline;
      if (tl.length === 0) continue;
      const fim = tl[tl.length - 1].data;
      if (fim > ultima) ultima = fim;
   }

   return ultima || `${historico.ano_ref}-01-01`;
}

/**
 * Mapeia cada programa a uma cor da paleta do seu grupo, pela ordem de aparição
 * dentro do grupo. Derivado da lista COMPLETA (não da filtrada por visibilidade)
 * para a cor de um programa não mudar quando outros são ocultados.
 */
export function buildProgramColors(
   programas: HistPrograma[]
): Map<number, string> {
   const byId = new Map<number, string>();
   const counters: Record<string, number> = {};
   for (const p of programas) {
      const palette = getGroupPalette(p.grupo);
      const idx = counters[p.grupo] ?? 0;
      counters[p.grupo] = idx + 1;
      byId.set(p.esfaer_id, palette[idx % palette.length]);
   }
   return byId;
}

/**
 * Valor vigente de um programa numa data: o último `alocado` cujo ponto tem
 * `data <= alvo`, ou 0 se o programa ainda não existia naquela data.
 */
function vigenteEm(programa: HistPrograma, alvo: string): number {
   let valor = 0;
   for (const ponto of programa.timeline) {
      if (ponto.data <= alvo) valor = ponto.alocado;
      else break; // timeline já está em ordem ascendente
   }
   return valor;
}

/**
 * Soma carry-forward de todos os programas: une as datas de mudança (asc) e, em
 * cada data, soma o valor vigente de cada programa; o `delta` é a variação do
 * total entre pontos consecutivos (primeiro ponto: delta = alocado).
 */
export function carryForwardSum(programas: HistPrograma[]): HistPoint[] {
   const datas = Array.from(
      new Set(programas.flatMap((p) => p.timeline.map((ponto) => ponto.data)))
   ).sort();

   let anterior = 0;
   return datas.map((data, i) => {
      const alocado = programas.reduce((acc, p) => acc + vigenteEm(p, data), 0);
      const delta = i === 0 ? alocado : alocado - anterior;
      anterior = alocado;
      return { data, alocado, delta };
   });
}

/**
 * Metadados de uma transição da timeline, usados pelo tooltip do gráfico e pelo
 * changelog. Cada item alinha 1:1 com um ponto do array de dados do Apex
 * (inclusive o ponto sintético final em `endData` — ver `carry`).
 */
export interface ChangeMeta {
   /** Alocado vigente antes deste ponto (`to - delta`), em MINUTOS. */
   from: number;
   /** Alocado vigente neste ponto, em MINUTOS. */
   to: number;
   /** Variação `to - from`, em MINUTOS. */
   delta: number;
   /** Primeiro ponto E partindo do zero — criação de fato. */
   criacao: boolean;
   /** Ponto sintético "vigente · sem mudança" até a última atualização. */
   carry: boolean;
   /** Data ISO "YYYY-MM-DD" (última atualização do ano no ponto `carry`). */
   data: string;
}

/**
 * Constrói os metadados de transição de uma timeline.
 *
 * Para cada ponto: `delta` é o do backend, `from = to - delta` e `criacao` só
 * quando o primeiro ponto de fato partiu de zero. Ao final acrescenta
 * UM ponto sintético `carry` (sem mudança, `to` = último alocado) com data em
 * `endData` — a última atualização do ano —, espelhando o degrau que o gráfico
 * estende até lá. Só adiciona o carry se `endData` for depois do último ponto
 * real (lockstep com `toApexData`). Timeline vazia → `[]`.
 */
export function buildChangeMeta(
   timeline: HistPoint[],
   endData: string
): ChangeMeta[] {
   if (timeline.length === 0) return [];

   const meta: ChangeMeta[] = timeline.map((ponto, i) => {
      // `delta` vem do backend e já é medido contra o valor anterior à
      // primeira mudança — recomputá-lo com `from = 0` inflava o primeiro
      // ponto (um programa que foi de 100h para 120h aparecia como
      // "criação · 00:00 → 120:00", contra o "+20:00" que o rail mostrava).
      const from = ponto.alocado - ponto.delta;
      return {
         from,
         to: ponto.alocado,
         delta: ponto.delta,
         // Só é criação se o valor realmente partiu do zero.
         criacao: i === 0 && from === 0,
         carry: false,
         data: ponto.data,
      };
   });

   const last = timeline[timeline.length - 1];
   if (epochOf(endData) > epochOf(last.data)) {
      meta.push({
         from: last.alocado,
         to: last.alocado,
         delta: 0,
         criacao: false,
         carry: true,
         data: endData,
      });
   }

   return meta;
}
