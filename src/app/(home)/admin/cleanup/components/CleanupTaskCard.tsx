"use client";

import { Button, Spinner } from "flowbite-react";
import { HiCheckCircle } from "react-icons/hi";
import { MdDelete } from "react-icons/md";
import type { CleanupTaskPreview } from "services/routes/cleanup";
import { Skeleton } from "@/components/ui/Skeleton";

interface CleanupTaskCardProps {
   task: CleanupTaskPreview;
   disabled: boolean;
   running: boolean;
   onRun: () => void;
}

export function CleanupTaskCard({
   task,
   disabled,
   running,
   onRun,
}: CleanupTaskCardProps) {
   const vazia = task.count === 0;

   return (
      <div className="flex h-full flex-col gap-4 rounded border border-slate-200 bg-white p-5 shadow-sm">
         <h2 className="text-sm leading-5 font-medium text-slate-700">
            {task.description}
         </h2>
         <div className="mt-auto flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1">
               {/* Contagem neutra: registro antigo é manutenção de rotina,
                   não alarme. O vermelho fica só no botão que apaga. */}
               <p className="text-3xl leading-none font-bold text-slate-900 tabular-nums">
                  {task.count.toLocaleString("pt-BR")}
               </p>
               <p className="text-xs leading-5 text-slate-500">
                  {task.count === 1
                     ? "registro candidato"
                     : "registros candidatos"}
               </p>
            </div>
            {vazia ? (
               // Sem candidato não há ação: um "Excluir" vermelho desbotado
               // chamava atenção para o que não pode ser feito.
               <span className="flex min-h-[32px] items-center gap-1.5 text-sm text-green-700">
                  <HiCheckCircle aria-hidden className="size-4" />
                  Nada a limpar
               </span>
            ) : (
               <Button
                  color="red"
                  size="sm"
                  className="min-h-[32px] shrink-0"
                  disabled={disabled}
                  onClick={onRun}
                  aria-label={`Excluir: ${task.description}`}
               >
                  {running ? (
                     <>
                        {/* fill-white: a cor default do Spinner é a da marca
                            e some sobre o botão vermelho */}
                        <Spinner size="sm" className="mr-2 fill-white" />
                        Executando...
                     </>
                  ) : (
                     <>
                        <MdDelete className="mr-2 size-4" />
                        Excluir
                     </>
                  )}
               </Button>
            )}
         </div>
      </div>
   );
}

export function CleanupTaskCardSkeleton() {
   return (
      <div className="flex h-full flex-col gap-4 rounded border border-slate-200 bg-white p-5 shadow-sm">
         <Skeleton className="h-5 w-3/4" />
         <div className="mt-auto flex items-end justify-between gap-3">
            <div className="space-y-1">
               <Skeleton className="h-[30px] w-16" />
               <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-8 w-20" />
         </div>
      </div>
   );
}
