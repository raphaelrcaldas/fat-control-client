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
import { LogRow } from "./LogRow";
import { LogsTableSkeleton } from "./LogsTableSkeleton";

interface LogsTableProps {
   logs: UserActionLog[];
   loading: boolean;
   isFetching: boolean;
   hasSearch: boolean;
   onClearSearch: () => void;
   onDeleteClick: (log: UserActionLog) => void;
}

export function LogsTable({
   logs,
   loading,
   isFetching,
   hasSearch,
   onClearSearch,
   onDeleteClick,
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
                     <TableCell colSpan={5} className="py-12">
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
                                    className="text-sm text-blue-600 hover:underline"
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
                        onDeleteClick={onDeleteClick}
                     />
                  ))
               )}
            </TableBody>
         </Table>
      </div>
   );
}
