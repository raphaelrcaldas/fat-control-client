// Espelha o layout da aba "Estatística" (padrão): masthead + KPIs + Esforço/Sebo.
export function OperacaoDetailSkeleton() {
   return (
      <div className="animate-pulse">
         {/* Voltar */}
         <div className="mb-2 h-8 w-24 rounded bg-slate-100" />

         {/* Masthead — mesma moldura do OperacaoHeader */}
         <div className="relative mb-5 overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
            <span className="absolute top-0 left-0 h-full w-1 bg-red-600" />
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 shrink-0 rounded-md bg-slate-200" />
               <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                     <div className="h-3 w-20 rounded bg-slate-200" />
                     <div className="h-3 w-24 rounded bg-slate-100" />
                  </div>
                  <div className="mt-1.5 h-7 w-72 rounded bg-slate-200" />
                  <div className="mt-2.5 h-4 w-96 max-w-full rounded bg-slate-100" />
               </div>
            </div>
         </div>

         {/* Abas */}
         <div className="mb-5 flex gap-4 border-b border-gray-200 pb-2">
            <div className="h-5 w-24 rounded bg-slate-200" />
            <div className="h-5 w-20 rounded bg-slate-100" />
            <div className="h-5 w-20 rounded bg-slate-100" />
         </div>

         {/* KPIs */}
         <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
               <div
                  key={i}
                  className="rounded border border-slate-300 bg-white px-4 py-3 shadow"
               >
                  <div className="h-2.5 w-16 rounded bg-slate-100" />
                  <div className="mt-2 h-6 w-14 rounded bg-slate-200" />
               </div>
            ))}
         </div>

         {/* Esforço + Sebo */}
         <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
               <div
                  key={i}
                  className="rounded border border-slate-300 bg-white shadow"
               >
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                     <div className="flex items-center gap-2">
                        <span className="h-4 w-1 rounded-full bg-red-600" />
                        <div className="h-4 w-32 rounded bg-slate-200" />
                     </div>
                     <div className="h-5 w-20 rounded-full bg-slate-100" />
                  </div>
                  <div className="divide-y divide-slate-100">
                     {Array.from({ length: 5 }).map((_, r) => (
                        <div
                           key={r}
                           className="flex items-center justify-between px-4 py-2.5"
                        >
                           <div className="h-3.5 w-40 rounded bg-slate-100" />
                           <div className="h-3.5 w-10 rounded bg-slate-100" />
                        </div>
                     ))}
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}
