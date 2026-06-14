// Espelha o LastIndisps: cartão "Últimas Atualizações" com título + N linhas,
// cada uma com trigrama / motivo / período / alteração / ícone.
const ROWS = 12;

export function LastIndispsSkeleton() {
   return (
      <div className="h-fit w-fit animate-pulse rounded border border-slate-200 bg-white p-3 shadow">
         <div className="mb-3 border-b border-slate-200 pb-2">
            <div className="mx-auto h-5 w-44 rounded bg-slate-200" />
         </div>

         <div className="flex flex-col gap-0.5">
            {Array.from({ length: ROWS }).map((_, i) => (
               <div
                  key={i}
                  className="flex items-center gap-2 border-b border-slate-100 px-2 py-1.5 last:border-b-0"
               >
                  <div className="h-5 w-10 shrink-0 rounded bg-slate-200" />
                  <div className="h-5 w-12 shrink-0 rounded bg-slate-100" />
                  <div className="h-5 w-24 shrink-0 rounded bg-slate-100" />
                  <div className="h-5 w-24 shrink-0 rounded bg-slate-100" />
                  <div className="h-5 w-6 shrink-0 rounded bg-slate-100" />
               </div>
            ))}
         </div>
      </div>
   );
}
