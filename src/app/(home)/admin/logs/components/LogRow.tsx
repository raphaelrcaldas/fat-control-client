"use client";

import { Badge, TableCell, TableRow } from "flowbite-react";
import { HiTrash } from "react-icons/hi";
import clsx from "clsx";
import { UserActionLog } from "services/routes/logs";
import { formatDateTimeFull } from "@/../utils/dateHandler";

const ACTION_BADGE_COLORS: Record<string, string> = {
   login: "success",
   logout: "info",
   create: "purple",
   update: "warning",
   delete: "failure",
};

function ActionBadge({ action }: { action: string }) {
   return (
      <Badge
         color={ACTION_BADGE_COLORS[action] || "gray"}
         className="w-fit capitalize"
      >
         {action}
      </Badge>
   );
}

function parseOrigin(after: string | null): string {
   if (!after) return "";
   try {
      return JSON.parse(after).client ?? "";
   } catch {
      return "";
   }
}

interface LogRowProps {
   log: UserActionLog;
   onDeleteClick: (log: UserActionLog) => void;
}

export function LogRow({ log, onDeleteClick }: LogRowProps) {
   const timestamp = formatDateTimeFull(log.timestamp) || "N/A";
   const origin = parseOrigin(log.after);

   return (
      <TableRow className="bg-white transition-colors hover:bg-gray-50">
         <TableCell className="font-mono text-sm whitespace-nowrap">
            {timestamp}
         </TableCell>
         <TableCell>
            <div className="flex flex-col gap-1">
               <span className="font-medium uppercase">
                  {log.user.p_g} {log.user.nome_guerra}
               </span>
               {/* Badge de ação inline no mobile (coluna "Ação" oculta) */}
               <span className="md:hidden">
                  <ActionBadge action={log.action} />
               </span>
            </div>
         </TableCell>
         <TableCell className="hidden md:table-cell">
            <ActionBadge action={log.action} />
         </TableCell>
         <TableCell>
            {origin && (
               <span
                  className={clsx(
                     "rounded border p-1 text-xs font-medium text-gray-600 shadow",
                     {
                        "border-red-400 bg-red-200": origin === "fatbird",
                        "border-blue-400 bg-blue-200": origin === "fatcontrol",
                     }
                  )}
               >
                  {origin}
               </span>
            )}
         </TableCell>
         <TableCell>
            <button
               onClick={() => onDeleteClick(log)}
               className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
               title="Excluir log"
               type="button"
            >
               <HiTrash className="size-4" />
            </button>
         </TableCell>
      </TableRow>
   );
}
