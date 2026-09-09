import clsx from "clsx";
import { DayColumn } from "./utils/indispDays";
import { trackSpan } from "./utils/indispBoardLayout";

interface IndispTrackColumnsProps {
   days: DayColumn[];
}

/**
 * Fundo da trilha: zebra de fim de semana e a coluna sob leitura.
 *
 * Fica atrás das faixas (`z-0`) e é puramente decorativo — quem clica em dia
 * é a régua, não a linha.
 */
export function IndispTrackColumns({ days }: IndispTrackColumnsProps) {
   return (
      <div
         aria-hidden
         className="pointer-events-none absolute inset-y-0 right-0 left-[70px] z-0"
      >
         {days.map((day, index) => {
            const { left, width } = trackSpan(index, index + 1, days.length);
            return (
               <div
                  key={day.iso}
                  aria-hidden
                  style={{ left, width }}
                  className={clsx(
                     "absolute inset-y-0 z-0",
                     day.isFocused
                        ? "border-x border-sky-300 bg-sky-100/50"
                        : day.isToday
                          ? "bg-sky-50"
                          : day.isWeekend && "bg-red-50"
                  )}
               />
            );
         })}
      </div>
   );
}
