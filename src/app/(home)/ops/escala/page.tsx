"use client";
import { Suspense, useMemo } from "react";
import { useEscala } from "@/hooks/queries/useEscala";
import { todayIso } from "@/../utils/dateHandler";
import { EscalaFilters } from "./components/EscalaFilters";
import { EscalaHeader } from "./components/EscalaHeader";
import { EscalaResults } from "./components/EscalaResults";
import { useEscalaFilters } from "./hooks/useEscalaFilters";
import { buildBuckets } from "./utils/buildEscala";
import type { EscalaFiltersState } from "./types";
import type { GetEscalaParams } from "services/routes/ops/escala";

const INITIAL_FILTERS: EscalaFiltersState = {
   date_start: todayIso(),
   date_end: todayIso(),
   tipo_quad_id: null,
   funcs: [],
   sort: "quads_asc",
};

function EscalaView() {
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

   const { data, isLoading, isFetching, error } = useEscala(
      isParamsReady ? params : undefined
   );

   const buckets = useMemo(() => {
      if (!data) return [];
      return buildBuckets(data.sections, data.date_end);
   }, [data]);

   const skeletonColumns = Math.max(filters.funcs.length, 1);
   const showSkeleton = isParamsReady && isLoading && !data;

   return (
      <div className="flex flex-col space-y-2">
         <EscalaHeader />

         <EscalaFilters
            value={filters}
            onChange={setFilters}
            isFetching={isFetching}
         />

         {error && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
               {(error as Error).message}
            </div>
         )}

         <EscalaResults
            isParamsReady={isParamsReady}
            showSkeleton={showSkeleton}
            isFetching={isFetching}
            hasData={Boolean(data)}
            buckets={buckets}
            skeletonColumns={skeletonColumns}
         />
      </div>
   );
}

export default function EscalaPage() {
   return (
      <Suspense fallback={null}>
         <EscalaView />
      </Suspense>
   );
}
