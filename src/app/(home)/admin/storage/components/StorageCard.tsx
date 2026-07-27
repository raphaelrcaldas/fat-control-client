"use client";

import clsx from "clsx";
import { HiExclamation } from "react-icons/hi";
import { formatSize } from "@/../utils/formatSize";
import { Skeleton } from "@/components/ui/Skeleton";

function getUsageColor(percent: number) {
   // Semântica de saturação (perigo/atenção/ok), não cor de marca. Os tons são
   // escuros porque *-500/600 reprovam AA como texto sobre branco — e o badge
   // pede um passo a mais que o texto solto: o fundo *-600/10 clareia o campo e
   // come a margem de contraste. A barra precisa de 3:1 contra a trilha
   // slate-200 (WCAG 1.4.11), o que descarta amber-500 (1,73:1).
   if (percent >= 90)
      return {
         bar: "bg-red-600",
         text: "text-red-700",
         badge: "bg-red-600/10 text-red-800",
         label: "Crítico",
         // Crítico é o único estado com ícone: reforço por FORMA, para o
         // alarme não depender só da cor — e não se confundir com o vermelho
         // da marca quando a org ativa tem tema vermelho.
         critical: true,
      };
   if (percent >= 70)
      return {
         bar: "bg-amber-700",
         text: "text-amber-700",
         badge: "bg-amber-500/10 text-amber-800",
         label: "Atenção",
         critical: false,
      };
   return {
      bar: "bg-green-700",
      text: "text-green-700",
      badge: "bg-green-600/10 text-green-800",
      label: "OK",
      critical: false,
   };
}

interface StorageCardProps {
   title: string;
   subtitle?: string;
   totalBytes: number;
   totalObjects: number;
   bucketCount: number;
   /** Maior bucket por tamanho — a 2ª pergunta de quem abre esta tela. */
   largestBucket?: { name: string; total_size: number };
   /** Buckets que a API não conseguiu ler — entram no total como 0. */
   unreadableCount: number;
   maxMB: number;
}

