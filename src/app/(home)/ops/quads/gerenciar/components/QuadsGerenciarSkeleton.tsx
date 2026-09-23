/** Tipos por grupo — padrão fixo, espelha a variação real sem `Math.random()`. */
const TIPOS_POR_GRUPO = [3, 4];

/** Espelha `QuadsGroupCard`: cabeçalho, linhas de tipo e rodapé "Novo tipo". */
export function QuadsGerenciarSkeleton() {
   return (
      <div className="space-y-2">
         {TIPOS_POR_GRUPO.map((tipos, i) => (
            <div
               key={i}
               className="rounded border border-slate-200 bg-white shadow-sm"
            >
               <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                  <div className="space-y-1.5">
                     <div className="h-5 w-36 animate-pulse rounded bg-slate-200" />
                     <div className="h-3 w-12 animate-pulse rounded bg-slate-100" />
                  </div>
                  <div className="flex gap-2">
                     <div className="h-9 w-9 animate-pulse rounded bg-slate-100" />
                     <div className="h-9 w-9 animate-pulse rounded bg-slate-100" />
                  </div>
               </div>

               <div className="divide-y divide-slate-200">
                  {Array.from({ length: tipos }).map((_, j) => (
                     <div
                        key={j}
                        className="flex items-center justify-between gap-3 px-4 py-3"
                     >
                        <div className="space-y-1.5">
                           <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                           <div className="flex gap-1">
                              <div className="h-5 w-14 animate-pulse rounded bg-slate-100" />
                              <div className="h-5 w-16 animate-pulse rounded bg-slate-100" />
                              <div className="h-5 w-20 animate-pulse rounded bg-slate-100" />
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <div className="h-8 w-8 animate-pulse rounded bg-slate-100 sm:w-20" />
                           <div className="h-8 w-8 animate-pulse rounded bg-slate-100" />
                           <div className="h-8 w-8 animate-pulse rounded bg-slate-100" />
                        </div>
                     </div>
                  ))}
               </div>

               <div className="border-t border-slate-200 px-4 py-3">
                  <div className="h-9 w-28 animate-pulse rounded bg-slate-100" />
               </div>
            </div>
         ))}
      </div>
   );
}
