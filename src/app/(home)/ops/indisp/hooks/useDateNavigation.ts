import { useMemo, useState } from "react";
import { dateToIso } from "utils/dateHandler";

// Número fixo de dias do viewport — a visibilidade por breakpoint é controlada
// via CSS (getColumnVisibilityClass), não recriando o array.
const DAYS_TO_GENERATE = 21;
// O viewport começa um dia antes da data de referência (contexto).
const VIEW_OFFSET = -1;

// Janela de dados carregada de uma vez (Opção A): a navegação fica clampada
// dentro dela, então todo dia visível tem dado correspondente buscado.
const WINDOW_BACK_DAYS = 30;
const WINDOW_FWD_DAYS = 90;

function addDays(d: Date, days: number): Date {
   return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
}

function clampDate(d: Date, min: Date, max: Date): Date {
   if (d.getTime() < min.getTime()) return min;
   if (d.getTime() > max.getTime()) return max;
   return d;
}

function genDates(dateRef: Date, count: number): Date[] {
   return Array.from({ length: count }, (_, i) =>
      addDays(dateRef, i + VIEW_OFFSET)
   );
}

export function useDateNavigation() {
   // Janela estável durante a sessão → query key estável, busca única.
   // minRef/maxRef são os limites de dateRef que mantêm o viewport inteiro
   // [ref + OFFSET, ref + OFFSET + (N-1)] dentro de [windowStart, windowEnd].
   const { windowStart, windowEnd, minRef, maxRef } = useMemo(() => {
      const today = new Date();
      const start = addDays(today, -WINDOW_BACK_DAYS);
      const end = addDays(today, WINDOW_FWD_DAYS);
      return {
         windowStart: start,
         windowEnd: end,
         minRef: addDays(start, -VIEW_OFFSET),
         maxRef: addDays(end, -(DAYS_TO_GENERATE - 1 + VIEW_OFFSET)),
      };
   }, []);

   const [dateRef, setDateRef] = useState<Date>(() =>
      clampDate(new Date(), minRef, maxRef)
   );

   const dates = useMemo(() => genDates(dateRef, DAYS_TO_GENERATE), [dateRef]);

   const shift = (days: number, months: number) => {
      setDateRef((prev) => {
         const d = new Date(prev.getTime());
         if (days) d.setDate(d.getDate() + days);
         if (months) d.setMonth(d.getMonth() + months);
         return clampDate(d, minRef, maxRef);
      });
   };

   const goToday = () => setDateRef(clampDate(new Date(), minRef, maxRef));

   const canBack = dateRef.getTime() > minRef.getTime();
   const canForward = dateRef.getTime() < maxRef.getTime();

   const period = useMemo(() => {
      if (dates.length === 0) return "";
      const first = dates[0];
      const last = dates[dates.length - 1];
      return `${first.toLocaleDateString("pt-BR", {
         day: "2-digit",
         month: "short",
      })} - ${last.toLocaleDateString("pt-BR", {
         day: "2-digit",
         month: "short",
         year: "numeric",
      })}`;
   }, [dates]);

   return {
      dates,
      shift,
      goToday,
      period,
      canBack,
      canForward,
      windowFrom: dateToIso(windowStart),
      windowTo: dateToIso(windowEnd),
   };
}
