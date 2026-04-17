"use client";

import clsx from "clsx";

interface SkeletonProps {
   className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
   return (
      <div
         className={clsx(
            "animate-pulse rounded-md bg-gray-200 dark:bg-gray-700",
            className
         )}
      />
   );
}

export function TableSkeleton({
   rows = 5,
   cols = 4,
}: {
   rows?: number;
   cols?: number;
}) {
   return (
      <div className="w-full space-y-4">
         <div className="flex space-x-4">
            {Array.from({ length: cols }).map((_, i) => (
               <Skeleton key={i} className="h-4 flex-1" />
            ))}
         </div>
         {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex space-x-4">
               {Array.from({ length: cols }).map((_, j) => (
                  <Skeleton key={j} className="h-10 flex-1" />
               ))}
            </div>
         ))}
      </div>
   );
}
