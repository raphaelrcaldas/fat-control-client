// Skeleton que espelha SummaryBar (três faixas com caixa de ícone, sigla e
// os 5 contadores com barra), para zero layout-shift quando os dados chegam.

const DOCS = [0, 1, 2] as const;
const COUNTERS = [0, 1, 2, 3, 4] as const;

function DocSummarySkeleton() {
   return (
      <div
         aria-hidden
         className="flex flex-1 items-center gap-3 p-2.5 lg:flex-col lg:items-stretch lg:gap-2"
      >
         <div className="flex w-14 shrink-0 flex-col items-center gap-1 sm:w-44 sm:flex-row sm:gap-2 lg:w-auto">
            <div className="h-8 w-8 animate-pulse rounded-md bg-slate-200" />
            <div className="space-y-1.5">
               <div className="h-[17.5px] w-12 animate-pulse rounded bg-slate-200 sm:w-14" />
               <div className="hidden h-[10.5px] w-24 animate-pulse rounded bg-slate-100 sm:block" />
            </div>
         </div>
         <div className="grid min-w-0 flex-1 grid-cols-3 gap-1.5 sm:grid-cols-5">
            {COUNTERS.map((i) => (
               <div
                  key={i}
                  className="rounded border border-slate-200 px-2 py-1"
               >
                  {/* Espelha o contador com o número QUEBRADO para baixo do
                      rótulo (`flex-wrap`), que é o caso em todas as larguras
                      medidas: rótulo de 9px (line-box 13.5px) + número
                      `text-base` (21px). */}
                  <div className="h-[13.5px] py-[3px]">
                     <div className="h-full w-10 animate-pulse rounded bg-slate-100" />
                  </div>
                  <div className="flex h-[21px] items-center">
                     <div className="h-5 w-4 animate-pulse rounded bg-slate-200" />
                  </div>
                  <div className="mt-1 h-1 w-full animate-pulse rounded-full bg-slate-200" />
               </div>
            ))}
         </div>
      </div>
   );
}

export default function SummaryBarSkeleton() {
   return (
      <div
         role="status"
         className="flex min-h-[294px] flex-col divide-y divide-slate-200 overflow-hidden rounded border border-slate-200 bg-white shadow-sm sm:min-h-0 lg:min-h-[98px] lg:flex-row lg:divide-x lg:divide-y-0"
      >
         <span className="sr-only">
            Carregando resumo dos cartões de saúde…
         </span>
         {DOCS.map((i) => (
            <DocSummarySkeleton key={i} />
         ))}
      </div>
   );
}
