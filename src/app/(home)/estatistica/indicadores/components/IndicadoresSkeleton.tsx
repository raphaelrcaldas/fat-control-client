"use client";

import clsx from "clsx";

/** Espelha o KpiCard: caixa de ícone + label + valor + subtexto. */
function KpiCardSkeleton({ size = "lg" }: { size?: "lg" | "md" }) {
   const isLg = size === "lg";
   return (
      <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
         <div className="flex items-center gap-3">
            <div
               className={clsx(
                  "shrink-0 animate-pulse rounded-md bg-slate-200",
                  isLg ? "h-10 w-10" : "h-9 w-9"
               )}
            />
            <div className="min-w-0 flex-1 space-y-1.5">
               <div className="h-2.5 w-20 animate-pulse rounded bg-slate-100" />
               <div
                  className={clsx(
                     "w-24 animate-pulse rounded bg-slate-200",
                     isLg ? "h-7" : "h-6"
                  )}
               />
            </div>
         </div>
         <div className="mt-2 h-3 w-32 animate-pulse rounded bg-slate-100" />
      </div>
   );
}

/** Espelha o SecaoCard: header com eyebrow + título, depois a tabela. */
function SecaoSkeleton({ rows, cols }: { rows: number; cols: number }) {
   return (
      <div className="flex flex-col rounded border border-slate-200 bg-white shadow-sm">
         <div className="space-y-1.5 border-b border-slate-200 px-4 py-3">
            <div className="h-2.5 w-16 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
         </div>
         <div className="h-[37px] border-b border-slate-200 bg-slate-50" />
         <div className="divide-y divide-slate-100">
            {Array.from({ length: rows }).map((_, r) => (
               <div key={r} className="flex items-center gap-4 px-4 py-1.5">
                  <div className="h-4 flex-1 animate-pulse rounded bg-slate-200" />
                  {Array.from({ length: cols }).map((_, c) => (
                     <div
                        key={c}
                        className="h-4 w-12 animate-pulse rounded bg-slate-100"
                     />
                  ))}
               </div>
            ))}
         </div>
      </div>
   );
}

/**
 * Espelha o layout real do painel para não haver layout-shift quando os
 * dados chegam: 4 KPIs grandes, 5 operacionais, matriz de 12 linhas,
 * duas quebras lado a lado e a frota.
 */
export function IndicadoresSkeleton() {
   return (
      <div className="space-y-2">
         <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
               {Array.from({ length: 4 }).map((_, i) => (
                  <KpiCardSkeleton key={i} />
               ))}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
               {Array.from({ length: 5 }).map((_, i) => (
                  <KpiCardSkeleton key={i} size="md" />
               ))}
            </div>
         </div>

         <SecaoSkeleton rows={12} cols={6} />

         <div className="grid gap-2 lg:grid-cols-2">
            <SecaoSkeleton rows={3} cols={2} />
            <SecaoSkeleton rows={6} cols={3} />
         </div>

         <SecaoSkeleton rows={4} cols={5} />
      </div>
   );
}
