import { CrewIndispList, IndispType } from "services/routes/indisps";
import {
   dateToDayMonth,
   isoStrToDate,
   MS_PER_DAY,
   startOfDay,
} from "utils/dateHandler";
import {
   DERIVED_BARS,
   getIndispOption,
} from "@/constants/ops/indisponibilidades";
import type { RestricaoDerivada } from "services/routes/ops/restricoes";

export interface IndispBar {
   key: string;
   /** Registro real; `null` nas faixas derivadas (CEMAL vencido, desadaptado). */
   indisp: IndispType | null;
   code: string;
   label: string;
   /** Classes de fundo/texto da faixa. */
   bar: string;
   locked: boolean;
   /** Efeito operacional das faixas derivadas; registros reais usam `null`. */
   effect: RestricaoDerivada["efeito"] | null;
   /** Data que o modal de detalhes abre (1º dia visível da faixa). */
   dateRef: Date;
   /** Coluna inicial (inclusiva) e final (exclusiva) já recortadas na janela. */
   from: number;
   to: number;
   /** O período começa/termina fora da janela — a faixa ganha seta e canto reto. */
   cutLeft: boolean;
   cutRight: boolean;
   lane: number;
   /** Período completo do registro, não o recorte visível. */
   range: string;
}

export interface IndispRowBars {
   bars: IndispBar[];
   /** Quantas pistas a linha precisa (períodos sobrepostos empilham). */
   lanes: number;
   /** Colunas livres — onde a vaga de "+" pode aparecer. */
   freeCols: number[];
}

/**
 * Distância em dias inteiros de `date` até a primeira coluna da janela.
 * `null` quando a data é inválida — sem isso um CEMAL malformado virava `NaN`,
 * toda comparação dava `false`, e o tripulante aparecia como se estivesse em
 * dia. Falhar em silêncio aqui é pior do que não desenhar nada.
 */
function colOf(date: Date, origin: Date): number | null {
   if (isNaN(date.getTime())) return null;
   return Math.round((startOfDay(date) - startOfDay(origin)) / MS_PER_DAY);
}

interface Span {
   key: string;
   indisp: IndispType | null;
   code: string;
   label: string;
   bar: string;
   locked: boolean;
   effect: RestricaoDerivada["efeito"] | null;
   range: string;
   /** Colunas absolutas, ainda sem recorte (podem ser negativas ou > N). */
   a: number;
   b: number;
}

function derivedSpan(
   restricao: RestricaoDerivada,
   origin: Date,
   n: number,
   tripKey: string
): Span | null {
   const meta = DERIVED_BARS[restricao.codigo];
   const inicio = restricao.inicio ? isoStrToDate(restricao.inicio) : null;
   const fim = restricao.fim ? isoStrToDate(restricao.fim) : null;
   const a = inicio ? colOf(inicio, origin) : -1;
   const fimCol = fim ? colOf(fim, origin) : n;
   if (a === null || fimCol === null) return null;
   const b = fim ? fimCol + 1 : n + 1;
   if (b <= 0 || a >= n) return null;

   const range =
      inicio && fim
         ? `${dateToDayMonth(inicio)} → ${dateToDayMonth(fim)}`
         : inicio
           ? `desde ${dateToDayMonth(inicio)}`
           : fim
             ? `até ${dateToDayMonth(fim)}`
             : "período aberto";

   return {
      key: `${tripKey}:${restricao.codigo}:${restricao.inicio ?? "aberto"}:${restricao.fim ?? "aberto"}`,
      indisp: null,
      code: meta.code,
      label: meta.label,
      bar: meta.bar,
      locked: true,
      effect: restricao.efeito,
      range,
      a,
      b,
   };
}

/**
 * Converte os registros de um tripulante em faixas posicionadas na janela.
 * A unidade deixa de ser o dia e passa a ser o PERÍODO: um afastamento de 8
 * dias é uma faixa só, rotulada uma vez.
 */
