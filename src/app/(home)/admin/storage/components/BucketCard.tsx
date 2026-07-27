"use client";

import { MdStorage } from "react-icons/md";
import { HiExclamationCircle } from "react-icons/hi";
import { formatSize } from "@/../utils/formatSize";
import { Skeleton } from "@/components/ui/Skeleton";
import type { BucketStats } from "services/routes/storage";

interface BucketCardProps {
   bucket: BucketStats;
   /** Soma de todos os buckets — base da participação, não a cota. */
   totalBytes: number;
   /** Algum bucket ficou ilegível: o denominador é uso APURADO, não total. */
   partial: boolean;
}

export function BucketCard({ bucket, totalBytes, partial }: BucketCardProps) {
   // Escalar pela COTA global fazia o bucket que responde por 92% do uso
   // renderizar com ~2px de barra (ele ocupa 0,38% da cota). A pergunta que
   // esta grade existe para responder é "quem está comendo o storage?" —
   // logo, a base é a participação no uso total.
   const share = totalBytes > 0 ? (bucket.total_size / totalBytes) * 100 : 0;

   return (
      // flex-col: no grid o card é esticado até a altura do irmão, e o corpo
      // do estado ilegível usa flex-1 para centrar em vez de ficar pendurado.
      <div className="flex flex-col space-y-3 rounded border border-slate-200 bg-white p-5 shadow-sm">
         <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-600 ring-1 ring-slate-200 ring-inset">
               <MdStorage className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-gray-900">{bucket.name}</h3>
         </div>

         {bucket.readable ? (
            <>
               <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-0.5">
                     <p className="text-sm text-gray-500">Tamanho</p>
                     <p className="text-lg font-bold text-gray-900 tabular-nums">
                        {formatSize(bucket.total_size)}
                     </p>
                  </div>
                  <div className="space-y-0.5">
                     <p className="text-sm text-gray-500">Arquivos</p>
                     <p className="text-lg font-bold text-gray-900 tabular-nums">
                        {bucket.total_objects}
                     </p>
                  </div>
               </div>

               {/* Barra proporcional à participação no uso total */}
               <div className="space-y-1">
                  {/* "do uso apurado" quando há bucket ilegível: o
                      denominador já perdeu aquele bucket, então o sobrevivente
                      reivindicaria 100% da torta sem ter direito a ela */}
                  <p className="text-sm text-gray-500 tabular-nums">
                     {share.toFixed(1)}%{" "}
                     {partial ? "do uso apurado" : "do uso total"}
                  </p>
                  <div
                     role="progressbar"
                     aria-label={`Participação do bucket ${bucket.name} no uso total`}
                     aria-valuenow={Number(share.toFixed(1))}
                     aria-valuemin={0}
                     aria-valuemax={100}
                     className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
                  >
                     {/* min-w-[3px]: um bucket residual precisa aparecer como
                         "quase nada", não como "nada" */}
                     <div
                        className="h-2 rounded-full bg-slate-600 transition-all"
                        style={{
                           width: share > 0 ? `max(3px, ${share}%)` : "0",
                        }}
                     />
                  </div>
               </div>
            </>
         ) : (
            // Bucket sem leitura: mostrar "0 B / 0 arquivos" seria afirmar
            // como fato um número que a API não conseguiu apurar. flex-1 +
            // items-center ancora a mensagem no meio da caixa — no grid este
            // card é esticado até a altura do irmão legível.
            <p
               role="status"
               className="flex flex-1 items-center gap-2 text-sm text-amber-800"
            >
               <HiExclamationCircle
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0"
               />
               Não foi possível ler o conteúdo deste bucket.
            </p>
         )}
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
               <Skeleton className="h-4 w-16" />
               <Skeleton className="h-6 w-20" />
            </div>
            <div className="space-y-1">
               <Skeleton className="h-4 w-16" />
               <Skeleton className="h-6 w-16" />
            </div>
         </div>
         <div className="space-y-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-2 w-full rounded-full" />
         </div>
      </div>
   );
}
