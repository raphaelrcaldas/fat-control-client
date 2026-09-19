/** Espelha `MissaoGleCard`: mesma altura, mesmo gap, mesmas faixas. */
export function MissoesSkeleton({ cards = 3 }: { cards?: number }) {
   return (
      <div className="space-y-2">
         {Array.from({ length: cards }).map((_, i) => (
            <div
               key={i}
               className="rounded border border-slate-200 bg-white p-3 shadow-sm"
            >
               <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                     <div className="flex items-baseline gap-2">
                        <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
                        <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
                     </div>
                     <div className="mt-1.5 h-3 w-48 animate-pulse rounded bg-slate-100" />
                     <div className="mt-2 flex gap-3">
                        <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
                        <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
                     </div>
                  </div>
                  <div className="h-5 w-5 shrink-0 animate-pulse rounded bg-slate-100" />
               </div>
            </div>
         ))}
      </div>
   );
}
