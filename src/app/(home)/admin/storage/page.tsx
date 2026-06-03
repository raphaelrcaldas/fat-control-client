"use client";

import { MdStorage } from "react-icons/md";
import { useAllBucketsStats } from "@/hooks/queries";
import { Skeleton } from "@/components/ui/Skeleton";
import type { BucketStats } from "services/routes/aeromedica/atas";
import { formatSize } from "@/../utils/formatSize";

const MAX_STORAGE_MB = 1024;

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

function StorageCard({
   title,
   subtitle,
   totalBytes,
   totalObjects,
   maxMB,
}: {
   title: string;
   subtitle?: string;
   totalBytes: number;
   totalObjects: number;
   maxMB: number;
}) {
   const totalMB = totalBytes / (1024 * 1024);
   const percent = Math.min((totalMB / maxMB) * 100, 100);
   const usage = getUsageColor(percent);

   return (
      <div className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
         {subtitle && (
            <p className="mb-3 text-xs font-medium tracking-wide text-gray-400 uppercase dark:text-gray-500">
               {subtitle}
            </p>
         )}
         <div className="mb-4 flex items-end justify-between">
            <div>
               <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {title}
               </p>
               <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                  {formatSize(totalBytes)}
                  <span className="ml-1 text-lg font-normal text-gray-500">
                     / {maxMB} MB
                  </span>
               </p>
            </div>
            <div className="text-right">
               <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${usage.badge}`}
               >
                  {usage.label}
               </span>
               <p className={`mt-1 text-2xl font-bold ${usage.text}`}>
                  {percent.toFixed(1)}%
               </p>
            </div>
         </div>

         <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
               className={`h-4 rounded-full transition-all ${usage.bar}`}
               style={{ width: `${percent}%` }}
            />
         </div>

         <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
               <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total de arquivos
               </p>
               <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {totalObjects}
               </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
               <p className="text-sm text-gray-500 dark:text-gray-400">
                  Espaço disponível
               </p>
               <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatSize((maxMB - totalMB) * 1024 * 1024)}
               </p>
            </div>
         </div>
      </div>
   );
}

function BucketCard({ bucket }: { bucket: BucketStats }) {
   const sizeMB = bucket.total_size / (1024 * 1024);

   return (
      <div className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
         <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
               <MdStorage className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
               {bucket.name}
            </h3>
         </div>

         <div className="grid grid-cols-2 gap-3">
            <div>
               <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tamanho
               </p>
               <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatSize(bucket.total_size)}
               </p>
            </div>
            <div>
               <p className="text-xs text-gray-500 dark:text-gray-400">
                  Arquivos
               </p>
               <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {bucket.total_objects}
               </p>
            </div>
         </div>

         {/* Mini progress bar proporcional */}
         <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-400">
               <span>{sizeMB.toFixed(2)} MB</span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
               <div
                  className="h-2 rounded-full bg-blue-500 transition-all"
                  style={{
                     width: `${Math.min((sizeMB / MAX_STORAGE_MB) * 100, 100)}%`,
                  }}
               />
            </div>
         </div>
      </div>
   );
}

export default function StoragePage() {
   const { data: stats, isLoading } = useAllBucketsStats();

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="flex items-center gap-3">
            <MdStorage className="h-8 w-8 text-gray-700 dark:text-gray-300" />
            <div>
               <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Storage
               </h1>
               <p className="text-sm text-gray-500 dark:text-gray-400">
                  Monitoramento do armazenamento — total e por bucket
               </p>
            </div>
         </div>

         {isLoading ? (
            <div className="space-y-6">
               <Skeleton className="h-64 w-full" />
               <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                     <Skeleton key={i} className="h-48 w-full" />
                  ))}
               </div>
            </div>
         ) : (
            <>
               {/* Card total */}
               <StorageCard
                  title="Uso total do armazenamento"
                  subtitle="Todos os buckets"
                  totalBytes={stats?.total_size ?? 0}
                  totalObjects={stats?.total_objects ?? 0}
                  maxMB={MAX_STORAGE_MB}
               />

               {/* Buckets individuais */}
               {stats?.buckets && stats.buckets.length > 0 && (
                  <div>
                     <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                        Buckets ({stats.buckets.length})
                     </h2>
                     <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {stats.buckets.map((bucket) => (
                           <BucketCard key={bucket.name} bucket={bucket} />
                        ))}
                     </div>
                  </div>
               )}
            </>
         )}
      </div>
   );
}
