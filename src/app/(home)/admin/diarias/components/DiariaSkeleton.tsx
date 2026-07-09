"use client";

import { Skeleton } from "@/components/ui/Skeleton";

// Padrão fixo de linhas por card de grupo (estável — evita flicker/hydration).
const GRUPOS_ROWS = [3, 3, 2, 2];

function TableRowsSkeleton({ rows }: { rows: number }) {
   return (
      <div className="hidden overflow-hidden rounded border border-slate-200 bg-white md:block">
         {/* Cabeçalho da tabela */}
         <div className="flex items-center gap-4 border-b border-slate-200 bg-gray-50 px-3 py-2">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
         </div>
         {/* Linhas */}
         {Array.from({ length: rows }).map((_, i) => (
            <div
               key={i}
               className="flex items-center gap-4 border-b border-slate-100 px-3 py-3 last:border-b-0"
            >
               <Skeleton className="h-4 w-40" />
               <Skeleton className="h-4 w-24" />
               <Skeleton className="h-4 w-20" />
               <Skeleton className="h-4 w-20" />
               <Skeleton className="h-5 w-16" />
               <div className="ml-auto flex gap-1">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
               </div>
            </div>
         ))}
      </div>
   );
}

export function DiariaSkeleton() {
   return (
      <div className="space-y-3">
         {GRUPOS_ROWS.map((rows, i) => (
            <div
               key={i}
               className="rounded border border-slate-200 bg-slate-50 p-4"
            >
               <Skeleton className="mb-3 h-4 w-56" />
               <TableRowsSkeleton rows={rows} />
            </div>
         ))}
      </div>
   );
}
