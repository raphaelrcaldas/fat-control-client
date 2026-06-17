"use client";

import { useMemo, useState } from "react";
import { UserActionLog } from "services/routes/logs";
import { useToast } from "@/app/context/toast";
import {
   useDeleteUserActionLog,
   useUserActionLogs,
} from "@/hooks/queries/useLogs";
import { formatDateTimeFull } from "@/../utils/dateHandler";
import { DeleteLogModal } from "./components/DeleteLogModal";
import { LogsFilters } from "./components/LogsFilters";
import { LogsHeader } from "./components/LogsHeader";
import { LogsTable } from "./components/LogsTable";

export default function LogDashboard() {
   const [searchTerm, setSearchTerm] = useState("");
   const [actionFilter, setActionFilter] = useState("login");
   const [logToDelete, setLogToDelete] = useState<UserActionLog | null>(null);
   const { push } = useToast();

   const logsQuery = useUserActionLogs({ action: actionFilter });
   const deleteMutation = useDeleteUserActionLog();

   const logs = logsQuery.data ?? [];

   const filteredLogs = useMemo(() => {
      const search = searchTerm.toLowerCase().trim();
      if (!search) return logs;
      return logs.filter((log) => {
         const userName =
            `${log.user.p_g} ${log.user.nome_guerra}`.toLowerCase();
         const timestamp = formatDateTimeFull(log.timestamp).toLowerCase();
         return (
            userName.includes(search) ||
            timestamp.includes(search) ||
            log.action.toLowerCase().includes(search)
         );
      });
   }, [logs, searchTerm]);

   const handleDelete = () => {
      if (!logToDelete) return;
      deleteMutation.mutate(logToDelete.id, {
         onSuccess: () => {
            setLogToDelete(null);
            push({ type: "success", message: "Log excluído com sucesso." });
         },
         onError: () => {
            push({
               type: "error",
               message: "Erro ao excluir log. Tente novamente.",
            });
         },
      });
   };

   return (
      <div className="space-y-2">
         <LogsHeader
            count={filteredLogs.length}
            lastUpdated={logsQuery.dataUpdatedAt}
            isFetching={logsQuery.isFetching}
            onRefresh={() => logsQuery.refetch()}
         />

         <LogsFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            actionFilter={actionFilter}
            onActionChange={setActionFilter}
         />

         <LogsTable
            logs={filteredLogs}
            loading={logsQuery.isLoading}
            isFetching={logsQuery.isFetching}
            hasSearch={!!searchTerm}
            onClearSearch={() => setSearchTerm("")}
            onDeleteClick={setLogToDelete}
         />

         {logToDelete && (
            <DeleteLogModal
               log={logToDelete}
               show
               isPending={deleteMutation.isPending}
               onClose={() => setLogToDelete(null)}
               onConfirm={handleDelete}
            />
         )}
      </div>
   );
}