export function StorageCard({
   title,
   subtitle,
   totalBytes,
   totalObjects,
   bucketCount,
   largestBucket,
   unreadableCount,
   maxMB,
}: StorageCardProps) {
   const totalMB = totalBytes / (1024 * 1024);
   const percent = Math.min((totalMB / maxMB) * 100, 100);

   // Nenhum bucket pôde ser lido: TODO número aqui derivaria de zero
   // conhecimento. Um farol verde "OK · 0.0% · 1024 MB disponíveis" seria
   // seis afirmações confiantes sobre nada — o estado vira indeterminado,
   // em slate (o mesmo neutro do chrome de admin de sistema).
   const semLeitura = bucketCount > 0 && unreadableCount === bucketCount;
   const usage = semLeitura
      ? {
           bar: "bg-slate-300",
           text: "text-slate-600",
           badge: "bg-slate-600/10 text-slate-700",
           label: "Sem leitura",
           critical: false,
        }
      : getUsageColor(percent);
   // Leitura parcial: o total apurado é um PISO, não o valor real.
   const piso = !semLeitura && unreadableCount > 0;

   return (
      // max-w-5xl: em 1920 o card esticado abria ~1400px entre o título e o
      // seu próprio status, quebrando a leitura por proximidade.
      <div className="max-w-5xl space-y-4 rounded border border-slate-200 bg-white p-6 shadow-sm">
         {subtitle && (
            <p className="text-sm font-medium tracking-wide text-gray-500 uppercase">
               {subtitle}
            </p>
         )}

         <div className="flex items-end justify-between gap-4">
            <div className="space-y-1">
               <p className="text-sm font-medium text-gray-500">{title}</p>
               <p className="text-3xl font-bold text-gray-900 tabular-nums">
                  {semLeitura
                     ? "—"
                     : `${piso ? "≥ " : ""}${formatSize(totalBytes)}`}
                  <span className="ml-1 text-lg font-normal text-gray-500">
                     / {maxMB} MB
                  </span>
               </p>
            </div>
            <div className="space-y-1 text-right">
               <span
                  className={clsx(
                     "inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold",
                     usage.badge
                  )}
               >
                  {usage.critical && (
                     <HiExclamation aria-hidden className="size-4" />
                  )}
                  {usage.label}
               </span>
               <p
                  className={clsx(
                     "text-2xl font-bold tabular-nums",
                     usage.text
                  )}
               >
                  {semLeitura ? "—" : `${percent.toFixed(1)}%`}
               </p>
            </div>
         </div>

         {unreadableCount > 0 && (
            // Sem este aviso o total volta a mentir por omissão: bucket
            // ilegível entra na soma como 0, então o uso real é MAIOR que o
            // exibido — e o farol, mais otimista que a realidade.
            // role="status": num refetch o aviso aparece sem nenhum outro
            // sinal — quem usa leitor de tela não teria como saber.
            <p
               role="status"
               className="flex items-start gap-2 text-sm text-amber-800"
            >
               <HiExclamation aria-hidden className="mt-0.5 size-4 shrink-0" />
               {semLeitura
                  ? "Nenhum bucket pôde ser lido — os números abaixo não puderam ser apurados."
                  : unreadableCount === 1
                    ? "1 bucket não pôde ser lido e conta como 0 aqui — o uso real é maior."
                    : `${unreadableCount} buckets não puderam ser lidos e contam como 0 aqui — o uso real é maior.`}
            </p>
         )}

         <div
            role="progressbar"
            aria-label="Uso da cota de armazenamento"
            aria-valuenow={semLeitura ? undefined : Number(percent.toFixed(1))}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={
               semLeitura
                  ? "indeterminado"
                  : `${percent.toFixed(1)}% — ${usage.label}`
            }
            className="h-4 w-full overflow-hidden rounded-full bg-slate-200"
         >
            <div
               className={clsx("h-4 rounded-full transition-all", usage.bar)}
               style={{ width: semLeitura ? "0%" : `${percent}%` }}
            />
         </div>

         {/* Fileira de 4: densifica o topo e responde de uma vez "quanto usei /
             quanto sobra / quantos arquivos / quantos buckets" */}
         <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {/* "Em uso" repetiria o número-herói 80px acima — este slot vale
                mais respondendo quem ocupa o espaço */}
            {/* col-span-2 no mobile: nome + tamanho pedem ~172px e o tile de
                meia-largura só dá 120px — o `truncate` comia justamente o
                número, que é a razão de o tile existir */}
            <div className="col-span-2 space-y-1 rounded bg-slate-50 p-4 lg:col-span-1">
               <p className="text-sm text-gray-500">Maior bucket</p>
               {largestBucket && !semLeitura ? (
                  <p className="truncate text-2xl font-bold text-gray-900">
                     {largestBucket.name}{" "}
                     <span className="text-lg font-normal text-gray-500 tabular-nums">
                        {formatSize(largestBucket.total_size)}
                     </span>
                  </p>
               ) : (
                  <p className="text-2xl font-bold text-gray-500">—</p>
               )}
            </div>
            <div className="space-y-1 rounded bg-slate-50 p-4">
               <p className="text-sm text-gray-500">Espaço disponível</p>
               <p className="text-2xl font-bold text-gray-900 tabular-nums">
                  {semLeitura
                     ? "—"
                     : formatSize(Math.max(maxMB - totalMB, 0) * 1024 * 1024)}
               </p>
            </div>
            <div className="space-y-1 rounded bg-slate-50 p-4">
               <p className="text-sm text-gray-500">Total de arquivos</p>
               <p className="text-2xl font-bold text-gray-900 tabular-nums">
                  {semLeitura ? "—" : totalObjects}
               </p>
            </div>
            <div className="space-y-1 rounded bg-slate-50 p-4">
               <p className="text-sm text-gray-500">Buckets</p>
               <p className="text-2xl font-bold text-gray-900 tabular-nums">
                  {bucketCount}
               </p>
            </div>
         </div>
      </div>
   );
}

export function StorageCardSkeleton() {
   return (
      // Alturas espelham a ENTRELINHA do texto real (text-sm = 18.4px,
      // text-2xl = 28px), não o corpo do glifo — com h-4/h-6 o skeleton
      // ficava ~14px mais baixo e a seção "Buckets" saltava ao carregar.
      <div className="max-w-5xl space-y-4 rounded border border-slate-200 bg-white p-6 shadow-sm">
         <Skeleton className="h-5 w-32" />
         <div className="flex items-end justify-between">
            <div className="space-y-1">
               <Skeleton className="h-5 w-40" />
               <Skeleton className="h-9 w-48" />
            </div>
            <div className="flex flex-col items-end gap-1">
               <Skeleton className="h-7 w-16 rounded-full" />
               <Skeleton className="h-8 w-16" />
            </div>
         </div>
         <Skeleton className="h-4 w-full rounded-full" />
         <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {/* Mesma estrutura do tile real (p-4 + rótulo + valor), para a
                altura sair da composição em vez de um h-* chutado */}
            {[0, 1, 2, 3].map((i) => (
               <div
                  key={i}
                  className={clsx(
                     "space-y-1 rounded bg-slate-50 p-4",
                     i === 0 && "col-span-2 lg:col-span-1"
                  )}
               >
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-7 w-20" />
               </div>
            ))}
         </div>
      </div>
   );
}
