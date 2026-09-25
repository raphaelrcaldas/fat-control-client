"use client";

import clsx from "clsx";
import { useAllBucketsStats } from "@/hooks/queries";
import { Skeleton } from "@/components/ui/Skeleton";
import { StorageHeader } from "./components/StorageHeader";
import { StorageCard, StorageCardSkeleton } from "./components/StorageCard";
import { BucketCard, BucketCardSkeleton } from "./components/BucketCard";
import { StorageErro } from "./components/StorageErro";
import { ordenarBuckets } from "./utils/buckets";

// Nº típico de buckets — usado só para dimensionar o skeleton sem inventar
// linhas a mais (a contagem real vem do backend).
const SKELETON_BUCKETS = [0, 1, 2];

export default function StoragePage() {
   const {
      data: stats,
      isLoading,
      isError,
      error,
      isFetching,
      refetch,
      dataUpdatedAt,
   } = useAllBucketsStats();

   const buckets = stats ? ordenarBuckets(stats.buckets) : [];

   return (
      <div className="space-y-2">
         <StorageHeader
            bucketCount={stats?.buckets.length}
            lastUpdated={stats ? dataUpdatedAt : undefined}
            isFetching={isFetching}
            onRefresh={() => refetch()}
         />

         {isLoading ? (
            <>
               <StorageCardSkeleton />
               {/* pt-2 + space-y-2 interno: o vão externo (14px) tem que ser
                   MAIOR que o interno (7px), senão o h2 fica equidistante e
                   não se lê como título da grade */}
               <section className="max-w-5xl space-y-2 pt-2">
                  <Skeleton className="h-6 w-32" />
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                     {SKELETON_BUCKETS.map((i) => (
                        <BucketCardSkeleton key={i} />
                     ))}
                  </div>
               </section>
            </>
         ) : !stats ? (
            // Nunca renderizar o card de uso a partir de dado ausente: com
            // `?? 0` a falha vira "0 B / 1,0 GB · OK", indistinguível de um
            // storage vazio e saudável.
            isError && (
               <StorageErro
                  error={error}
                  isFetching={isFetching}
                  onRetry={() => refetch()}
               />
            )
         ) : (
            <>
               {/* Falha num "Atualizar" depois de uma leitura boa: o dado
                   anterior continua valendo como referência — trocar a tela
                   inteira pelo alerta jogava fora o que já se sabia */}
               {isError && (
                  <StorageErro
                     error={error}
                     isFetching={isFetching}
                     onRetry={() => refetch()}
                     leituraAnterior={dataUpdatedAt}
                  />
               )}
               {/* Refetch esmaece o conteúdo em vez de cobrir com overlay:
                   o número antigo segue legível enquanto o novo não chega */}
               <div
                  aria-busy={isFetching}
                  className={clsx(
                     "space-y-2 transition-opacity",
                     isFetching && "opacity-50"
                  )}
               >
                  <StorageCard
                     title="Uso total do armazenamento"
                     totalBytes={stats.total_size}
                     totalObjects={stats.total_objects}
                     bucketCount={stats.buckets.length}
                     largestBucket={buckets.find((b) => b.readable)}
                     unreadableCount={
                        stats.buckets.filter((b) => !b.readable).length
                     }
                     maxMB={stats.quota_mb}
                  />

                  {/* max-w-5xl: mesma borda direita do card de uso acima */}
                  <section className="max-w-5xl space-y-2 pt-2">
                     {/* leading-tight: com a entrelinha default de 1.56 a
                         meia-entrelinha come a hierarquia do space-y-2 */}
                     <h2 className="text-lg leading-tight font-semibold text-slate-900">
                        Buckets
                     </h2>
                     {buckets.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                           {buckets.map((bucket) => (
                              <BucketCard
                                 key={bucket.name}
                                 bucket={bucket}
                                 totalBytes={stats.total_size}
                                 partial={buckets.some((b) => !b.readable)}
                              />
                           ))}
                        </div>
                     ) : (
                        <p className="rounded border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-gray-500">
                           Nenhum bucket no storage ainda. Cada módulo cria o
                           seu no primeiro arquivo enviado.
                        </p>
                     )}
                  </section>
               </div>
            </>
         )}
      </div>
   );
}
