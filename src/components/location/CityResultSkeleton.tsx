/**
 * Esqueleto da lista de `CityResultRow`: ícone, nome e chip da UF, na mesma
 * moldura (`px-4 py-3`, `gap-3`) para a lista não saltar quando as cidades
 * chegam. Contagem e larguras fixas — nunca aleatórias.
 */
const NOME_LARGURAS = ["w-40", "w-56", "w-32", "w-48", "w-44"];

export function CityResultSkeleton() {
   return (
      <div
         role="status"
         className="divide-y divide-slate-200 overflow-hidden bg-white"
      >
         <span className="sr-only">Procurando cidades…</span>
         {NOME_LARGURAS.map((largura, i) => (
            <div
               key={i}
               aria-hidden
               className="flex items-center gap-3 px-4 py-3"
            >
               <div className="size-4 shrink-0 animate-pulse rounded-full bg-slate-100" />
               <div className="flex flex-1">
                  <div
                     className={`h-5 animate-pulse rounded bg-slate-200 ${largura}`}
                  />
               </div>
               <div className="h-5 w-8 animate-pulse rounded bg-slate-100" />
            </div>
         ))}
      </div>
   );
}
