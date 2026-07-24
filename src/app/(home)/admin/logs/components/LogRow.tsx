"use client";

import { Badge, TableCell, TableRow } from "flowbite-react";
import { HiTrash } from "react-icons/hi";
import clsx from "clsx";
import { UserActionLog } from "services/routes/logs";
import { THEME_META, type OrgTheme } from "@/lib/orgTheme";
import { formatDateTimeFullParts } from "@/../utils/dateHandler";

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
         className="mx-auto w-fit shrink-0 capitalize"
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

/** Dot na cor do tenant + sigla. A sigla carrega a informação; a cor reforça. */
function UnidadeTag({ unidade, tema }: { unidade: string; tema?: OrgTheme }) {
   return (
      <span className="inline-flex items-center gap-1.5">
         <span
            aria-hidden
            className={clsx(
               "size-2 shrink-0 rounded-full",
               tema ? THEME_META[tema].swatch : "bg-slate-300"
            )}
         />
         <span className="font-medium text-slate-700 uppercase">{unidade}</span>
      </span>
   );
}

/**
 * No mobile fica só o dot — o rótulo não paga a largura que custa. A cor nunca
 * é canal único: o nome segue no title e para leitores de tela.
 */
function OriginTag({ origin }: { origin: string }) {
   return (
      <span
         title={origin}
         className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-slate-600 md:rounded md:border md:border-slate-300 md:bg-slate-50 md:px-1.5 md:py-0.5"
      >
         <span
            aria-hidden
            className={clsx(
               "size-2 shrink-0 rounded-full",
               ORIGIN_DOT_COLORS[origin] ?? "bg-slate-400"
            )}
         />
         <span className="sr-only md:not-sr-only">{origin}</span>
      </span>
   );
}

interface LogRowProps {
   log: UserActionLog;
   /** Tema do tenant da linha (undefined = tenant desconhecido, dot neutro) */
   tema?: OrgTheme;
   /**
    * Mostra a coluna Ação também no mobile. Só vale quando a lista mistura
    * ações — com uma ação filtrada o badge repetiria o filtro em toda linha.
    */
   showAction: boolean;
   onDeleteClick: (log: UserActionLog) => void;
}

export function LogRow({ log, tema, showAction, onDeleteClick }: LogRowProps) {
   const { dayMonth, year, hourMinute, seconds } = formatDateTimeFullParts(
      log.timestamp
   );
   const origin = parseOrigin(log.after);

   return (
      <TableRow className="bg-white transition-colors hover:bg-gray-50">
         {/* w-px encolhe cada coluna até o conteúdo — sem isso o auto-layout
             reparte a largura por igual e sobram buracos entre as células.
             Só Usuário fica elástica e absorve a folga */}
         <TableCell className="w-px align-middle font-mono text-xs whitespace-nowrap text-slate-500 md:w-auto md:text-sm">
            {dayMonth ? (
               <>
                  {/* Ano e segundos saem no mobile: custam largura e raramente
                      desambiguam. Seguem no desktop, onde há espaço */}
                  {dayMonth}
                  <span className="hidden md:inline">{year}</span> {hourMinute}
                  <span className="hidden md:inline">{seconds}</span>
               </>
            ) : (
               "N/A"
            )}
         </TableCell>

         <TableCell className="align-middle">
            <span className="font-medium uppercase">
               {log.user.p_g} {log.user.nome_guerra}
            </span>
         </TableCell>

         <TableCell className="w-px text-center align-middle text-xs whitespace-nowrap md:w-auto md:text-sm">
            <UnidadeTag unidade={log.user.unidade} tema={tema} />
         </TableCell>

         <TableCell
            className={clsx(
               "w-px align-middle md:w-auto",
               !showAction && "hidden md:table-cell"
            )}
         >
            <ActionBadge action={log.action} />
         </TableCell>

         <TableCell className="w-px text-center align-middle md:w-auto">
            {origin && <OriginTag origin={origin} />}
         </TableCell>

         <TableCell className="w-px align-middle md:w-auto">
            <button
               onClick={() => onDeleteClick(log)}
               className="grid size-8 place-items-center rounded text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 pointer-coarse:size-[44px]"
               aria-label={`Excluir log de ${log.user.nome_guerra}`}
               type="button"
            >
               <HiTrash className="size-4" />
            </button>
         </TableCell>
      </TableRow>
   );
}
