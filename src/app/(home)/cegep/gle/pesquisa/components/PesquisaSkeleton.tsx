/**
 * Espelha a lista de `MissaoCard`: mesmo cartão, mesma altura, mesmo gap.
 *
 * Quantidade de chips fixa por índice (não aleatória) para não haver
 * flicker nem divergência de hidratação.
 */
const CHIPS_POR_CARD = [2, 1, 3, 1, 2, 1];

export function PesquisaSkeleton({ cards = 4 }: { cards?: number }) {
   return (
      <div className="space-y-2">
         {Array.from({ length: cards }).map((_, i) => (
            <div
               key={i}
               className="rounded border border-slate-200 bg-white p-3 shadow-sm"
            >
               <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                     {/* OM em destaque + período, espelhando MissaoCard */}
                     <div className="flex items-baseline gap-2">
                        <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                        <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
                     </div>
                     <div className="mt-2 flex flex-wrap gap-1.5">
                        {Array.from({
                           length: CHIPS_POR_CARD[i % CHIPS_POR_CARD.length],
                        }).map((__, j) => (
                           <div
                              key={j}
                              className="h-7 w-36 animate-pulse rounded bg-slate-100"
                           />
                        ))}
                     </div>
                  </div>
                  <div className="h-6 w-20 shrink-0 animate-pulse rounded bg-slate-100" />
               </div>
            </div>
         ))}
      </div>
   );
}
