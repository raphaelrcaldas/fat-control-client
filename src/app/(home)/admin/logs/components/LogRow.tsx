"use client";

import { Badge, TableCell, TableRow } from "flowbite-react";
import { HiTrash } from "react-icons/hi";
import clsx from "clsx";
import { UserActionLog } from "services/routes/logs";
import { THEME_META, type OrgTheme } from "@/lib/orgTheme";
import { formatDateTimeFull } from "@/../utils/dateHandler";

const ACTION_BADGE_COLORS: Record<string, string> = {
   login: "success",
   logout: "info",
   create: "purple",
   update: "warning",
   delete: "failure",
};

// Dot de identidade da origem — mesma linguagem do dot de tenant
// (dot = quem/de onde, badge = o quê aconteceu)
const ORIGIN_DOT_COLORS: Record<string, string> = {
   fatcontrol: "bg-sky-500",
   fatbird: "bg-orange-500",
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
   /** Tema do tenant da linha (undefined = tenant desconhecido, dot neutro) */
   tema?: OrgTheme;
   onDeleteClick: (log: UserActionLog) => void;
}

export function LogRow({ log, tema, onDeleteClick }: LogRowProps) {
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
         <TableCell>
            {/* Dot na cor do tenant referido (a sigla carrega a informação;
                a cor é reforço visual — nunca canal único) */}
            <span className="inline-flex items-center gap-2">
               <span
                  aria-hidden
                  className={clsx(
                     "size-2 shrink-0 rounded-full",
                     tema ? THEME_META[tema].swatch : "bg-slate-300"
                  )}
               />
               <span className="font-medium text-slate-700 uppercase">
                  {log.user.unidade}
               </span>
            </span>
         </TableCell>
         <TableCell className="hidden md:table-cell">
            <ActionBadge action={log.action} />
         </TableCell>
         <TableCell>
            {origin && (
               <span className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                  <span
                     aria-hidden
                     className={clsx(
                        "size-2 shrink-0 rounded-full",
                        ORIGIN_DOT_COLORS[origin] ?? "bg-slate-400"
                     )}
                  />
                  {origin}
               </span>
            )}
         </TableCell>
         <TableCell>
            <button
               onClick={() => onDeleteClick(log)}
               className="grid place-items-center rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 pointer-coarse:size-[44px]"
               title="Excluir log"
               type="button"
            >
               <HiTrash className="size-4" />
            </button>
         </TableCell>
      </TableRow>
   );
}
