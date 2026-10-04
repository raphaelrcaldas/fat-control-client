import clsx from "clsx";

export function RelatorioResumoSkeleton({
   mostrarUltimoVoo = true,
}: {
   mostrarUltimoVoo?: boolean;
}) {
   return (
      <div
         aria-hidden
         className="grid gap-3 rounded border border-slate-200 bg-white px-4 py-3 shadow-sm lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
      >
         <div className="min-w-0 space-y-1">
            <div className="flex items-baseline gap-3">
               <div className="h-6 w-40 max-w-full animate-pulse rounded bg-slate-200" />
               <div className="h-4 w-8 shrink-0 animate-pulse rounded bg-slate-100" />
            </div>
            <div className="h-4 w-60 max-w-full animate-pulse rounded bg-slate-100" />
         </div>
         <div
            className={clsx(
               "grid gap-3 border-t border-slate-200 pt-3 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6",
               mostrarUltimoVoo
                  ? "grid-cols-3 lg:min-w-96"
                  : "grid-cols-2 lg:min-w-64"
            )}
         >
            {(mostrarUltimoVoo ? [0, 1, 2] : [0, 1]).map((i) => (
               <div key={i}>
                  <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
                  <div className="h-7 w-16 animate-pulse rounded bg-slate-200" />
               </div>
            ))}
         </div>
      </div>
   );
}
