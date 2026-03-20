"use client";

import { useState } from "react";
import { Button, Spinner } from "flowbite-react";
import { MdStorage } from "react-icons/md";
import { HiExclamation, HiTrash } from "react-icons/hi";
import { useAllBucketsStats, useAtasOrfas, useDeleteAtasOrfas } from "@/hooks/queries";
import { useToast } from "@/app/context/toast";
import type { BucketStats, AtaOrfaPublic } from "services/routes/aeromedica/atas";

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

function formatSize(bytes: number) {
   if (bytes === 0) return "0 B";
   const mb = bytes / (1024 * 1024);
   if (mb >= 1) return `${mb.toFixed(1)} MB`;
   const kb = bytes / 1024;
   if (kb >= 1) return `${kb.toFixed(1)} KB`;
   return `${bytes} B`;
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
      <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
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

function AtasOrfasSection() {
   const { push } = useToast();
   const { data: orfas, isLoading } = useAtasOrfas();
   const deleteMutation = useDeleteAtasOrfas();
   const [showConfirm, setShowConfirm] = useState(false);

   const handleDelete = async () => {
      try {
         await deleteMutation.mutateAsync();
         push({ message: "Atas órfãs removidas com sucesso", type: "success" });
      } catch (err: unknown) {
         const message =
            err instanceof Error ? err.message : "Erro ao remover atas";
         push({ title: "Erro", message, type: "error" });
      } finally {
         setShowConfirm(false);
      }
   };

   if (isLoading || !orfas || orfas.total_atas === 0) return null;

   // Agrupar por usuário
   const porUsuario = orfas.atas.reduce(
      (acc, ata) => {
         const key = ata.user_id;
         if (!acc[key]) {
            acc[key] = {
               nome_guerra: ata.nome_guerra,
               atas: [],
               total_size: 0,
            };
         }
         acc[key].atas.push(ata);
         acc[key].total_size += ata.file_size;
         return acc;
      },
      {} as Record<
         number,
         { nome_guerra: string; atas: AtaOrfaPublic[]; total_size: number }
      >
   );

   return (
      <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/10">
         <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
               <HiExclamation className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
               <div>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                     {orfas.total_atas} ata(s) de usuários inativos
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                     Ocupando {formatSize(orfas.total_size)}
                  </p>
               </div>
            </div>

            {showConfirm ? (
               <div className="flex items-center gap-2">
                  <Button
                     color="red"
                     size="xs"
                     onClick={handleDelete}
                     disabled={deleteMutation.isPending}
                  >
                     {deleteMutation.isPending ? "..." : "Confirmar"}
                  </Button>
                  <Button
                     color="gray"
                     size="xs"
                     onClick={() => setShowConfirm(false)}
                     disabled={deleteMutation.isPending}
                  >
                     Cancelar
                  </Button>
               </div>
            ) : (
               <Button
                  color="red"
                  size="xs"
                  onClick={() => setShowConfirm(true)}
               >
                  <HiTrash className="mr-1.5 h-3.5 w-3.5" />
                  Limpar
               </Button>
            )}
         </div>

         <div className="mt-3 space-y-1.5">
            {Object.entries(porUsuario).map(([userId, grupo]) => (
               <div
                  key={userId}
                  className="flex items-center justify-between rounded-md bg-white/60 px-3 py-2 dark:bg-gray-800/40"
               >
                  <div>
                     <span className="text-xs font-semibold text-gray-900 uppercase dark:text-white">
                        {grupo.nome_guerra}
                     </span>
                     <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        {grupo.atas.length} ata(s)
                     </span>
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                     {formatSize(grupo.total_size)}
                  </span>
               </div>
            ))}
         </div>
      </div>
   );
}

function BucketCard({ bucket }: { bucket: BucketStats }) {
   const sizeMB = bucket.total_size / (1024 * 1024);
   const isAtasBucket = bucket.name === "atas-inspecao";

   return (
      <div className="rounded-lg border bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
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

         {isAtasBucket && <AtasOrfasSection />}
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
            <div className="flex justify-center py-12">
               <Spinner color="failure" size="xl" />
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
