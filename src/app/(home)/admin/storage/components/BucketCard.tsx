"use client";

import { MdStorage } from "react-icons/md";
import { formatSize } from "@/../utils/formatSize";
import { Skeleton } from "@/components/ui/Skeleton";
import type { BucketStats } from "services/routes/aeromedica/atas";

interface BucketCardProps {
   bucket: BucketStats;
   maxMB: number;
}

export function BucketCard({ bucket, maxMB }: BucketCardProps) {
   const sizeMB = bucket.total_size / (1024 * 1024);
   const percent = Math.min((sizeMB / maxMB) * 100, 100);

   return (
      <div className="space-y-3 rounded border border-slate-200 bg-white p-5 shadow-sm">
         <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-500">
               <MdStorage className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-gray-900">{bucket.name}</h3>
         </div>

         <div className="grid grid-cols-2 gap-3">
            <div className="space-y-0.5">
               <p className="text-xs text-gray-500">Tamanho</p>
               <p className="text-lg font-bold text-gray-900">
                  {formatSize(bucket.total_size)}
               </p>
            </div>
            <div className="space-y-0.5">
               <p className="text-xs text-gray-500">Arquivos</p>
               <p className="text-lg font-bold text-gray-900">
                  {bucket.total_objects}
               </p>
            </div>
         </div>

         {/* Mini progress bar proporcional à cota total */}
         <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
               <span>{sizeMB.toFixed(2)} MB</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
               <div
                  className="h-2 rounded-full bg-slate-400 transition-all"
                  style={{ width: `${percent}%` }}
               />
            </div>
         </div>
      </div>
   );
}

export function BucketCardSkeleton() {
   return (
      <div className="space-y-3 rounded border border-slate-200 bg-white p-5 shadow-sm">
         <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-5 w-28" />
         </div>
         <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
               <Skeleton className="h-3 w-16" />
               <Skeleton className="h-6 w-20" />
            </div>
            <div className="space-y-1">
               <Skeleton className="h-3 w-16" />
               <Skeleton className="h-6 w-16" />
            </div>
         </div>
         <div className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-2 w-full rounded-full" />
         </div>
      </div>
   );
}
