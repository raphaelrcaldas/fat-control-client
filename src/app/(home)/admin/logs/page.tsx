"use client";

import { useEffect, useMemo, useState } from "react";
import { UserActionLog } from "services/routes/logs";
import { useToast } from "@/app/context/toast";
import {
   useDeleteUserActionLog,
   useUserActionLogsPage,
} from "@/hooks/queries/useLogs";
import { useTenants } from "@/hooks/queries/useTenants";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { isOrgTheme, type OrgTheme } from "@/lib/orgTheme";
import { DeleteLogModal } from "./components/DeleteLogModal";
import { LogsFilters } from "./components/LogsFilters";
import { LogsHeader } from "./components/LogsHeader";
import { LogsTable } from "./components/LogsTable";

const PER_PAGE = 25;

export default function LogDashboard() {
   const [searchTerm, setSearchTerm] = useState("");
   const [actionFilter, setActionFilter] = useState("login");
   const [dateStart, setDateStart] = useState("");
   const [dateEnd, setDateEnd] = useState("");
   const [page, setPage] = useState(1);
   const [logToDelete, setLogToDelete] = useState<UserActionLog | null>(null);
   const { push } = useToast();

   const debouncedSearch = useDebouncedValue(searchTerm, 350);

   // Filtro novo invalida a página corrente — volta para a primeira
   useEffect(() => {
      setPage(1);
   }, [debouncedSearch, actionFilter, dateStart, dateEnd]);

   const logsQuery = useUserActionLogsPage({
      // "" = todas as ações / sem filtro; o fetcher descarta valores vazios
      action: actionFilter,
      search: debouncedSearch,
      start: dateStart,
      end: dateEnd,
      page,
      per_page: PER_PAGE,
   });
   const deleteMutation = useDeleteUserActionLog();
   const tenantsQuery = useTenants();

   const logs = logsQuery.data?.items ?? [];
   const total = logsQuery.data?.total ?? 0;
   const totalPages = logsQuery.data?.pages ?? 1;

   // sigla -> tema, para pintar o dot do tenant de cada linha
   const orgTemas = useMemo(() => {
      const map: Record<string, OrgTheme> = {};
      for (const tenant of tenantsQuery.data ?? []) {
         if (isOrgTheme(tenant.tema)) map[tenant.organizacao_id] = tenant.tema;
      }
      return map;
   }, [tenantsQuery.data]);

   const hasFilters = !!searchTerm || !!dateStart || !!dateEnd;

   const handleClearFilters = () => {
      setSearchTerm("");
      setDateStart("");
      setDateEnd("");
   };

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
            count={total}
            lastUpdated={logsQuery.dataUpdatedAt}
            isFetching={logsQuery.isFetching}
            onRefresh={() => logsQuery.refetch()}
         />

         <LogsFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            actionFilter={actionFilter}
            onActionChange={setActionFilter}
            dateStart={dateStart}
            onDateStartChange={setDateStart}
            dateEnd={dateEnd}
            onDateEndChange={setDateEnd}
         />

         <LogsTable
            logs={logs}
            orgTemas={orgTemas}
            loading={logsQuery.isLoading}
            isFetching={logsQuery.isFetching}
            hasSearch={hasFilters}
            onClearSearch={handleClearFilters}
            onDeleteClick={setLogToDelete}
            page={page}
            totalPages={totalPages}
            total={total}
            perPage={PER_PAGE}
            onPageChange={setPage}
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
