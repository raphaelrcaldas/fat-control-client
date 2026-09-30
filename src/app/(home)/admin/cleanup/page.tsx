"use client";

import { useState } from "react";
import clsx from "clsx";
import { Button } from "flowbite-react";
import { useCleanupPreview, useRunCleanup } from "@/hooks/queries";
import { useToast } from "@/app/context/toast";
import { CleanupHeader } from "./components/CleanupHeader";
import {
   CleanupTaskCard,
   CleanupTaskCardSkeleton,
} from "./components/CleanupTaskCard";
import { CleanupSummary } from "./components/CleanupSummary";
import { CleanupResultsTable } from "./components/CleanupResultsTable";
import { ConfirmCleanupModal } from "./components/ConfirmCleanupModal";

const SKELETON_CARDS = [0, 1, 2, 3];

export default function CleanupPage() {
   const { push } = useToast();
   const [showConfirm, setShowConfirm] = useState(false);
   const [selectedTaskName, setSelectedTaskName] = useState<string>();

   const {
      data: preview,
      isLoading: loadingPreview,
      isFetching,
      isError,
      refetch,
   } = useCleanupPreview();
   // Falha sem contagem em tela: "0 registros" / "banco sem pendências" seria
   // mentira, então cards e resumo dão lugar ao erro
   const semDado = isError && !preview;
   const runMutation = useRunCleanup();
   const running = runMutation.isPending;
   const results = runMutation.data ?? null;
   const totalRecords = preview?.total_records ?? 0;
   const selectedTasks = (preview?.tasks ?? []).filter(
      (task) =>
         selectedTaskName === undefined || task.task_name === selectedTaskName
   );
   const selectedTotal = selectedTasks.reduce(
      (total, task) => total + task.count,
      0
   );

   const descricoes = Object.fromEntries(
      (preview?.tasks ?? []).map((t) => [t.task_name, t.description])
   );

   const openConfirm = (taskName?: string) => {
      setSelectedTaskName(taskName);
      setShowConfirm(true);
      // O preview pode ter até 60 s: o número que o modal promete apagar
      // precisa ser o de agora. Confirmar fica travado até a recontagem.
      refetch();
   };

   const handleRun = () => {
      if (running || isFetching || selectedTotal === 0) return;
      setShowConfirm(false);
      runMutation.mutate(selectedTaskName, {
         onSuccess: (data) => {
            const hasErrors = data.tasks.some(
               (task) => task.status === "error"
            );
            push({
               type: hasErrors ? "error" : "success",
               message: hasErrors
                  ? `Limpeza concluída com erros. ${data.total_deleted.toLocaleString("pt-BR")} registros removidos. Consulte os detalhes abaixo.`
                  : `Limpeza concluída. ${data.total_deleted.toLocaleString("pt-BR")} registros removidos.`,
            });
         },
         onError: (err: unknown) => {
            push({
               type: "error",
               message:
                  err instanceof Error
                     ? err.message
                     : "Erro ao executar limpeza",
            });
         },
      });
   };

   return (
      <div className="space-y-2">
         <CleanupHeader isFetching={isFetching} onRefresh={() => refetch()} />

         {semDado && (
            <div
               role="alert"
               className="space-y-3 rounded border border-red-300 bg-red-50 p-4"
            >
               <p className="text-sm text-red-800">
                  Erro ao carregar a prévia da limpeza. Por favor, tente
                  novamente.
               </p>
               <Button
                  color="light"
                  size="xs"
                  onClick={() => refetch()}
                  disabled={isFetching}
               >
                  Tentar novamente
               </Button>
            </div>
         )}

         {/* Refetch que falhou com a contagem anterior em tela: mantém e avisa */}
         {isError && preview && (
            <p
               role="status"
               className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500"
            >
               <span className="min-w-0 flex-1 truncate">
                  Não foi possível atualizar a prévia
               </span>
               <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="min-h-[24px] shrink-0 font-semibold text-slate-900 underline underline-offset-2 disabled:opacity-50"
               >
                  Tentar novamente
               </button>
            </p>
         )}

         {!semDado && (
            <>
               <div
                  role={loadingPreview ? "status" : undefined}
                  className={clsx(
                     "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4",
                     isFetching &&
                        !loadingPreview &&
                        "opacity-50 transition-opacity"
                  )}
               >
                  {loadingPreview && (
                     <span className="sr-only">
                        Carregando tarefas de limpeza…
                     </span>
                  )}
                  {loadingPreview
                     ? SKELETON_CARDS.map((i) => (
                          <CleanupTaskCardSkeleton key={i} />
                       ))
                     : preview?.tasks.map((task) => (
                          <CleanupTaskCard
                             key={task.task_name}
                             task={task}
                             disabled={running || isFetching}
                             running={
                                running &&
                                (runMutation.variables === undefined ||
                                   runMutation.variables === task.task_name)
                             }
                             onRun={() => openConfirm(task.task_name)}
                          />
                       ))}
               </div>

               <CleanupSummary
                  totalRecords={totalRecords}
                  loading={loadingPreview || isFetching}
                  running={running}
                  onRun={() => openConfirm()}
               />
            </>
         )}

         {results && (
            <CleanupResultsTable results={results} descricoes={descricoes} />
         )}

         <ConfirmCleanupModal
            show={showConfirm}
            total={selectedTotal}
            tasks={selectedTasks}
            isCounting={isFetching}
            isPending={running}
            onConfirm={handleRun}
            onClose={() => setShowConfirm(false)}
         />
      </div>
   );
}
