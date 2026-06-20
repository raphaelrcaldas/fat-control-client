// Skeleton que espelha StatCardsGrid (3 cards, header com caixa de ícone +
// título e os 5 contadores com barra), para zero layout-shift quando os
// dados chegam. Mantém o mesmo grid e paddings do StatCard real.

const COUNTERS = [0, 1, 2, 3, 4] as const;

function StatCardSkeleton() {
   return (
      <div className="overflow-hidden rounded border border-slate-200 bg-white p-5 shadow-sm">
         {/* Header */}
         <div className="mb-4 flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-md bg-slate-200" />
            <div className="space-y-1.5">
               <div className="h-3.5 w-32 animate-pulse rounded bg-slate-200" />
               <div className="h-2 w-16 animate-pulse rounded bg-slate-100" />
            </div>
         </div>

         {/* Counters */}
         <div className="grid grid-cols-5 gap-2">
            {COUNTERS.map((i) => (
               <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className="h-5 w-8 animate-pulse rounded bg-slate-200" />
                  <div className="h-2 w-10 animate-pulse rounded bg-slate-100" />
                  <div className="mt-0.5 h-1.5 w-full animate-pulse rounded-full bg-slate-200" />
               </div>
            ))}
         </div>
      </div>
   );
}

export default function StatCardsSkeleton() {
   return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
         <StatCardSkeleton />
         <StatCardSkeleton />
         <StatCardSkeleton />
      </div>
   );
}
