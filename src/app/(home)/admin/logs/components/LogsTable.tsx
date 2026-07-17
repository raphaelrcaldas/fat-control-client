"use client";

import {
   Table,
   TableBody,
   TableCell,
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

interface LogsTableProps {
   logs: UserActionLog[];
   orgTemas: Record<string, OrgTheme>;
   loading: boolean;
   isFetching: boolean;
   hasSearch: boolean;
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
   onClearSearch,
   onDeleteClick,
   page,
   totalPages,
   total,
   perPage,
   onPageChange,
}: LogsTableProps) {
   return (
      <div className="overflow-x-auto rounded border border-slate-200 bg-white shadow-sm">
         <Table
            hoverable
            theme={{ head: { cell: { base: "bg-white" } } }}
            className={clsx(
               "transition-opacity",
               isFetching && !loading && "opacity-50"
            )}
         >
            <TableHead>
               <TableRow>
                  <TableHeadCell>Data/Hora</TableHeadCell>
                  <TableHeadCell>Usuário</TableHeadCell>
                  <TableHeadCell>Unidade</TableHeadCell>
                  <TableHeadCell className="hidden md:table-cell">
                     Ação
                  </TableHeadCell>
                  <TableHeadCell>Origem</TableHeadCell>
                  <TableHeadCell>Ações</TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className="divide-y divide-gray-200">
               {loading ? (
                  <LogsTableSkeleton />
               ) : logs.length === 0 ? (
                  <TableRow className="bg-white">
                     <TableCell colSpan={6} className="py-12">
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
                     </TableCell>
                  </TableRow>
               ) : (
                  logs.map((log) => (
                     <LogRow
                        key={log.id}
                        log={log}
                        tema={orgTemas[log.user.unidade]}
                        onDeleteClick={onDeleteClick}
                     />
                  ))
               )}
            </TableBody>
         </Table>

         {!loading && total > 0 && (
            <nav
               className={clsx(
                  "flex flex-col items-start justify-between gap-3 border-t border-slate-200 p-4 lg:flex-row lg:items-center",
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
