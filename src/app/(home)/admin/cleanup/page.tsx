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

const SKELETON_CARDS = [0, 1, 2];

export default function CleanupPage() {
   const { push } = useToast();
   const [showConfirm, setShowConfirm] = useState(false);

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

   const handleRun = () => {
      setShowConfirm(false);
      runMutation.mutate(undefined, {
         onSuccess: (data) => {
            push({
               type: "success",
               message: `Limpeza concluída. ${data.total_deleted} registros removidos.`,
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
               "grid grid-cols-1 gap-4 md:grid-cols-3",
               isFetching && !loadingPreview && "opacity-50 transition-opacity"
            )}
         >
            {loadingPreview
               ? SKELETON_CARDS.map((i) => <CleanupTaskCardSkeleton key={i} />)
               : preview?.tasks.map((task) => (
                    <CleanupTaskCard key={task.task_name} task={task} />
                 ))}
         </div>

         <CleanupSummary
            totalRecords={totalRecords}
            loading={loadingPreview}
            running={running}
            onRun={() => setShowConfirm(true)}
         />

         {results && <CleanupResultsTable results={results} />}

         <ConfirmCleanupModal
            show={showConfirm}
            total={totalRecords}
            tasks={preview?.tasks ?? []}
            isPending={running}
            onConfirm={handleRun}
            onClose={() => setShowConfirm(false)}
         />
      </div>
   );
}
