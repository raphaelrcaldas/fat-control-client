"use client";

import { Skeleton } from "@/components/ui/Skeleton";

/** Espelha a lista do PaopSubprogramasModal (checkbox, código, descrição e os dois badges). */
export function PaopSubprogramasListSkeleton({ rows = 6 }: { rows?: number }) {
   return (
      <div role="status">
         <span className="sr-only">Carregando subprogramas…</span>
         <div aria-hidden className="max-h-[50vh] space-y-1 overflow-hidden">
            {Array.from({ length: rows }).map((_, i) => (
               <div
                  key={i}
                  className="flex min-h-[calc(2.25rem+2px)] items-center gap-3 rounded border border-slate-200 p-2"
               >
                  <Skeleton className="h-4 w-4 shrink-0" />
                  <Skeleton className="h-4 w-16 shrink-0" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-5 w-28 shrink-0" />
                  <Skeleton className="h-5 w-12 shrink-0" />
               </div>
            ))}
         </div>
      </div>
   );
}
