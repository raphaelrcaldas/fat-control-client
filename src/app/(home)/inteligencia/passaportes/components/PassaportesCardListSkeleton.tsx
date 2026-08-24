// Skeleton que espelha PassaportesCardList (faixa de status, nome + chip de
// localização e as duas linhas de documento), para zero layout-shift no mobile.

export default function PassaportesCardListSkeleton({
   cards = 6,
}: {
   cards?: number;
}) {
   return (
      <div className="space-y-2 p-2">
         {Array.from({ length: cards }).map((_, i) => (
            <div
               key={i}
               className="flex overflow-hidden rounded border border-slate-200 bg-white shadow-sm"
            >
               <div className="w-1 shrink-0 animate-pulse bg-slate-200" />
               <div className="min-w-0 flex-1 space-y-1.5 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                     <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                     <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
                  </div>
                  <div className="h-3 w-52 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-44 animate-pulse rounded bg-slate-100" />
               </div>
            </div>
         ))}
      </div>
   );
}
