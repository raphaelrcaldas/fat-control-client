export function OperacaoDetailSkeleton() {
   return (
      <div className="animate-pulse">
         {/* header */}
         <div className="mb-5">
            <div className="mb-2 h-4 w-24 rounded bg-slate-100" />
            <div className="mb-2 flex gap-2">
               <div className="h-5 w-16 rounded bg-slate-200" />
               <div className="h-5 w-20 rounded bg-slate-100" />
            </div>
            <div className="h-7 w-80 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-96 rounded bg-slate-100" />
         </div>

         {/* KPIs */}
         <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
               <div
                  key={i}
                  className="h-[88px] rounded-xl border border-slate-200 bg-white"
               />
            ))}
         </div>

         {/* esforço + sebo */}
         <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="h-72 rounded-xl border border-slate-200 bg-white" />
            <div className="h-72 rounded-xl border border-slate-200 bg-white" />
         </div>

         {/* etapas */}
         <div className="h-96 rounded-xl border border-slate-200 bg-white" />
      </div>
   );
}
