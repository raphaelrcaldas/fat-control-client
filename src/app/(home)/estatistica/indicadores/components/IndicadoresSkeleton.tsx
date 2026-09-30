"use client";

import { IndicadoresKpis } from "./IndicadoresKpis";

/** Espelha o SecaoCard sem eyebrow e as alturas das linhas reais. */
function SecaoSkeleton({
   rows,
   cols,
   matriz = false,
}: {
   rows: number;
   cols: number;
   matriz?: boolean;
}) {
   return (
      <div
         className={
            matriz
               ? "flex min-h-[425px] flex-col rounded border border-slate-200 bg-white shadow-sm lg:min-h-[421px]"
               : "flex flex-col rounded border border-slate-200 bg-white shadow-sm"
         }
      >
         <div className="flex h-[39.5px] items-center border-b border-slate-200 px-4">
            <div className="h-3.5 w-40 animate-pulse rounded bg-slate-200" />
         </div>
         <div
            className={
               matriz
                  ? "h-[31.5px] border-b border-slate-200 bg-slate-50"
                  : "h-[28px] border-b border-slate-200 bg-slate-50"
            }
         />
         <div className="divide-y divide-slate-100">
            {Array.from({ length: rows }).map((_, r) => (
               <div
                  key={r}
                  className={
                     matriz
                        ? "flex h-[29px] items-center gap-4 px-4"
                        : "flex h-[32.5px] items-center gap-4 px-4"
                  }
               >
                  <div className="h-3.5 min-w-0 flex-1 animate-pulse rounded bg-slate-200" />
                  {Array.from({ length: cols }).map((_, c) => (
                     <div
                        key={c}
                        className="h-3.5 w-12 min-w-0 animate-pulse rounded bg-slate-100"
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
 * dados chegam: 4 KPIs grandes, 5 operacionais, matriz de 12 indicadores + cabeçalho,
 * duas quebras lado a lado e a frota.
 */
export function IndicadoresSkeleton() {
   return (
      <div role="status" className="space-y-2">
         <span className="sr-only">Carregando indicadores…</span>
         <div aria-hidden>
            <IndicadoresKpis
               isLoading
               totais={{
                  etapas: 0,
                  tvoo: 0,
                  pousos: 0,
                  pax: 0,
                  carga: 0,
                  comb: 0,
                  lub: 0,
                  pqd: 0,
                  comb_transf: 0,
                  heavy_qtd: 0,
                  cds_qtd: 0,
                  peso_lancado: 0,
               }}
               pqdPorTipo={[]}
               lancamentos={[]}
            />
         </div>

         <div aria-hidden>
            <SecaoSkeleton rows={12} cols={13} matriz />
         </div>

         <div aria-hidden className="grid gap-2 lg:grid-cols-2">
            <SecaoSkeleton rows={3} cols={2} />
            <SecaoSkeleton rows={9} cols={3} />
         </div>

         <div aria-hidden>
            <SecaoSkeleton rows={3} cols={7} />
         </div>
      </div>
   );
}
