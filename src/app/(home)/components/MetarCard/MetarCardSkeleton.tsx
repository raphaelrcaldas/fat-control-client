/**
 * Esqueleto do corpo do `MetarCard`: linha da observação, grade de tiles
 * (mesmas colunas de `ParsedView`), par nascer/pôr do sol e o toggle da
 * mensagem bruta. O tile real mede `p-3` + rótulo `text-xs` + `gap-1` + valor
 * `text-lg` = 4,5rem (`h-18`); manter em par com `MetarInfoTile` evita salto.
 * Os cinco tiles são a contagem típica (vento, visibilidade, nuvens,
 * temperatura, QNH), fixa — os opcionais (fenômenos, tendência) não entram.
 */
export function MetarCardSkeleton() {
   return (
      <div role="status" className="space-y-4">
         <span className="sr-only">Buscando METAR…</span>
         <div aria-hidden className="space-y-4">
            <div className="h-4 w-56 animate-pulse rounded bg-slate-100" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
               {Array.from({ length: 5 }).map((_, i) => (
                  <div
                     key={i}
                     className="h-18 animate-pulse rounded-xl bg-slate-100"
                  />
               ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
               <div className="h-18 animate-pulse rounded-xl bg-slate-100" />
               <div className="h-18 animate-pulse rounded-xl bg-slate-100" />
            </div>
            <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
         </div>
      </div>
   );
}
