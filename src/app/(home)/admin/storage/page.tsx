"use client";

import { Alert, Button } from "flowbite-react";
import { HiExclamation, HiRefresh } from "react-icons/hi";
import { useAllBucketsStats } from "@/hooks/queries";
import { Skeleton } from "@/components/ui/Skeleton";
import { StorageHeader } from "./components/StorageHeader";
import { StorageCard, StorageCardSkeleton } from "./components/StorageCard";
import { BucketCard, BucketCardSkeleton } from "./components/BucketCard";

// Nº típico de buckets — usado só para dimensionar o skeleton sem inventar
// linhas a mais (a contagem real vem do backend).
const SKELETON_BUCKETS = [0, 1];

// Mesma string do fallback em services/routes/storage.ts — comparada abaixo
// para não imprimir a frase duas vezes quando o backend não manda `message`.
const TITULO_ERRO = "Não foi possível ler o storage.";

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
               <section className="space-y-2 pt-2">
                  <Skeleton className="h-6 w-32" />
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                     {SKELETON_BUCKETS.map((i) => (
                        <BucketCardSkeleton key={i} />
                     ))}
                  </div>
               </section>
            </>
         ) : isError ? (
            // Nunca renderizar o card de uso a partir de dado ausente: com
            // `?? 0` a falha vira "0 B / 1024 MB · OK", indistinguível de um
            // storage vazio e saudável.
            <Alert color="failure" icon={HiExclamation}>
               <div className="flex flex-wrap items-center justify-between gap-3">
                  <span>
                     <span className="font-semibold">{TITULO_ERRO}</span>{" "}
                     {/* Sem storage, o fallback do service é a MESMA string do
                         título — repeti-la só duplicaria a frase na tela */}
                     {error instanceof Error && error.message !== TITULO_ERRO
                        ? error.message
                        : ""}
                  </span>
                  <Button
                     color="light"
                     size="sm"
                     onClick={() => refetch()}
                     disabled={isFetching}
                  >
                     <HiRefresh className="mr-2 size-4" />
                     Tentar novamente
                  </Button>
               </div>
            </Alert>
         ) : (
            stats && (
               <>
                  <StorageCard
                     title="Uso total do armazenamento"
                     subtitle="Todos os buckets"
                     totalBytes={stats.total_size}
                     totalObjects={stats.total_objects}
                     bucketCount={stats.buckets.length}
                     largestBucket={
                        [...stats.buckets].sort(
                           (a, b) => b.total_size - a.total_size
                        )[0]
                     }
                     unreadableCount={
                        stats.buckets.filter((b) => !b.readable).length
                     }
                     maxMB={stats.quota_mb}
                  />

                  {stats.buckets.length > 0 && (
                     <section className="space-y-2 pt-2">
                        {/* leading-tight: com a entrelinha default de 1.56 a
                            meia-entrelinha come a hierarquia do space-y-2 */}
                        <h2 className="text-lg leading-tight font-semibold text-slate-900">
                           Buckets ({stats.buckets.length})
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                           {stats.buckets.map((bucket) => (
                              <BucketCard
                                 key={bucket.name}
                                 bucket={bucket}
                                 totalBytes={stats.total_size}
                                 partial={stats.buckets.some(
                                    (b) => !b.readable
                                 )}
                              />
                           ))}
                        </div>
                     </section>
                  )}
               </>
            )
         )}
      </div>
   );
}
