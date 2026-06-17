"use client";

import {
   Badge,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
} from "flowbite-react";
import type {
   CleanupRunResponse,
   CleanupTaskResult,
} from "services/routes/cleanup";
import { formatDateTimeFull } from "@/../utils/dateHandler";

function StatusBadge({ status }: { status: CleanupTaskResult["status"] }) {
   const map = {
      success: { color: "success" as const, label: "Sucesso" },
      error: { color: "failure" as const, label: "Erro" },
      skipped: { color: "warning" as const, label: "Ignorado" },
   };
   const { color, label } = map[status];
   return <Badge color={color}>{label}</Badge>;
}

export function CleanupResultsTable({
   results,
}: {
   results: CleanupRunResponse;
}) {
   return (
      <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
         <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div className="space-y-0.5">
               <h3 className="font-semibold text-gray-800">
                  Resultado da Última Execução
               </h3>
               <p className="text-sm text-gray-500">
                  Executado em {formatDateTimeFull(results.executed_at)}
               </p>
            </div>
            <Badge color="red" size="lg">
               {results.total_deleted} removidos
            </Badge>
         </div>
         <div className="overflow-x-auto">
            <Table hoverable theme={{ head: { cell: { base: "bg-white" } } }}>
               <TableHead>
                  <TableRow>
                     <TableHeadCell>Tarefa</TableHeadCell>
                     <TableHeadCell>Status</TableHeadCell>
                     <TableHeadCell>Registros Removidos</TableHeadCell>
                     <TableHeadCell>Duração</TableHeadCell>
                     <TableHeadCell>Detalhes</TableHeadCell>
                  </TableRow>
               </TableHead>
               <TableBody className="divide-y divide-slate-200">
                  {results.tasks.map((task) => (
                     <TableRow key={task.task_name} className="bg-white">
                        <TableCell className="font-mono text-sm">
                           {task.task_name}
                        </TableCell>
                        <TableCell>
                           <StatusBadge status={task.status} />
                        </TableCell>
                        <TableCell className="font-semibold">
                           {task.rows_affected}
                        </TableCell>
                        <TableCell>
                           {task.duration_seconds.toFixed(2)}s
                        </TableCell>
                        <TableCell>
                           {task.errors.length > 0 ? (
                              <span className="text-sm text-red-600">
                                 {task.errors.join(", ")}
                              </span>
                           ) : task.status === "skipped" ? (
                              <span className="text-sm text-gray-400">
                                 {(task.details.reason as string) ?? "—"}
                              </span>
                           ) : (
                              <span className="text-sm text-green-600">OK</span>
                           )}
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </div>
      </div>
   );
}
