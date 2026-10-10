// Espelha SummaryBar (seis faixas com sigla, cobertura e quatro contadores
// com rótulo, número e barra) na mesma grade, para zero layout-shift.

const DOCS = [0, 1, 2, 3, 4, 5] as const;
const COUNTERS = [0, 1, 2, 3] as const;

export default function SummaryBarSkeleton() {
   return (
      <div
         role="status"
         className="grid grid-cols-1 gap-px overflow-hidden rounded border border-slate-200 bg-slate-200 shadow-sm md:grid-cols-2 2xl:grid-cols-3"
      >
         <span className="sr-only">Carregando resumo dos cartões…</span>
         {DOCS.map((d) => (
            <div
               key={d}
               aria-hidden
               className="flex items-center gap-2.5 bg-white p-2.5"
            >
               <div className="w-14 shrink-0 space-y-1.5 sm:w-24">
                  <div className="h-[17.5px] w-12 animate-pulse rounded bg-slate-200" />
                  <div className="h-[10.5px] w-10 animate-pulse rounded bg-slate-100 sm:w-20" />
               </div>
               <div className="grid min-w-0 flex-1 grid-cols-4 gap-1.5">
                  {COUNTERS.map((c) => (
                     <div
                        key={c}
                        className="rounded border border-slate-200 px-1.5 py-1"
                     >
                        {/* Line-boxes reais: rótulo de 9px e número
                            `text-base leading-tight`. */}
                        <div className="flex h-[13.5px] items-center">
                           <div className="h-2 w-10 max-w-full animate-pulse rounded bg-slate-100" />
                        </div>
                        <div className="flex h-[17.5px] items-center">
                           <div className="h-4 w-4 animate-pulse rounded bg-slate-200" />
                        </div>
                        <div className="mt-1 h-1 w-full animate-pulse rounded-full bg-slate-200" />
                     </div>
                  ))}
               </div>
            </div>
         ))}
      </div>
   );
}
