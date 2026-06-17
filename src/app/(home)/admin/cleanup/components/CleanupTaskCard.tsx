"use client";

import clsx from "clsx";
import type { CleanupTaskPreview } from "services/routes/cleanup";
import { Skeleton } from "@/components/ui/Skeleton";

export function CleanupTaskCard({ task }: { task: CleanupTaskPreview }) {
   return (
      <div className="space-y-1 rounded border border-slate-200 bg-white p-5 shadow-sm">
         <p className="text-sm font-medium text-gray-600">{task.description}</p>
         <p
            className={clsx(
               "text-3xl font-bold",
               task.count > 0 ? "text-red-600" : "text-green-600"
            )}
         >
            {task.count.toLocaleString("pt-BR")}
         </p>
         <p className="text-xs text-gray-400">
            {task.count === 1 ? "registro candidato" : "registros candidatos"}
         </p>
      </div>
   );
}

export function CleanupTaskCardSkeleton() {
   return (
      <div className="space-y-3 rounded border border-slate-200 bg-white p-5 shadow-sm">
         <Skeleton className="h-4 w-3/4" />
         <Skeleton className="h-9 w-16" />
         <Skeleton className="h-3 w-24" />
      </div>
   );
}
