// Espelha o card de etiquetas (header + grid de chips) para zero layout-shift
// na troca skeleton → conteúdo.

const CHIP_COUNT = 8;

export function ConfiguracoesSkeleton() {
   return (
      <div className="rounded border border-slate-200 bg-white p-4">
         {/* Header do gerenciador */}
         <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <div className="h-5 w-5 rounded bg-slate-200" />
               <div className="h-4 w-44 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="h-7 w-28 animate-pulse rounded bg-slate-100" />
         </div>

         {/* Grid de etiquetas */}
         <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: CHIP_COUNT }).map((_, i) => (
               <div
                  key={i}
                  className="flex animate-pulse items-center justify-between rounded border border-slate-200 bg-white p-2.5"
               >
                  <div className="flex items-center gap-3">
                     <div className="h-6 w-20 rounded-full bg-slate-200" />
                     <div className="h-3 w-16 rounded bg-slate-100" />
                  </div>
                  <div className="flex items-center gap-1">
                     <div className="h-6 w-6 rounded bg-slate-100" />
                     <div className="h-6 w-6 rounded bg-slate-100" />
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}
