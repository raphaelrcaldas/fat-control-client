"use client";

import { Skeleton } from "@/components/ui/Skeleton";

const COLS_TEMPLATE = "grid-cols-[2fr_1.2fr_1fr_1fr]";

export function AcessosSkeleton() {
   return (
      <div className="overflow-hidden rounded-lg bg-white shadow-md">
         {/* Cabeçalho: título, ações e busca */}
         <div className="border-b border-gray-200 bg-gray-50 p-4">
            <div className="mb-3 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
               <div className="space-y-2">
                  <Skeleton className="h-6 w-52" />
                  <Skeleton className="h-4 w-72" />
               </div>
               <div className="flex gap-2">
                  <Skeleton className="h-9 w-10" />
                  <Skeleton className="h-9 w-28" />
               </div>
            </div>
            <Skeleton className="h-10 w-full" />
         </div>

         {/* Cabeçalho da tabela */}
         <div
            className={`hidden gap-4 border-b border-gray-200 px-4 py-3 sm:grid ${COLS_TEMPLATE}`}
         >
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="mx-auto h-4 w-14" />
         </div>

         {/* Linhas */}
         <div className="divide-y divide-gray-200">
            {Array.from({ length: 8 }).map((_, i) => (
               <div
                  key={i}
                  className={`grid items-center gap-4 px-4 py-3 ${COLS_TEMPLATE}`}
               >
                  <div className="flex items-center gap-3">
                     <Skeleton className="size-10 shrink-0 rounded-full" />
                     <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-md" />
                  <div className="flex justify-center gap-2">
                     <Skeleton className="size-8 rounded-lg" />
                     <Skeleton className="size-8 rounded-lg" />
                     <Skeleton className="size-8 rounded-lg" />
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}
