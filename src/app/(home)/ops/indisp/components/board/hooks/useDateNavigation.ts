import { useCallback, useMemo, useState } from "react";
import { addDays, dateToIso } from "utils/dateHandler";

// O viewport começa um dia antes da data de referência (contexto).
const VIEW_OFFSET = -1;

// Janela de dados carregada de uma vez (Opção A): a navegação fica clampada
// dentro dela, então todo dia visível tem dado correspondente buscado.
const WINDOW_BACK_DAYS = 30;
const WINDOW_FWD_DAYS = 90;

function clampDate(d: Date, min: Date, max: Date): Date {
   if (d.getTime() < min.getTime()) return min;
   if (d.getTime() > max.getTime()) return max;
   return d;
}

/**
 * Janela de datas visível. `dayCount` vem de `useVisibleDays` — muda com a
 * largura da tela, então os limites de navegação são recalculados junto e o
 * `dateRef` é clampado na leitura (não em efeito, que geraria um render extra).
 */
export function useDateNavigation(dayCount: number) {
   // Janela estável durante a sessão → query key estável, busca única.
   const { windowStart, windowEnd } = useMemo(() => {
      const today = new Date();
      return {
         windowStart: addDays(today, -WINDOW_BACK_DAYS),
         windowEnd: addDays(today, WINDOW_FWD_DAYS),
      };
   }, []);

   // minRef/maxRef são os limites de dateRef que mantêm o viewport inteiro
   // [ref + OFFSET, ref + OFFSET + (dayCount-1)] dentro da janela buscada.
   const { minRef, maxRef } = useMemo(
      () => ({
         minRef: addDays(windowStart, -VIEW_OFFSET),
         maxRef: addDays(windowEnd, -(dayCount - 1 + VIEW_OFFSET)),
      }),
      [windowStart, windowEnd, dayCount]
   );

   const [dateRef, setDateRef] = useState<Date>(() => new Date());
   const refAtual = clampDate(dateRef, minRef, maxRef);

   const dates = useMemo(
      () =>
         Array.from({ length: dayCount }, (_, i) =>
            addDays(refAtual, i + VIEW_OFFSET)
         ),
      // refAtual é derivado; a identidade muda a cada render, então a
      // dependência é o valor em ms.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [refAtual.getTime(), dayCount]
   );

   const shift = useCallback(
      (days: number, months = 0) => {
         setDateRef((prev) => {
            const d = new Date(prev.getTime());
            if (days) d.setDate(d.getDate() + days);
            if (months) d.setMonth(d.getMonth() + months);
            return clampDate(d, minRef, maxRef);
         });
      },
      [minRef, maxRef]
   );

   const goToday = useCallback(
      () => setDateRef(clampDate(new Date(), minRef, maxRef)),
      [minRef, maxRef]
   );

   const canBack = refAtual.getTime() > minRef.getTime();
   const canForward = refAtual.getTime() < maxRef.getTime();

   return {
      dates,
      shift,
      goToday,
      canBack,
      canForward,
      windowFrom: dateToIso(windowStart),
      windowTo: dateToIso(windowEnd),
   };
}