export function buildRowBars(
   tripData: CrewIndispList,
   dates: Date[]
): IndispRowBars {
   const n = dates.length;
   if (n === 0) return { bars: [], lanes: 1, freeCols: [] };

   const origin = dates[0];
   const spans: Span[] = [];

   tripData.indisps.forEach((indisp, i) => {
      if (indisp.deleted_at) return;
      const inicio = isoStrToDate(indisp.date_start);
      const fim = isoStrToDate(indisp.date_end);
      const a = colOf(inicio, origin);
      const b0 = colOf(fim, origin);
      if (a === null || b0 === null) return;
      const b = b0 + 1;
      if (b <= 0 || a >= n) return;

      // O backend pode passar a mandar um motivo que o catálogo ainda não
      // conhece: melhor desenhar neutro do que a faixa sumir em silêncio.
      const option = getIndispOption(indisp.mtv) ?? {
         label: indisp.mtv,
         bar: "bg-slate-100 text-slate-700",
         locked: false,
      };
      spans.push({
         key: `${tripData.trip.id}:${indisp.id ?? `novo-${i}`}`,
         indisp,
         code: indisp.mtv.toUpperCase(),
         label: option.label,
         bar: option.bar,
         locked: option.locked,
         effect: null,
         range: `${dateToDayMonth(inicio)} → ${dateToDayMonth(fim)}`,
         a,
         b,
      });
   });

   const tripKey = String(tripData.trip.id);
   tripData.restricoes_derivadas.forEach((restricao) => {
      const span = derivedSpan(restricao, origin, n, tripKey);
      if (span) spans.push(span);
   });

   // Empacotamento em pistas. Motivos primeiro (períodos sobrepostos empilham);
   // cada derivada preserva sua barra e reutiliza pistas sem sobreposição.
   const motivos = spans
      .filter((s) => s.indisp !== null)
      .sort((x, y) => x.a - y.a || x.b - y.b);
   const derivados = spans
      .filter((s) => s.indisp === null)
      .sort((x, y) => x.a - y.a || x.b - y.b);

   const fimDaPista: number[] = [];
   const spansPorPista: Span[][] = [];
   const ocupado = new Array<boolean>(n).fill(false);
   const bars: IndispBar[] = [];

   const emitir = (span: Span, lane: number) => {
      const from = Math.max(0, span.a);
      const to = Math.min(n, span.b);
      bars.push({
         key: span.key,
         indisp: span.indisp,
         code: span.code,
         label: span.label,
         bar: span.bar,
         locked: span.locked,
         effect: span.effect,
         dateRef: dates[from],
         from,
         to,
         cutLeft: span.a < 0,
         cutRight: span.b > n,
         lane,
         range: span.range,
      });
      return { from, to };
   };

   for (const span of motivos) {
      const from = Math.max(0, span.a);
      let lane = fimDaPista.findIndex((fim) => fim <= from);
      if (lane === -1) lane = fimDaPista.length;
      const { to } = emitir(span, lane);
      fimDaPista[lane] = to;
      (spansPorPista[lane] ??= []).push(span);
      // Só motivo ocupa coluna: CEMAL vencido não pode impedir o registro de
      // uma indisponibilidade nova naquele dia.
      for (let i = from; i < to; i++) ocupado[i] = true;
   }

   for (const span of derivados) {
      let lane = spansPorPista.findIndex((spansDaPista) =>
         spansDaPista.every(
            (existente) => span.b <= existente.a || span.a >= existente.b
         )
      );
      if (lane === -1) lane = spansPorPista.length;
      emitir(span, lane);
      (spansPorPista[lane] ??= []).push(span);
   }
   const lanes = Math.max(1, spansPorPista.length);

   const freeCols: number[] = [];
   for (let i = 0; i < n; i++) if (!ocupado[i]) freeCols.push(i);

   return { bars, lanes, freeCols };
}

/**
 * Separa os alunos do efetivo principal. É regra de domínio (`oper === "al"`),
 * não de layout — por isso mora aqui e não dentro do componente da grade.
 */
export function partitionTrips(indisps: CrewIndispList[]) {
   return {
      principais: indisps.filter((i) => i.trip.oper !== "al"),
      alunos: indisps.filter((i) => i.trip.oper === "al"),
   };
}
