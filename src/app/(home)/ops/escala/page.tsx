"use client";
import { Suspense, useMemo } from "react";
import { useEscala } from "@/hooks/queries/useEscala";
import { todayIso } from "@/../utils/dateHandler";
import { EscalaFilters } from "./components/EscalaFilters";
import { EscalaHeader } from "./components/EscalaHeader";
import { EscalaResults } from "./components/EscalaResults";
import { ErrorState } from "./components/EmptyState";
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

   // Fonte única do "o filtro está completo?": devolve os params prontos ou
   // `null`. O hook não repete a checagem — antes havia duas cópias, e só esta
   // exigia `date_end >= date_start`.
   const params = useMemo<GetEscalaParams | null>(() => {
      if (
         !filters.date_start ||
         !filters.date_end ||
         filters.date_end < filters.date_start ||
         filters.tipo_quad_id === null ||
         filters.funcs.length === 0
      ) {
         return null;
      }
      return {
         date_start: filters.date_start,
         date_end: filters.date_end,
         tipo_quad_id: filters.tipo_quad_id,
         funcs: filters.funcs,
         sort: filters.sort,
      };
   }, [filters]);

   const isParamsReady = params !== null;

   const { data, isLoading, isFetching, error, refetch } = useEscala(
      params ?? undefined
   );

   const buckets = useMemo(() => {
      if (!data) return [];
      return buildBuckets(data.sections, data.date_end);
   }, [data]);

   const skeletonColumns = Math.max(filters.funcs.length, 1);
   const showSkeleton = isParamsReady && isLoading && !data;
   // Com `keepPreviousData` ligado, um refetch que falha mantém a escala
   // anterior em tela. Antes o aviso de erro aparecia ACIMA dela, e o usuário
   // via a falha e um resultado ao mesmo tempo sem saber qual valia.
   const showError = Boolean(error) && !data;

   return (
      <div className="flex flex-col space-y-2">
         <EscalaHeader />

         <EscalaFilters
            value={filters}
            onChange={setFilters}
            isFetching={isFetching}
         />

         {showError ? (
            <ErrorState
               message={(error as Error).message}
               onRetry={() => refetch()}
            />
         ) : (
            <>
               {/* Falhou o refetch mas há escala anterior em tela: não dá para
                   apagar um resultado bom, nem para deixar o usuário achando
                   que ele está atualizado. */}
               {error && (
                  <div
                     role="status"
                     className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900"
                  >
                     Não foi possível atualizar — exibindo o último resultado
                     carregado.
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
            </>
         )}
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
