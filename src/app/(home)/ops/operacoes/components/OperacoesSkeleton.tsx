// Espelha o OperacaoCard 1:1 (espinha, identidade, painel de dados) para
// zero layout-shift na troca skeleton → conteúdo.
export function OperacoesSkeleton({ rows = 6 }: { rows?: number }) {
   return (
      <div className="flex flex-col gap-2.5">
         {Array.from({ length: rows }).map((_, i) => (
            <div
               key={i}
               className="flex animate-pulse items-stretch overflow-hidden rounded border border-slate-200 bg-white shadow-sm"
            >
               {/* Espinha de status */}
               <span className="w-1 shrink-0 bg-slate-200" aria-hidden />

               <div className="flex min-w-0 flex-1 flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:gap-5">
                  {/* Identidade */}
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                     <div className="flex items-center gap-2">
                        <div className="h-4 w-28 rounded bg-slate-200" />
                        <div className="h-4 w-16 rounded bg-slate-100" />
                     </div>

                     <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        {/* Status (dot + label) */}
                        <div className="inline-flex w-28 shrink-0 items-center gap-1.5">
                           <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-200" />
                           <div className="h-3 w-20 rounded bg-slate-100" />
                        </div>
                        {/* Slot cidade */}
                        <div className="inline-flex w-48 shrink-0 items-center gap-1">
                           <div className="h-3.5 w-3.5 shrink-0 rounded bg-slate-100" />
                           <div className="h-3 w-32 rounded bg-slate-100" />
                        </div>
                        {/* Slot documento */}
                        <div className="inline-flex w-56 shrink-0 items-center gap-1">
                           <div className="h-3.5 w-3.5 shrink-0 rounded bg-slate-100" />
                           <div className="h-3 w-40 rounded bg-slate-100" />
                        </div>
                     </div>
                  </div>

                  {/* Painel de dados — mesma moldura do card */}
                  <div className="flex shrink-0 items-center justify-between gap-4 rounded border border-slate-300 bg-slate-50/80 px-3 py-2 md:justify-start">
                     {/* Período */}
                     <div className="flex w-44 shrink-0 flex-col gap-1.5">
                        <div className="h-2 w-14 rounded bg-slate-200" />
                        <div className="h-4 w-36 rounded bg-slate-200" />
                     </div>

                     <span
                        className="hidden h-9 w-px bg-slate-200 sm:block"
                        aria-hidden
                     />

                     {/* Horas */}
                     <div className="flex w-20 shrink-0 flex-col gap-1.5">
                        <div className="h-2 w-10 rounded bg-slate-200" />
                        <div className="h-5 w-12 rounded bg-slate-200" />
                     </div>

                     <span
                        className="hidden h-9 w-px bg-slate-200 sm:block"
                        aria-hidden
                     />

                     {/* Etapas / Aeronaves */}
                     <div className="flex w-24 shrink-0 flex-col gap-1.5">
                        <div className="h-3 w-16 rounded bg-slate-100" />
                        <div className="h-3 w-14 rounded bg-slate-100" />
                     </div>
                  </div>
               </div>
            </div>
         ))}
      </div>
   );
}
