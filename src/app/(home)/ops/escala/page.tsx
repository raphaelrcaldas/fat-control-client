"use client";
import { useMemo } from "react";
import { useEscala } from "@/hooks/queries/useEscala";
import { todayIso } from "@/../utils/dateHandler";
import {
   EscalaFilters,
   type EscalaFiltersState,
} from "./components/EscalaFilters";
import { FuncSection } from "./components/FuncSection";
import { EmptyState, NoResultsState } from "./components/EmptyState";
import { EscalaSkeleton } from "./components/EscalaSkeleton";
import { useEscalaFilters } from "./hooks/useEscalaFilters";
import { buildBuckets, formatRangeLabel } from "./utils/buildEscala";
import type { GetEscalaParams } from "services/routes/ops/escala";

const INITIAL_FILTERS: EscalaFiltersState = {
   date_start: todayIso(),
   date_end: todayIso(),
   tipo_quad_id: null,
   funcs: [],
   sort: "quads_asc",
};

export default function EscalaPage() {
   const [filters, setFilters] = useEscalaFilters(INITIAL_FILTERS);

   const params = useMemo<Partial<GetEscalaParams>>(
      () => ({
         date_start: filters.date_start,
         date_end: filters.date_end,
         tipo_quad_id: filters.tipo_quad_id ?? undefined,
         funcs: filters.funcs,
         sort: filters.sort,
      }),
      [filters]
   );

   const isParamsReady =
      Boolean(filters.date_start) &&
      Boolean(filters.date_end) &&
      filters.date_end >= filters.date_start &&
      filters.tipo_quad_id !== null &&
      filters.funcs.length > 0;

   const { data, isFetching, error } = useEscala(
      isParamsReady ? params : undefined
   );

   const buckets = useMemo(() => {
      if (!data) return [];
      return buildBuckets(data.sections, data.date_end);
   }, [data]);

   const totalDisp = buckets.reduce((sum, b) => sum + b.disponiveis.length, 0);
   const totalInop = buckets.reduce(
      (sum, b) => sum + b.indisponiveis.length,
      0
   );

   const skeletonColumns = Math.max(filters.funcs.length, 1);
   const showSkeleton = isParamsReady && isFetching;

   return (
      <div className="flex flex-col">
         <header className="mb-3 flex items-end justify-between gap-3">
            <div>
               <p className="font-mono text-[10px] font-bold tracking-[0.3em] text-slate-400 uppercase">
                  Operações · Escala
               </p>
               <h1 className="text-2xl leading-tight font-extrabold tracking-tight text-slate-900">
                  Geração de Escala
               </h1>
               <p className="mt-0.5 text-xs text-slate-500">
                  Cruza indisponibilidades e quadrinhos para listar a tripulação
                  disponível.
               </p>
            </div>
            {data && (
               <div className="hidden flex-col items-end gap-0.5 md:flex">
                  <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-slate-400 uppercase">
                     Período
                  </span>
                  <span className="font-mono text-sm font-bold tracking-wider text-slate-800 tabular-nums">
                     {formatRangeLabel(data.date_start, data.date_end)}
                  </span>
                  <div className="mt-1 flex items-center gap-3 font-mono text-[10px] tracking-widest text-slate-500 uppercase tabular-nums">
                     <span className="flex items-center gap-1">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {String(totalDisp).padStart(2, "0")} Disponíveis
                     </span>
                     <span className="flex items-center gap-1">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-500" />
                        {String(totalInop).padStart(2, "0")} Indisponíveis
                     </span>
                  </div>
               </div>
            )}
         </header>

         <EscalaFilters
            value={filters}
            onChange={setFilters}
            isFetching={isFetching}
         />

         {error && (
            <div className="mb-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
               {(error as Error).message}
            </div>
         )}

         <div>
            {!isParamsReady ? (
               <EmptyState />
            ) : showSkeleton ? (
               <EscalaSkeleton columns={skeletonColumns} />
            ) : data && buckets.length === 0 ? (
               <NoResultsState />
            ) : (
               <div className="flex flex-wrap items-start gap-4">
                  {buckets.map((bucket, idx) => (
                     <FuncSection
                        key={bucket.func}
                        bucket={bucket}
                        index={idx + 1}
                     />
                  ))}
               </div>
            )}
         </div>
      </div>
   );
}
