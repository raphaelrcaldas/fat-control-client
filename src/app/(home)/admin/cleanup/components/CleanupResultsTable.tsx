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

const STATUS = {
   success: { color: "success", label: "Sucesso" },
   error: { color: "failure", label: "Erro" },
   skipped: { color: "gray", label: "Nada a remover" },
} as const;

function StatusBadge({ status }: { status: CleanupTaskResult["status"] }) {
   const { color, label } = STATUS[status];
   return (
      <Badge color={color} className="w-fit">
         {label}
      </Badge>
   );
}

function formatDuracao(segundos: number): string {
   return `${segundos.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
   })} s`;
}

/** Erro por extenso; sem erro, nada — o badge de status já diz o resto. */
function Detalhe({ task }: { task: CleanupTaskResult }) {
   if (task.errors.length === 0) return null;
   return (
      <span className="text-sm break-words text-red-700">
         {task.errors.join(", ")}
      </span>
   );
}

interface CleanupResultsTableProps {
   results: CleanupRunResponse;
   /** task_name → descrição legível, vinda do preview. */
   descricoes: Record<string, string>;
}

export function CleanupResultsTable({
   results,
   descricoes,
}: CleanupResultsTableProps) {
   const nome = (task: CleanupTaskResult) =>
      descricoes[task.task_name] ?? task.task_name;
   const temErro = results.tasks.some((t) => t.errors.length > 0);

   return (
      <section className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
         <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div className="min-w-0 space-y-0.5">
               <h3 className="font-semibold text-gray-800">
                  Resultado da última execução
               </h3>
               <p className="text-sm text-gray-500">
                  Executado em {formatDateTimeFull(results.executed_at)}
               </p>
            </div>
            <Badge color="gray" size="lg" className="shrink-0 tabular-nums">
               {results.total_deleted.toLocaleString("pt-BR")}{" "}
               {results.total_deleted === 1 ? "removido" : "removidos"}
            </Badge>
         </div>

         {/* Mobile: lista empilhada. Cinco colunas a 360px viravam rolagem
             lateral para ler o nome da tarefa. */}
         <ul className="divide-y divide-slate-200 md:hidden">
            {results.tasks.map((task) => (
               <li key={task.task_name} className="space-y-2 px-5 py-3">
                  <div className="flex items-start justify-between gap-3">
                     <p className="text-sm font-medium text-slate-800">
                        {nome(task)}
                     </p>
                     <StatusBadge status={task.status} />
                  </div>
                  <p className="text-sm text-slate-500 tabular-nums">
                     {task.rows_affected.toLocaleString("pt-BR")} removidos ·{" "}
                     {formatDuracao(task.duration_seconds)}
                  </p>
                  <Detalhe task={task} />
               </li>
            ))}
         </ul>

         <div className="hidden overflow-x-auto md:block">
            <Table theme={{ head: { cell: { base: "bg-white" } } }}>
               <TableHead>
                  <TableRow>
                     <TableHeadCell>Tarefa</TableHeadCell>
                     <TableHeadCell>Status</TableHeadCell>
                     <TableHeadCell className="text-right">
                        Removidos
                     </TableHeadCell>
                     <TableHeadCell className="text-right">
                        Duração
                     </TableHeadCell>
                     {temErro && <TableHeadCell>Erro</TableHeadCell>}
                  </TableRow>
               </TableHead>
               <TableBody className="divide-y divide-slate-200">
                  {results.tasks.map((task) => (
                     <TableRow key={task.task_name} className="bg-white">
                        <TableCell className="font-medium text-slate-800">
                           {nome(task)}
                        </TableCell>
                        <TableCell>
                           <StatusBadge status={task.status} />
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                           {task.rows_affected.toLocaleString("pt-BR")}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                           {formatDuracao(task.duration_seconds)}
                        </TableCell>
                        {temErro && (
                           <TableCell>
                              <Detalhe task={task} />
                           </TableCell>
                        )}
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </div>
      </section>
   );
}
