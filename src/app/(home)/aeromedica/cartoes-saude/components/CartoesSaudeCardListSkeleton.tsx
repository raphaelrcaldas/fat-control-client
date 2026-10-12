// Skeleton que espelha CartoesSaudeCardList (faixa de status + nome +
// prontuário + a linha com os três documentos), para zero layout-shift.

export default function CartoesSaudeCardListSkeleton({
   cards = 6,
}: {
   cards?: number;
}) {
   return (
      <div role="status" className="space-y-2 p-2">
         <span className="sr-only">Carregando cartões de saúde…</span>
         {Array.from({ length: cards }).map((_, i) => (
            <div
               key={i}
               aria-hidden
               className="flex overflow-hidden rounded border border-slate-200 bg-white shadow-sm"
            >
               <div className="w-1 shrink-0 animate-pulse bg-slate-200" />
               <div className="min-w-0 flex-1 space-y-1.5 px-3 py-2">
                  {/* Alturas presas ao texto real (1rem = 14px): o nome é
                      `text-sm` (17,5px) e a linha de documentos é `text-xs`
                      (14px). */}
                  <div className="flex h-5 items-center justify-between gap-2">
                     <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
                     <div className="h-3 w-14 animate-pulse rounded bg-slate-100" />
                  </div>
                  <div className="flex h-[14px] items-center justify-between gap-2">
                     {[0, 1, 2].map((l) => (
                        <div key={l} className="flex items-center gap-1">
                           <div className="h-3 w-8 animate-pulse rounded bg-slate-100" />
                           <div className="h-3 w-14 animate-pulse rounded bg-slate-200" />
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         ))}
      </div>
   );
}
