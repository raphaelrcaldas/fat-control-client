"use client";

import clsx from "clsx";
import { formatSize } from "@/../utils/formatSize";
import { Skeleton } from "@/components/ui/Skeleton";

function getUsageColor(percent: number) {
   if (percent >= 90)
      return {
         bar: "bg-red-600",
         text: "text-red-600",
         badge: "bg-red-600/10 text-red-600",
         label: "Crítico",
      };
   if (percent >= 70)
      return {
         bar: "bg-yellow-500",
         text: "text-yellow-600",
         badge: "bg-yellow-500/10 text-yellow-600",
         label: "Atenção",
      };
   return {
      bar: "bg-green-500",
      text: "text-green-600",
      badge: "bg-green-500/10 text-green-600",
      label: "OK",
   };
}

interface StorageCardProps {
   title: string;
   subtitle?: string;
   totalBytes: number;
   totalObjects: number;
   maxMB: number;
}

export function StorageCard({
   title,
   subtitle,
   totalBytes,
   totalObjects,
   maxMB,
}: StorageCardProps) {
   const totalMB = totalBytes / (1024 * 1024);
   const percent = Math.min((totalMB / maxMB) * 100, 100);
   const usage = getUsageColor(percent);

   return (
      <div className="space-y-4 rounded border border-slate-200 bg-white p-6 shadow-sm">
         {subtitle && (
            <p className="text-xs font-medium tracking-wide text-gray-400 uppercase">
               {subtitle}
            </p>
         )}

         <div className="flex items-end justify-between">
            <div className="space-y-1">
               <p className="text-sm font-medium text-gray-500">{title}</p>
               <p className="text-3xl font-bold text-gray-900">
                  {formatSize(totalBytes)}
                  <span className="ml-1 text-lg font-normal text-gray-500">
                     / {maxMB} MB
                  </span>
               </p>
            </div>
            <div className="space-y-1 text-right">
               <span
                  className={clsx(
                     "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold",
                     usage.badge
                  )}
               >
                  {usage.label}
               </span>
               <p className={clsx("text-2xl font-bold", usage.text)}>
                  {percent.toFixed(1)}%
               </p>
            </div>
         </div>

         <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
            <div
               className={clsx("h-4 rounded-full transition-all", usage.bar)}
               style={{ width: `${percent}%` }}
            />
         </div>

         <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 rounded bg-slate-50 p-4">
               <p className="text-sm text-gray-500">Total de arquivos</p>
               <p className="text-2xl font-bold text-gray-900">
                  {totalObjects}
               </p>
            </div>
            <div className="space-y-1 rounded bg-slate-50 p-4">
               <p className="text-sm text-gray-500">Espaço disponível</p>
               <p className="text-2xl font-bold text-gray-900">
                  {formatSize((maxMB - totalMB) * 1024 * 1024)}
               </p>
            </div>
         </div>
      </div>
   );
}

export function StorageCardSkeleton() {
   return (
      <div className="space-y-4 rounded border border-slate-200 bg-white p-6 shadow-sm">
         <Skeleton className="h-3 w-32" />
         <div className="flex items-end justify-between">
            <div className="space-y-2">
               <Skeleton className="h-4 w-40" />
               <Skeleton className="h-9 w-48" />
            </div>
            <div className="flex flex-col items-end gap-2">
               <Skeleton className="h-6 w-16 rounded-full" />
               <Skeleton className="h-7 w-16" />
            </div>
         </div>
         <Skeleton className="h-4 w-full rounded-full" />
         <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
         </div>
      </div>
   );
}
