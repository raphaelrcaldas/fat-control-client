// Contagem fixa de linhas (sem aleatoriedade) para evitar flicker/hydration.
const SKELETON_ROWS = Array.from({ length: 6 });

/**
 * Espelha o layout do board (sidebar de duplas + painel) para zero
 * layout-shift quando os dados chegam.
 */
export default function SimuladorBoardSkeleton() {
   return (
      <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
         <div className="flex min-h-120">
            {/* Sidebar */}
            <div className="flex w-70 shrink-0 flex-col border-r border-slate-200 bg-white">
               <div className="border-b border-slate-200 px-4 py-3">
                  <div className="mb-2 flex items-center justify-between">
                     <div className="h-3 w-12 animate-pulse rounded bg-slate-200" />
                     <div className="h-6 w-6 animate-pulse rounded bg-slate-100" />
                  </div>
                  <div className="h-8 w-full animate-pulse rounded bg-slate-100" />
               </div>
               <div className="flex flex-col">
                  {SKELETON_ROWS.map((_, i) => (
                     <div
                        key={i}
                        className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3"
                     >
                        <div className="min-w-0 flex-1 space-y-1.5">
                           <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200" />
                           <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                           <div className="h-3 w-10 animate-pulse rounded bg-slate-200" />
                           <div className="h-3 w-12 animate-pulse rounded bg-slate-100" />
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Painel (espelha o empty-state) */}
            <div className="flex flex-1 items-center justify-center bg-gray-50">
               <div className="h-12 w-12 animate-pulse rounded bg-slate-200" />
            </div>
         </div>
      </div>
   );
}
