"use client";

import { Skeleton } from "@/components/ui/Skeleton";

/** Espelha a barra de anos + os cards de subprograma do plano. */
export function PaopSkeleton() {
   return (
      <div className="space-y-2">
         <div className="flex items-center gap-4 rounded border border-slate-200 bg-white p-3 shadow-sm">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="ml-auto h-7 w-52" />
         </div>

         {Array.from({ length: 3 }).map((_, i) => (
            <div
               key={i}
               className="space-y-2 rounded border border-slate-200 bg-white p-3 shadow-sm"
            >
               <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="ml-auto h-5 w-28" />
                  <Skeleton className="h-5 w-12" />
               </div>
               <div className="flex gap-1.5 border-t border-slate-100 pt-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-32" />
               </div>
            </div>
         ))}
      </div>
   );
}
