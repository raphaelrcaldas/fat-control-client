// Skeleton que espelha StatCards (card em largura total, identidade à esquerda
// e 5 contadores com barra à direita a partir de md), para zero layout-shift
// quando os dados chegam. Mantém o mesmo flex/grid e paddings do card real.

const COUNTERS = [0, 1, 2, 3, 4] as const;

export default function StatCardsSkeleton() {
   return (
      <div className="overflow-hidden rounded border border-slate-200 bg-white p-5 shadow-sm">
         <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Identidade */}
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 animate-pulse rounded-md bg-slate-200" />
               <div className="space-y-1.5">
                  <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
               </div>
            </div>

            {/* Contadores */}
            <div className="grid grid-cols-5 gap-2 md:flex-1 md:gap-6 lg:max-w-3xl">
               {COUNTERS.map((i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                     <div className="h-6 w-8 animate-pulse rounded bg-slate-200" />
                     <div className="h-2.5 w-12 animate-pulse rounded bg-slate-100" />
                     <div className="mt-0.5 h-1.5 w-full animate-pulse rounded-full bg-slate-200" />
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
}
