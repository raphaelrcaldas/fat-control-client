export function RelatoriosSkeleton() {
   return (
      <div className="grid min-h-0 gap-2 lg:flex-1 lg:grid-cols-[minmax(320px,380px)_minmax(0,1fr)] 2xl:grid-cols-[500px_minmax(0,1fr)]">
         <div className="animate-pulse space-y-px rounded border border-slate-200 bg-white p-0 shadow-sm">
            {Array.from({ length: 8 }).map((_, i) => (
               <div key={i} className="h-12 bg-slate-50" />
            ))}
         </div>
         <div className="hidden animate-pulse rounded border border-slate-200 bg-slate-100 shadow-sm lg:block" />
      </div>
   );
}
