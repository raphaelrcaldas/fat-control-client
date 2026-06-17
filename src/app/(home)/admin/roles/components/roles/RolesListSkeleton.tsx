"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export function RolesListSkeleton({ rows = 6 }: { rows?: number }) {
   return (
      <div className="space-y-3">
         {Array.from({ length: rows }).map((_, i) => (
            <div
               key={i}
               className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm"
            >
               <div className="flex w-full items-center gap-4 p-4">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <div className="flex-1 space-y-2">
                     <Skeleton className="h-5 w-32 rounded-md" />
                     <Skeleton className="h-4 w-56" />
                  </div>
                  <div className="hidden w-40 space-y-2 sm:block">
                     <Skeleton className="h-3 w-full" />
                     <Skeleton className="h-1.5 w-full rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-4" />
               </div>
            </div>
         ))}
      </div>
   );
}
