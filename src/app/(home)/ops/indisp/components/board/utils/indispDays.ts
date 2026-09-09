import { datasIguais, dateToIso, startOfDay } from "utils/dateHandler";

export interface DayColumn {
   date: Date;
   iso: string;
   /** Sigla do dia da semana, já em caixa alta ("SEG"). */
   weekday: string;
   /** Dia e mês com dois dígitos. */
   day: string;
   month: string;
   isToday: boolean;
   /** Coluna sob leitura — o usuário clicou nela na régua. */
   isFocused: boolean;
   isWeekend: boolean;
   isPast: boolean;
}

export interface MonthSegment {
   key: string;
   label: string;
   /** Usado quando o mês ocupa poucas colunas — senão o rótulo é cortado. */
   shortLabel: string;
   /** Quantas colunas o mês ocupa dentro da janela. */
   days: number;
   /** Primeiro segmento não leva divisória à esquerda. */
   first: boolean;
}

export function buildDayColumns(
   dates: Date[],
   today: Date,
   focusedIso: string | null
): DayColumn[] {
   const hoje = startOfDay(today);
   return dates.map((date) => {
      const weekday = date.getDay();
      return {
         date,
         iso: dateToIso(date),
         weekday: date
            .toLocaleDateString("pt-BR", { weekday: "short" })
            .replace(".", "")
            .toUpperCase(),
         day: String(date.getDate()).padStart(2, "0"),
         month: String(date.getMonth() + 1).padStart(2, "0"),
         isToday: datasIguais(date, today),
         isFocused: dateToIso(date) === focusedIso,
         isWeekend: weekday === 0 || weekday === 6,
         isPast: startOfDay(date) < hoje,
      };
   });
}

/** Agrupa as colunas por mês para a faixa de contexto acima da régua. */
export function buildMonthSegments(dates: Date[]): MonthSegment[] {
   const segments: MonthSegment[] = [];
   for (const date of dates) {
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const atual = segments[segments.length - 1];
      if (atual?.key === key) {
         atual.days += 1;
         continue;
      }
      segments.push({
         key,
         label: date
            .toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
            .toUpperCase(),
         shortLabel: date
            .toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })
            .replace(".", "")
            .toUpperCase(),
         days: 1,
         first: segments.length === 0,
      });
   }
   return segments;
}
