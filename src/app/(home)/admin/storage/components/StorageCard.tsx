"use client";

import clsx from "clsx";
import { HiExclamation } from "react-icons/hi";
import { formatSize } from "@/../utils/formatSize";
import { formatPercent, rotuloBucket } from "../utils/buckets";
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
         label: percent > 100 ? "Excedido" : "Crítico",
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
   totalBytes,
   totalObjects,
   bucketCount,
   largestBucket,
   unreadableCount,
   maxMB,
}: StorageCardProps) {
   const quotaBytes = maxMB * 1024 * 1024;
   // Sem teto: acima da cota o número real é justamente o que importa. Só a
   // barra (e o aria-valuenow, limitado a aria-valuemax) param em 100.
   const percent = quotaBytes > 0 ? (totalBytes / quotaBytes) * 100 : 0;
   const barPercent = Math.min(percent, 100);

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
   const excedido = !semLeitura && totalBytes > quotaBytes;
   const maiorRotulo = largestBucket
      ? (rotuloBucket(largestBucket.name) ?? largestBucket.name)
      : null;

   return (
      // max-w-5xl: em 1920 o card esticado abria ~1400px entre o título e o
      // seu próprio status, quebrando a leitura por proximidade.
      <div className="max-w-5xl space-y-4 rounded border border-slate-200 bg-white p-6 shadow-sm">
         <div className="flex items-end justify-between gap-4">
            <div className="min-w-0 space-y-1">
               <p className="text-sm font-medium text-gray-500">{title}</p>
               <p className="text-3xl font-bold text-gray-900 tabular-nums">
                  {semLeitura
                     ? "—"
                     : `${piso ? "≥ " : ""}${formatSize(totalBytes)}`}
                  <span className="ml-1 text-lg font-normal text-gray-500">
                     / {formatSize(quotaBytes)}
                  </span>
               </p>
            </div>
            <div className="shrink-0 space-y-1 text-right">
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
                  {/* Com bucket ilegível o percentual também é piso */}
                  {semLeitura
                     ? "—"
                     : `${piso ? "≥ " : ""}${formatPercent(percent)}`}
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
            aria-valuenow={
               semLeitura ? undefined : Number(barPercent.toFixed(1))
            }
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={
               semLeitura
                  ? "indeterminado"
                  : `${formatPercent(percent)} — ${usage.label}`
            }
            className="h-4 w-full overflow-hidden rounded-full bg-slate-200"
         >
            <div
               className={clsx("h-4 rounded-full transition-all", usage.bar)}
               style={{ width: semLeitura ? "0%" : `${barPercent}%` }}
            />
         </div>

         {/* Três tiles de mesma forma (rótulo, valor, detalhe): quem ocupa o
             espaço, quanto sobra e quantos arquivos. A contagem de buckets
             já está no cabeçalho e no título da grade — um tile só para ela
             repetia o número pela terceira vez. */}
         <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {/* col-span-2 no mobile: o nome do bucket pede a largura toda.
                O tamanho vai numa linha própria — dividindo a linha com o
                nome, o `truncate` comia justamente o número */}
            <Tile
               className="col-span-2 lg:col-span-1"
               label="Maior bucket"
               valor={largestBucket && !semLeitura ? maiorRotulo : null}
               valorTitle={largestBucket?.name}
               detalhe={
                  largestBucket && !semLeitura
                     ? formatSize(largestBucket.total_size)
                     : undefined
               }
            />
            {excedido ? (
               <Tile
                  label="Excedido em"
                  valor={formatSize(totalBytes - quotaBytes)}
                  valorClassName="text-red-700"
                  detalhe={`cota de ${formatSize(quotaBytes)}`}
               />
            ) : (
               <Tile
                  label="Espaço disponível"
                  valor={
                     semLeitura
                        ? null
                        : formatSize(Math.max(quotaBytes - totalBytes, 0))
                  }
                  detalhe={`de ${formatSize(quotaBytes)}`}
               />
            )}
            <Tile
               label="Total de arquivos"
               valor={semLeitura ? null : totalObjects.toLocaleString("pt-BR")}
               detalhe={`em ${bucketCount} ${bucketCount === 1 ? "bucket" : "buckets"}`}
            />
         </div>
      </div>
   );
}

interface TileProps {
   label: string;
   /** null = não apurado: mostra "—" em vez de afirmar um número. */
   valor: string | null;
   valorTitle?: string;
   valorClassName?: string;
   detalhe?: string;
   className?: string;
}

function Tile({
   label,
   valor,
   valorTitle,
   valorClassName,
   detalhe,
   className,
}: TileProps) {
   return (
      <div
         className={clsx(
            "min-w-0 space-y-1 rounded bg-slate-50 p-4",
            className
         )}
      >
         <p className="text-sm text-gray-500">{label}</p>
         <p
            title={valorTitle ?? valor ?? undefined}
            className={clsx(
               "truncate text-2xl font-bold tabular-nums",
               valor === null
                  ? "text-gray-500"
                  : (valorClassName ?? "text-gray-900")
            )}
         >
            {valor ?? "—"}
         </p>
         {/* &nbsp; segura a linha quando não há detalhe: os três tiles
             ficam da mesma altura e o skeleton acerta a conta */}
         <p className="truncate text-sm text-gray-500 tabular-nums">
            {detalhe ?? "\u00a0"}
         </p>
      </div>
   );
}

export function StorageCardSkeleton() {
   return (
      // Alturas espelham a ENTRELINHA do texto real (text-sm = 18.4px,
      // text-2xl = 28px), não o corpo do glifo — com h-4/h-6 o skeleton
      // ficava ~14px mais baixo e a seção "Buckets" saltava ao carregar.
      <div className="max-w-5xl space-y-4 rounded border border-slate-200 bg-white p-6 shadow-sm">
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
         <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {/* Mesma estrutura do Tile (p-4 + rótulo + valor + detalhe), para
                a altura sair da composição em vez de um h-* chutado */}
            {[0, 1, 2].map((i) => (
               <div
                  key={i}
                  className={clsx(
                     "space-y-1 rounded bg-slate-50 p-4",
                     i === 0 && "col-span-2 lg:col-span-1"
                  )}
               >
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-5 w-16" />
               </div>
            ))}
         </div>
      </div>
   );
}
