"use client";

// Padrão fixo de colunas da AeronaveTable — espelha o cabeçalho real
// para garantir zero layout-shift quando os dados chegam.
const COLUMNS = [
   "matricula",
   "projeto",
   "tipo",
   "situacao",
   "obs",
   "status",
   "acoes",
] as const;

// Cards de resumo (Ativas + 4 situações) — mesma contagem do SituacaoSummary.
const SUMMARY_CARDS = [0, 1, 2, 3, 4] as const;

interface AeronaveListSkeletonProps {
   rows?: number;
}

export function AeronaveListSkeleton({ rows = 6 }: AeronaveListSkeletonProps) {
   return (
      <div className="space-y-2">
         {/* Resumo por situação */}
         <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {SUMMARY_CARDS.map((card) => (
               <div
                  key={card}
                  className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2.5 shadow-sm"
               >
                  <div className="min-w-0 space-y-1.5">
                     <div className="h-2.5 w-16 animate-pulse rounded bg-slate-100" />
                     <div className="h-6 w-10 animate-pulse rounded bg-slate-200" />
                  </div>
                  <div className="h-5 w-5 shrink-0 animate-pulse rounded bg-slate-100" />
               </div>
            ))}
         </div>

         {/* Tabela desktop */}
         <div className="hidden overflow-hidden rounded border border-slate-200 bg-white shadow-sm md:block">
            {/* Cabeçalho */}
            <div className="grid grid-cols-7 gap-4 border-b border-slate-200 px-4 py-3">
               {COLUMNS.map((col) => (
                  <div
                     key={col}
                     className="mx-auto h-3 w-16 animate-pulse rounded bg-slate-200"
                  />
               ))}
            </div>
            {/* Linhas */}
            <div className="divide-y divide-slate-100">
               {Array.from({ length: rows }).map((_, i) => (
                  <div
                     key={i}
                     className="grid grid-cols-7 items-center gap-4 px-4 py-4"
                  >
                     <div className="mx-auto h-4 w-16 animate-pulse rounded bg-slate-200" />
                     <div className="mx-auto h-7 w-20 animate-pulse rounded bg-slate-100" />
                     <div className="mx-auto h-5 w-20 animate-pulse rounded-full bg-slate-100" />
                     <div className="mx-auto h-8 w-10 animate-pulse rounded bg-slate-200" />
                     <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                     <div className="mx-auto h-5 w-14 animate-pulse rounded-full bg-slate-100" />
                     <div className="mx-auto h-6 w-6 animate-pulse rounded bg-slate-100" />
                  </div>
               ))}
            </div>
         </div>

         {/* Cards mobile */}
         <div className="space-y-3 md:hidden">
            {Array.from({ length: 4 }).map((_, i) => (
               <div
                  key={i}
                  className="rounded border border-slate-200 bg-white p-4 shadow-sm"
               >
                  <div className="mb-3 flex items-center justify-between">
                     <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
                     <div className="h-8 w-10 animate-pulse rounded bg-slate-200" />
                  </div>
                  <div className="space-y-2">
                     <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100" />
                     <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}
