// Skeleton que espelha SummaryBar (caixa de ícone, identidade e os 5
// contadores com barra), para zero layout-shift quando os dados chegam.

const COUNTERS = [0, 1, 2, 3, 4] as const;

export default function SummaryBarSkeleton() {
   return (
      <div className="flex items-center gap-3 overflow-hidden rounded border border-slate-200 bg-white p-2.5 shadow-sm">
         {/* Alturas presas ao texto real (1rem = 14px): "Situação" é
             `text-sm` (line-box 17,5px) e a contagem é `text-[11px]`. É a
             identidade que dita a altura da faixa no desktop. */}
         <div className="flex w-28 shrink-0 items-center gap-2 sm:w-36">
            <div className="h-8 w-8 animate-pulse rounded-md bg-slate-200" />
            <div className="space-y-1.5">
               <div className="flex h-5 items-center">
                  <div className="h-3.5 w-16 animate-pulse rounded bg-slate-200" />
               </div>
               <div className="flex h-3 items-center">
                  <div className="h-2 w-20 animate-pulse rounded bg-slate-100" />
               </div>
            </div>
         </div>
         <div className="grid min-w-0 flex-1 grid-cols-3 gap-1.5 sm:grid-cols-5">
            {COUNTERS.map((i) => (
               <div
                  key={i}
                  className="rounded border border-slate-200 px-2 py-1"
               >
                  {/* O número real é `text-base`: line-box de 21px. */}
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
