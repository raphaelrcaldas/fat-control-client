"use client";

import {
   Table,
   TableBody,
   TableHead,
   TableHeadCell,
   TableRow,
} from "flowbite-react";
import { HiClipboardList } from "react-icons/hi";
import clsx from "clsx";
import { UserActionLog } from "services/routes/logs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/Pagination";
import { type OrgTheme } from "@/lib/orgTheme";
import { LogRow } from "./LogRow";
import { LogsTableSkeleton } from "./LogsTableSkeleton";

// Padding folgado do tema global engolia a largura útil no mobile: com 6
// colunas, o px-6 padrão custava ~48px por coluna só de respiro.
const LOGS_TABLE_THEME = {
   head: { cell: { base: "bg-white px-1.5 py-1.5 md:px-6 md:py-3" } },
   body: { cell: { base: "px-1.5 py-0 md:px-6 md:py-2" } },
};

interface LogsTableProps {
   logs: UserActionLog[];
   orgTemas: Record<string, OrgTheme>;
   loading: boolean;
   isFetching: boolean;
   hasSearch: boolean;
   /** Lista mistura ações — só nesse caso a coluna Ação aparece no mobile */
   showAction: boolean;
   onClearSearch: () => void;
   onDeleteClick: (log: UserActionLog) => void;
   page: number;
   totalPages: number;
   total: number;
   perPage: number;
   onPageChange: (page: number) => void;
}

export function LogsTable({
   logs,
   orgTemas,
   loading,
   isFetching,
   hasSearch,
   showAction,
   onClearSearch,
   onDeleteClick,
   page,
   totalPages,
   total,
   perPage,
   onPageChange,
}: LogsTableProps) {
   // O EmptyState traz moldura própria — dentro do card viraria borda em borda
   if (!loading && logs.length === 0) {
      return (
         <EmptyState
            icon={HiClipboardList}
            title={
               hasSearch
                  ? "Nenhum log encontrado para essa busca"
                  : "Nenhum log encontrado"
            }
            action={
               hasSearch ? (
                  <button
                     onClick={onClearSearch}
                     className="text-sm text-slate-700 underline hover:text-slate-900"
                     type="button"
                  >
                     Limpar filtros
                  </button>
               ) : undefined
            }
         />
      );
   }

   return (
      <div className="rounded border border-slate-200 bg-white shadow-sm">
         {/* Rede de segurança: as colunas são dimensionadas para caber, mas se
             um dado extremo estourar a linha rola em vez de ser cortada */}
         <div className="overflow-x-auto">
            <Table
               hoverable
               theme={LOGS_TABLE_THEME}
               className={clsx(
                  "transition-opacity",
                  isFetching && !loading && "opacity-50"
               )}
            >
               <TableHead>
                  <TableRow>
                     <TableHeadCell>Data/Hora</TableHeadCell>
                     <TableHeadCell>Usuário</TableHeadCell>
                     <TableHeadCell className="text-center">
                        Unidade
                     </TableHeadCell>
                     {/* Coluna Ação só entra no mobile quando a lista mistura
                         ações — com filtro fixo ela repetiria o filtro */}
                     <TableHeadCell
                        className={clsx(
                           "text-center",
                           !showAction && "hidden md:table-cell"
                        )}
                     >
                        Ação
                     </TableHeadCell>
                     {/* No mobile o rótulo custa mais largura que o dot que ele
                         nomeia — some da tela, fica para o leitor de tela */}
                     <TableHeadCell className="text-center">
                        <span className="sr-only md:not-sr-only">Origem</span>
                     </TableHeadCell>
                     <TableHeadCell>
                        <span className="sr-only md:not-sr-only">Ações</span>
                     </TableHeadCell>
                  </TableRow>
               </TableHead>
               <TableBody className="divide-y divide-gray-200">
                  {loading ? (
                     <LogsTableSkeleton showAction={showAction} />
                  ) : (
                     logs.map((log) => (
                        <LogRow
                           key={log.id}
                           log={log}
                           tema={orgTemas[log.user.unidade]}
                           showAction={showAction}
                           onDeleteClick={onDeleteClick}
                        />
                     ))
                  )}
               </TableBody>
            </Table>
         </div>

         {!loading && total > 0 && (
            <nav
               className={clsx(
                  "flex flex-col items-center justify-between gap-3 border-t border-slate-200 p-3 sm:flex-row sm:p-4",
                  "transition-opacity",
                  isFetching && "pointer-events-none opacity-50"
               )}
               aria-label="Navegação da tabela"
            >
               <span className="text-sm font-normal text-gray-500">
                  Mostrando{" "}
                  <span className="font-semibold text-gray-900">
                     {(page - 1) * perPage + 1}-
                     {Math.min(page * perPage, total)}
                  </span>{" "}
                  de{" "}
                  <span className="font-semibold text-gray-900">{total}</span>
               </span>
               {totalPages > 1 && (
                  <Pagination
                     currentPage={page}
                     totalPages={totalPages}
                     onPageChange={onPageChange}
                  />
               )}
            </nav>
         )}
      </div>
   );
}
