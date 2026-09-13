export function OperacaoDetailSkeleton() {
   return (
      <div
         role="status"
         aria-label="Carregando operação"
         className="space-y-2 motion-safe:animate-pulse"
      >
         <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="space-y-5 px-4 py-4 sm:px-6 sm:py-5">
               <div className="flex h-8 items-center justify-between">
                  <div className="h-8 w-28 rounded bg-slate-100" />
                  <div className="h-8 w-28 rounded bg-slate-100" />
               </div>
               <div className="space-y-3">
                  <div className="h-6 w-40 rounded bg-slate-100" />
                  <div className="h-[26px] w-52 max-w-full rounded bg-slate-200 sm:h-8" />
               </div>
            </div>
            <div className="grid gap-4 border-t border-slate-200 bg-slate-50/70 px-4 py-4 sm:grid-cols-2 sm:px-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)]">
               {[0, 1, 2].map((i) => (
                  <div key={i} className="flex min-w-0 gap-3">
                     <div className="size-5 shrink-0 rounded bg-slate-200" />
                     <div className="min-w-0 space-y-1">
                        <div className="h-4 w-24 rounded bg-slate-100" />
                        <div className="h-5 w-44 max-w-full rounded bg-slate-200" />
                     </div>
                  </div>
               ))}
            </div>
         </div>
         <div className="flex h-12 items-center gap-5 border-b border-slate-200 px-3">
            {[0, 1, 2].map((i) => (
               <div key={i} className="h-4 w-20 rounded bg-slate-200" />
            ))}
         </div>
         <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 9 }).map((_, i) => (
               <div
                  key={i}
                  className="relative min-w-0 rounded border border-slate-200 bg-white px-3 py-3 pr-12 shadow-sm sm:px-4 sm:pr-14"
               >
                  <div className="min-h-9 sm:min-h-8">
                     <div className="h-4 w-28 max-w-full rounded bg-slate-100" />
                  </div>
                  <div className="absolute top-1/2 right-3 size-6 -translate-y-1/2 rounded bg-slate-100 sm:right-4" />
                  <div className="h-7 w-24 max-w-full rounded bg-slate-200" />
                  {i === 7 && (
                     <div className="mt-1 h-4 w-40 max-w-full rounded bg-slate-100" />
                  )}
               </div>
            ))}
         </div>
         <div className="grid grid-cols-1 items-start gap-2 xl:grid-cols-2">
            {[0, 1].map((i) => (
               <div
                  key={i}
                  className="min-w-0 rounded border border-slate-200 bg-white shadow-sm"
               >
                  <div className="border-b border-slate-200 px-4 py-3">
                     <div className="h-6 w-32 rounded bg-slate-200" />
                  </div>
                  {i === 1 && (
                     <div className="h-12 border-b border-slate-200 bg-slate-50" />
                  )}
                  <div
                     className={
                        i === 1
                           ? "h-80 divide-y divide-slate-100 sm:h-96"
                           : "divide-y divide-slate-100"
                     }
                  >
                     {[0, 1, 2, 3, 4].map((r) => (
                        <div
                           key={r}
                           className="flex justify-between gap-4 px-4 py-2"
                        >
                           <div className="h-5 w-40 max-w-full rounded bg-slate-100" />
                           <div className="h-5 w-10 shrink-0 rounded bg-slate-100" />
                        </div>
                     ))}
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}
