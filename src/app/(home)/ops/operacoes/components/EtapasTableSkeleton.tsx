// Espelha o EtapasTable (moldura + header + tabela) para zero layout-shift.
export function EtapasTableSkeleton({ rows = 6 }: { rows?: number }) {
   return (
      <section className="animate-pulse rounded border border-slate-300 bg-white shadow">
         {/* Header — barra de título + contador + ação */}
         <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2">
               <span className="h-4 w-1 rounded-full bg-red-600" />
               <div className="h-4 w-40 rounded bg-slate-200" />
            </div>
            <div className="flex items-center gap-2">
               <div className="h-6 w-32 rounded-full bg-slate-100" />
               <div className="h-6 w-28 rounded bg-slate-200" />
            </div>
         </div>

         {/* Filtro de aeronaves */}
         <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 px-4 py-2">
            <div className="h-3 w-16 rounded bg-slate-100" />
            <div className="h-5 w-12 rounded-md bg-slate-100" />
            <div className="h-5 w-12 rounded-md bg-slate-100" />
            <div className="h-5 w-12 rounded-md bg-slate-100" />
         </div>

         {/* Cabeçalho da tabela */}
         <div className="grid grid-cols-7 gap-2 border-b border-slate-100 px-4 py-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
               <div key={i} className="mx-auto h-3 w-14 rounded bg-slate-100" />
            ))}
            <div />
         </div>

         {/* Linhas */}
         <div className="divide-y divide-slate-100">
            {Array.from({ length: rows }).map((_, i) => (
               <div
                  key={i}
                  className="grid grid-cols-7 items-center gap-2 px-4 py-3"
               >
                  <div className="mx-auto h-3.5 w-16 rounded bg-slate-200" />
                  <div className="mx-auto h-3.5 w-20 rounded bg-slate-200" />
                  <div className="mx-auto h-3.5 w-20 rounded bg-slate-100" />
                  <div className="mx-auto h-3.5 w-12 rounded bg-slate-200" />
                  <div className="mx-auto h-3.5 w-14 rounded bg-slate-100" />
                  <div className="mx-auto h-3.5 w-10 rounded bg-slate-100" />
                  <div className="mx-auto h-4 w-4 rounded bg-slate-100" />
               </div>
            ))}
         </div>
      </section>
   );
}
