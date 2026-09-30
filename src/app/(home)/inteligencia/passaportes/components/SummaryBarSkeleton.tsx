// Skeleton que espelha SummaryBar (dois blocos com caixa de ícone, título e
// os 4 contadores com barra), para zero layout-shift quando os dados chegam.

const COUNTERS = [0, 1, 2, 3] as const;

function DocSummarySkeleton() {
   return (
      <div aria-hidden className="flex flex-1 items-center gap-3 p-2.5">
         <div className="flex w-32 shrink-0 items-center gap-2 sm:w-36">
            <div className="h-8 w-8 animate-pulse rounded-md bg-slate-200" />
            <div className="space-y-1.5">
               <div className="h-[17.5px] w-16 animate-pulse rounded bg-slate-200" />
               <div className="h-[10.5px] w-12 animate-pulse rounded bg-slate-100" />
            </div>
         </div>
         <div className="grid min-w-0 flex-1 grid-cols-2 gap-1.5 sm:grid-cols-4">
            {COUNTERS.map((i) => (
               <div
                  key={i}
                  className="rounded border border-slate-200 px-2 py-1"
               >
                  <div className="flex h-[21px] items-center justify-between gap-1">
                     <div className="h-2 w-10 animate-pulse rounded bg-slate-100" />
                     <div className="h-4 w-4 animate-pulse rounded bg-slate-200" />
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
         className="flex min-h-[197px] flex-col divide-y divide-slate-200 overflow-hidden rounded border border-slate-200 bg-white shadow-sm sm:min-h-[57px] sm:flex-row sm:divide-x sm:divide-y-0"
      >
         <span className="sr-only">Carregando resumo dos passaportes…</span>
         <DocSummarySkeleton />
         <DocSummarySkeleton />
      </div>
   );
}
