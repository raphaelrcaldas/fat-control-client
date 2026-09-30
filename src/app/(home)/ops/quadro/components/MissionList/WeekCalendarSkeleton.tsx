"use client";
import clsx from "clsx";
import { dateToIso, todayIso } from "utils/dateHandler";

interface WeekCalendarSkeletonProps {
   /** As mesmas datas da grade real: o skeleton pinta hoje e o fim de semana
    *  na coluna certa, para a cor não saltar quando os dados chegam. */
   dates: Date[];
   rows?: number;
}

// Padrão fixo de "missões" por célula (linha x dia) para um visual realista
// e estável (sem flicker/hydration mismatch). Valor = nº de chips na célula.
const CHIP_PATTERN: number[][] = [
   [2, 0, 1, 0, 1, 0, 0],
   [0, 1, 0, 2, 0, 1, 0],
   [1, 0, 0, 1, 0, 1, 0],
];

/**
 * Corpo da grade em carregamento — só o `<tbody>`. A navegação e o cabeçalho
 * de dias dependem apenas das datas, não do dado, então o `WeekCalendar` os
 * renderiza de verdade (e funcionais) e coloca estas linhas no lugar das
 * aeronaves. O aviso `role="status"` fica no contêiner do calendário: um
 * `<div>` não cabe dentro do `<tbody>`.
 */
export function WeekCalendarSkeleton({
   dates,
   rows = 3,
}: WeekCalendarSkeletonProps) {
   const today = todayIso();

   return (
      <tbody aria-hidden>
         {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx}>
               {/* Coluna da aeronave */}
               <td className="sticky left-0 z-10 border-r border-b border-slate-200/60 bg-white p-1">
                  <div className="flex flex-col items-center justify-center gap-1.5 p-1">
                     <div className="h-3.5 w-14 animate-pulse rounded bg-slate-200" />
                     <div className="h-4 w-9 animate-pulse rounded bg-slate-200" />
                     <div className="hidden h-2 w-12 animate-pulse rounded bg-slate-100 md:block" />
                  </div>
               </td>

               {/* Células dos dias */}
               {dates.map((day, colIdx) => {
                  const chips = CHIP_PATTERN[rowIdx]?.[colIdx % 7] ?? 0;
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  return (
                     <td
                        key={colIdx}
                        className={clsx(
                           "border-r border-b border-slate-200/60 align-top",
                           dateToIso(day) === today
                              ? "bg-sky-50"
                              : isWeekend
                                ? "bg-red-50"
                                : "bg-white"
                        )}
                     >
                        <div className="flex min-h-38 flex-col justify-start gap-1 p-1">
                           {Array.from({ length: chips }).map((_, chipIdx) => (
                              <div
                                 key={chipIdx}
                                 className="h-6 w-full animate-pulse rounded border border-slate-200 bg-slate-200"
                              />
                           ))}
                        </div>
                     </td>
                  );
               })}
            </tr>
         ))}
      </tbody>
   );
}
