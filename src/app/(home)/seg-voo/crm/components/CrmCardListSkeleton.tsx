// Skeleton que espelha CrmCardList (faixa de status + nome + a linha
// REAL/VAL), para zero layout-shift quando os dados chegam.

export default function CrmCardListSkeleton({ cards = 8 }: { cards?: number }) {
   return (
      <div className="space-y-2 p-2">
         {Array.from({ length: cards }).map((_, i) => (
            <div
               key={i}
               className="flex overflow-hidden rounded border border-slate-200 bg-white shadow-sm"
            >
               <div className="w-1 shrink-0 animate-pulse bg-slate-200" />
               <div className="min-w-0 flex-1 space-y-1.5 px-3 py-2">
                  {/* Alturas presas ao texto real (1rem = 14px): nome em
                      `text-sm` (17,5px), a linha de datas em `text-xs`. */}
                  <div className="flex h-5 items-center justify-between gap-2">
                     <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
                     <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
                  </div>
                  <div className="flex h-4 items-center gap-3">
                     <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                     <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
                  </div>
               </div>
            </div>
         ))}
      </div>
   );
}
