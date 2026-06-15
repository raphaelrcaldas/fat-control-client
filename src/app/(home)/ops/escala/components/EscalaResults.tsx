import clsx from "clsx";
import { FuncSection } from "./FuncSection";
import { EmptyState, NoResultsState } from "./EmptyState";
import { EscalaSkeleton } from "./EscalaSkeleton";
import type { SectionBucket } from "../types";

interface EscalaResultsProps {
   isParamsReady: boolean;
   showSkeleton: boolean;
   isFetching: boolean;
   hasData: boolean;
   buckets: SectionBucket[];
   skeletonColumns: number;
}

export function EscalaResults({
   isParamsReady,
   showSkeleton,
   isFetching,
   hasData,
   buckets,
   skeletonColumns,
}: EscalaResultsProps) {
   if (!isParamsReady) return <EmptyState />;
   if (showSkeleton) return <EscalaSkeleton columns={skeletonColumns} />;
   if (hasData && buckets.length === 0) return <NoResultsState />;

   return (
      <div
         className={clsx(
            "flex flex-wrap items-start gap-4 transition-opacity",
            isFetching && "opacity-50"
         )}
      >
         {buckets.map((bucket, idx) => (
            <FuncSection key={bucket.func} bucket={bucket} index={idx + 1} />
         ))}
      </div>
   );
}
