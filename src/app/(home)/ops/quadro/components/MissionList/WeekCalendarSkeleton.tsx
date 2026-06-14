"use client";

interface WeekCalendarSkeletonProps {
   daysToShow: number;
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
   daysToShow,
   rows = 3,
}: WeekCalendarSkeletonProps) {
   const days = Array.from({ length: daysToShow });
   const aeronaves = Array.from({ length: rows });

   return (
      <div className="min-h-screen text-gray-900">
         {/* Header com navegação */}
         <div className="m-4">
            <div className="flex flex-col items-center gap-3">
               <div className="flex items-center gap-2">
                  <div className="h-8 w-24 animate-pulse rounded bg-slate-200" />
                  <div className="flex min-w-35 justify-center px-2">
                     <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
                  </div>
                  <div className="h-8 w-24 animate-pulse rounded bg-slate-200" />
               </div>
            </div>
         </div>

         {/* Calendário */}
         <div className="relative overflow-x-auto rounded border border-slate-200 shadow">
            <table className="w-full table-fixed border-collapse">
               <thead>
                  <tr className="bg-white">
                     <th className="w-16 border-r border-b border-slate-200/60 bg-white/30 sm:w-24"></th>
                     {days.map((_, idx) => (
                        <th
                           key={idx}
                           className="border-r border-b border-slate-200/60 p-2"
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
                        <td className="border-r border-b border-slate-200/60 p-1">
                           <div className="flex flex-col items-center justify-center gap-1.5 p-1">
                              <div className="h-3.5 w-14 animate-pulse rounded bg-slate-200" />
                              <div className="h-4 w-9 animate-pulse rounded-md bg-slate-200" />
                              <div className="hidden h-2 w-12 animate-pulse rounded bg-slate-100 md:block" />
                           </div>
                        </td>

                        {/* Células dos dias */}
                        {days.map((_, colIdx) => {
                           const chips = CHIP_PATTERN[rowIdx]?.[colIdx] ?? 0;
                           return (
                              <td
                                 key={colIdx}
                                 className="border-r border-b border-slate-200/60 align-top"
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
