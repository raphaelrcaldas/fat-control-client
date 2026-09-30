"use client";

import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Espelha a lista de AtaCard do AtasTab: badge de finalidade, divisor, duas
 * linhas `text-sm` (Realização/Validade) e o botão de ação à direita.
 */
export default function AtasTabSkeleton({ cards = 2 }: { cards?: number }) {
   return (
      <div role="status">
         <span className="sr-only">Carregando atas…</span>
         <div aria-hidden className="space-y-2">
            {Array.from({ length: cards }).map((_, i) => (
               <div
                  key={i}
                  className="rounded border border-slate-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
               >
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Skeleton className="h-5 w-24" />
                        <div className="h-8 w-px bg-gray-200 dark:bg-gray-600" />
                        <div className="space-y-0.5">
                           {/* Altura presa ao line-box do `text-sm` (1,25rem). */}
                           <div className="flex h-5 items-center">
                              <Skeleton className="h-3.5 w-36" />
                           </div>
                           <div className="flex h-5 items-center">
                              <Skeleton className="h-3.5 w-32" />
                           </div>
                        </div>
                     </div>
                     <Skeleton className="size-8" />
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}
