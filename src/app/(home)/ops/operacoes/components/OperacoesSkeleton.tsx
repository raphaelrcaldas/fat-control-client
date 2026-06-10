export function OperacoesSkeleton({ rows = 6 }: { rows?: number }) {
   return (
      <div className="flex animate-pulse flex-col gap-2.5">
         {Array.from({ length: rows }).map((_, i) => (
            <div
               key={i}
               className="rounded-xl border border-slate-200 bg-white px-4 py-3.5"
            >
               <div className="flex items-center gap-4">
                  <div className="h-8 w-12 rounded bg-slate-200" />
                  <div className="h-4 w-24 rounded bg-slate-100" />
                  <div className="h-5 w-20 rounded-md bg-slate-100" />
                  <div className="h-4 w-32 rounded bg-slate-100" />
                  <div className="flex-1">
                     <div className="h-4 w-2/3 rounded bg-slate-200" />
                     <div className="mt-1.5 h-3 w-1/3 rounded bg-slate-100" />
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                     <div className="h-4 w-40 rounded bg-slate-100" />
                     <div className="h-4 w-32 rounded bg-slate-100" />
                  </div>
               </div>
            </div>
         ))}
      </div>
   );
}
