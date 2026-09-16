"use client";
import clsx from "clsx";

function isWeekend(d: Date): boolean {
   return d.getDay() === 0 || d.getDay() === 6;
}

interface WeekCalendarSkeletonProps {
   /** As mesmas datas da grade real: o skeleton pinta o fim de semana na
    *  coluna certa, para a cor não saltar quando os dados chegam. */
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

export function WeekCalendarSkeleton({
   dates,
   rows = 3,
}: WeekCalendarSkeletonProps) {
   const days = dates;
   const aeronaves = Array.from({ length: rows });

   return (
      <div className="min-h-screen text-gray-900">
         {/* Navegação — mesmas medidas da barra real (dois NavButton de
             32×32 e o período no meio), para não haver salto quando os
             dados chegam. */}
         <div className="m-4 flex items-center justify-center gap-1">
            <div className="h-[32px] w-[32px] animate-pulse rounded bg-slate-200" />
            <div className="h-[32px] animate-pulse rounded bg-slate-200 px-3 sm:min-w-35" />
            <div className="h-[32px] w-[32px] animate-pulse rounded bg-slate-200" />
         </div>

         {/* Calendário */}
         <div className="relative rounded border border-slate-200 shadow">
            <table className="w-full table-fixed border-separate border-spacing-0">
               <thead>
                  <tr className="bg-white">
                     <th className="sticky left-0 z-10 w-16 border-r border-b border-slate-200/60 bg-white sm:w-24"></th>
                     {days.map((day, idx) => (
                        <th
                           key={idx}
                           className={clsx(
                              "border-r border-b border-slate-200/60 p-2",
                              isWeekend(day) ? "bg-red-50" : "bg-white"
                           )}
                        >
                           <div className="flex flex-col items-center gap-1.5">
                              <div className="h-2 w-8 animate-pulse rounded bg-slate-200" />
                              <div className="h-5 w-5 animate-pulse rounded bg-slate-200" />
                           </div>
                        </th>
                     ))}
                  </tr>
               </thead>
               <tbody>
                  {aeronaves.map((_, rowIdx) => (
                     <tr key={rowIdx}>
                        {/* Coluna da aeronave */}
                        <td className="sticky left-0 z-10 border-r border-b border-slate-200/60 bg-white p-1">
                           <div className="flex flex-col items-center justify-center gap-1.5 p-1">
                              <div className="h-3.5 w-14 animate-pulse rounded bg-slate-200" />
                              <div className="h-4 w-9 animate-pulse rounded-md bg-slate-200" />
                              <div className="hidden h-2 w-12 animate-pulse rounded bg-slate-100 md:block" />
                           </div>
                        </td>

                        {/* Células dos dias */}
                        {days.map((day, colIdx) => {
                           const chips =
                              CHIP_PATTERN[rowIdx]?.[colIdx % 7] ?? 0;
                           return (
                              <td
                                 key={colIdx}
                                 className={clsx(
                                    "border-r border-b border-slate-200/60 align-top",
                                    isWeekend(day) ? "bg-red-50" : "bg-white"
                                 )}
                              >
                                 <div className="flex min-h-38 flex-col justify-start gap-1 p-1">
                                    {Array.from({ length: chips }).map(
                                       (_, chipIdx) => (
                                          <div
                                             key={chipIdx}
                                             className="h-6 w-full animate-pulse rounded border border-slate-200 bg-slate-200"
                                          />
                                       )
                                    )}
                                 </div>
                              </td>
                           );
                        })}
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );
}
