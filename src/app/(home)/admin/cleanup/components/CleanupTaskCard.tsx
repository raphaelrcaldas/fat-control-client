"use client";

import clsx from "clsx";
import { Button, Spinner } from "flowbite-react";
import { MdDelete } from "react-icons/md";
import type { CleanupTaskPreview } from "services/routes/cleanup";
import { Skeleton } from "@/components/ui/Skeleton";

interface CleanupTaskCardProps {
   task: CleanupTaskPreview;
   disabled: boolean;
   running: boolean;
   onRun: () => void;
}

export function CleanupTaskCard({
   task,
   disabled,
   running,
   onRun,
}: CleanupTaskCardProps) {
   return (
      <div className="flex h-full flex-col gap-4 rounded border border-slate-200 bg-white p-5 shadow-sm">
         <h2 className="text-sm leading-5 font-medium text-slate-700">
            {task.description}
         </h2>
         <div className="mt-auto flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1">
               <p
                  className={clsx(
                     "text-3xl leading-none font-bold tabular-nums",
                     task.count > 0 ? "text-red-600" : "text-green-700"
                  )}
               >
                  {task.count.toLocaleString("pt-BR")}
               </p>
               <p className="text-xs leading-5 text-slate-500">
                  {task.count === 1
                     ? "registro candidato"
                     : "registros candidatos"}
               </p>
            </div>
            <Button
               color="red"
               size="sm"
               className="min-h-[32px] shrink-0"
               disabled={disabled || task.count === 0}
               onClick={onRun}
               aria-label={`Excluir: ${task.description}`}
            >
               {running ? (
                  <>
                     <Spinner size="sm" color="primary" className="mr-2" />
                     Executando...
                  </>
               ) : (
                  <>
                     <MdDelete className="mr-2 size-4" />
                     Excluir
                  </>
               )}
            </Button>
         </div>
      </div>
   );
}

export function CleanupTaskCardSkeleton() {
   return (
      <div className="flex h-full flex-col gap-4 rounded border border-slate-200 bg-white p-5 shadow-sm">
         <Skeleton className="h-4 w-3/4" />
         <div className="mt-auto flex items-end justify-between gap-3">
            <div className="space-y-2">
               <Skeleton className="h-8 w-16" />
               <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-8 w-20" />
         </div>
      </div>
   );
}
