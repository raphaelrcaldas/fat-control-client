"use client";

import { useAllBucketsStats } from "@/hooks/queries";
import { Skeleton } from "@/components/ui/Skeleton";
import { StorageHeader } from "./components/StorageHeader";
import { StorageCard, StorageCardSkeleton } from "./components/StorageCard";
import { BucketCard, BucketCardSkeleton } from "./components/BucketCard";

const MAX_STORAGE_MB = 1024;
const SKELETON_BUCKETS = [0, 1, 2];

export default function StoragePage() {
   const { data: stats, isLoading } = useAllBucketsStats();

   return (
      <div className="space-y-2">
         <StorageHeader />

         {isLoading ? (
            <>
               <StorageCardSkeleton />
               <div className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                     {SKELETON_BUCKETS.map((i) => (
                        <BucketCardSkeleton key={i} />
                     ))}
                  </div>
               </div>
            </>
         ) : (
            <>
               <StorageCard
                  title="Uso total do armazenamento"
                  subtitle="Todos os buckets"
                  totalBytes={stats?.total_size ?? 0}
                  totalObjects={stats?.total_objects ?? 0}
                  maxMB={MAX_STORAGE_MB}
               />

               {stats?.buckets && stats.buckets.length > 0 && (
                  <section className="space-y-4">
                     <h2 className="text-lg font-semibold text-gray-900">
                        Buckets ({stats.buckets.length})
                     </h2>
                     <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {stats.buckets.map((bucket) => (
                           <BucketCard
                              key={bucket.name}
                              bucket={bucket}
                              maxMB={MAX_STORAGE_MB}
                           />
                        ))}
                     </div>
                  </section>
               )}
            </>
         )}
      </div>
   );
}
