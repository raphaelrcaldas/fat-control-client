"use client";

import { Skeleton } from "@/components/ui/Skeleton";

/** Espelha a lista de candidatos do MatriculaModal (checkbox, trigrama, nome). */
export function MatriculaListSkeleton({ rows = 6 }: { rows?: number }) {
   return (
      <div role="status">
         <span className="sr-only">Carregando tripulantes…</span>
         <div aria-hidden className="max-h-[50vh] space-y-1 overflow-hidden">
            {Array.from({ length: rows }).map((_, i) => (
               <div
                  key={i}
                  className="flex min-h-[calc(2.25rem+2px)] items-center gap-3 rounded border border-slate-200 p-2"
               >
                  <Skeleton className="h-4 w-4 shrink-0" />
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-4 flex-1" />
               </div>
            ))}
         </div>
      </div>
   );
}
