"use client";

import { useState } from "react";
import clsx from "clsx";
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
      refetch,
   } = useCleanupPreview();
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

   const openConfirm = (taskName?: string) => {
      setSelectedTaskName(taskName);
      setShowConfirm(true);
   };

   const handleRun = () => {
      if (running || selectedTotal === 0) return;
      setShowConfirm(false);
      runMutation.mutate(selectedTaskName, {
         onSuccess: (data) => {
            const hasErrors = data.tasks.some(
               (task) => task.status === "error"
            );
            push({
               type: hasErrors ? "error" : "success",
               message: hasErrors
                  ? `Limpeza concluída com erros. ${data.total_deleted} registros removidos. Consulte os detalhes abaixo.`
                  : `Limpeza concluída. ${data.total_deleted} registros removidos.`,
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

         <div
            className={clsx(
               "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4",
               isFetching && !loadingPreview && "opacity-50 transition-opacity"
            )}
         >
            {loadingPreview
               ? SKELETON_CARDS.map((i) => <CleanupTaskCardSkeleton key={i} />)
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

         {results && <CleanupResultsTable results={results} />}

         <ConfirmCleanupModal
            show={showConfirm}
            total={selectedTotal}
            tasks={selectedTasks}
            isPending={running}
            onConfirm={handleRun}
            onClose={() => setShowConfirm(false)}
         />
      </div>
   );
}
