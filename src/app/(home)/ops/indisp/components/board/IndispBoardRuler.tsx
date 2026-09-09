import { Ref } from "react";
import clsx from "clsx";
import { DayColumn } from "./utils/indispDays";
import {
   colWidth,
   TEXTO_DADO,
   TEXTO_VARREDURA,
   TRIG_COL,
} from "./utils/indispBoardLayout";

interface IndispBoardRulerProps {
   days: DayColumn[];
   onFocusDay: (iso: string) => void;
   /** Um arrasto que termina sobre a régua não deve selecionar o dia. */
   shouldIgnoreClick: () => boolean;
   /**
    * A trilha da régua é a MEDIDA de referência da grade: o arrasto lê a
    * largura daqui para saber quantos px vale um dia.
    */
   trackRef?: Ref<HTMLDivElement>;
}

/**
 * Régua de dias — e o único lugar onde se escolhe uma data.
 *
 * Hoje e a coluna sob leitura precisavam se distinguir: hoje ganha o traço da
 * marca embaixo do número, a seleção ganha a moldura cinza que desce pela
 * coluna inteira. Antes os dois eram vermelhos e disputavam o mesmo sinal.
 */
export function IndispBoardRuler({
   days,
   onFocusDay,
   shouldIgnoreClick,
   trackRef,
}: IndispBoardRulerProps) {
   return (
      <div className="flex shrink-0 border-b-2 border-slate-300 bg-slate-50">
         <div
            className={clsx(
               TRIG_COL,
               "flex items-end border-r-2 border-slate-300 px-2.5 pb-1"
            )}
         >
            <span
               className={clsx(
                  "font-mono font-bold tracking-[0.14em] text-slate-600",
                  TEXTO_VARREDURA
               )}
            >
               TRIP
            </span>
         </div>
         <div ref={trackRef} className="flex flex-1">
            {days.map((day) => (
               <button
                  key={day.iso}
                  type="button"
                  onClick={() => {
                     if (!shouldIgnoreClick()) onFocusDay(day.iso);
                  }}
                  aria-current={day.isToday ? "date" : undefined}
                  aria-pressed={day.isFocused}
                  aria-label={`${day.weekday}, ${day.day}/${day.month}${day.isToday ? ", hoje" : ""}`}
                  style={{ width: colWidth(1, days.length) }}
                  className={clsx(
                     "cursor-[inherit] border-b-2 pt-1 pb-0.5 pointer-coarse:min-h-[44px] pointer-coarse:py-1.5",
                     day.isToday
                        ? "border-b-sky-600"
                        : day.isFocused
                          ? "border-b-slate-500"
                          : "border-b-transparent",
                     day.isFocused
                        ? "border-x border-x-sky-400 bg-sky-100"
                        : "border-x border-x-transparent",
                     day.isWeekend &&
                        !day.isFocused &&
                        !day.isToday &&
                        "bg-red-50",
                     day.isToday && !day.isFocused && "bg-sky-50"
                  )}
               >
                  <span
                     className={clsx(
                        "block font-semibold tracking-[0.14em]",
                        TEXTO_VARREDURA,
                        day.isWeekend ? "text-red-700" : "text-slate-600"
                     )}
                  >
                     {day.weekday}
                  </span>
                  <span
                     className={clsx(
                        "block font-mono font-bold",
                        TEXTO_DADO,
                        day.isToday
                           ? "text-sky-800"
                           : day.isWeekend
                             ? "text-red-700"
                             : day.isPast
                               ? "text-slate-600"
                               : "text-slate-800"
                     )}
                  >
                     {day.day}
                  </span>
               </button>
            ))}
         </div>
      </div>
   );
}
