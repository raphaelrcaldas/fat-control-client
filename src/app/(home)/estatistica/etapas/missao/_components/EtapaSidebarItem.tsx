"use client";

import { memo } from "react";
import { HiPencil, HiSparkles } from "react-icons/hi";
import clsx from "clsx";
import {
   formatDateFull,
   isoDateToShort,
   minutesToTime,
} from "utils/dateHandler";

import { EtapaStatusBadge } from "./EtapaStatusBadge";

export type EtapaStatus = "ok" | "verificar" | "editando" | "rascunho";

type Props = {
   data: string;
   origem: string;
   destino: string;
   anv: string;
   depHora: string;
   arrHora: string;
   tvooMin: number;
   status: EtapaStatus;
   selected: boolean;
   isModified?: boolean;
   isNew?: boolean;
   onClick: () => void;
};

function EtapaSidebarItemBase({
   data,
   origem,
   destino,
   anv,
   depHora,
   arrHora,
   tvooMin,
   status,
   selected,
   isModified,
   isNew,
   onClick,
}: Props) {
   return (
      <button
         type="button"
         onClick={onClick}
         aria-current={selected ? "true" : undefined}
         className={clsx(
            "relative flex w-full flex-col gap-2 overflow-hidden border border-gray-200 bg-white p-3 pl-4 text-left shadow transition",
            "hover:border-gray-300 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500",
            selected && "border-red-200 bg-red-50/40 hover:bg-red-50/60",
            // accent bar — uses pseudo-element via ::before to avoid layout shift
            "before:absolute before:top-0 before:left-0 before:h-full before:w-1 before:transition",
            selected ? "before:bg-red-500" : "before:bg-transparent",
            isModified &&
               !selected &&
               "before:bg-amber-300/70 before:mask-[repeating-linear-gradient(to_bottom,black_0_4px,transparent_4px_8px)]",
            isNew &&
               !selected &&
               "before:bg-emerald-300/70 before:mask-[repeating-linear-gradient(to_bottom,black_0_4px,transparent_4px_8px)]"
         )}
      >
         <div className="flex min-w-0 flex-col gap-1">
            <div className="flex min-w-0 items-center justify-between gap-3">
               <div className="flex min-w-0 items-center gap-1 text-sm font-semibold text-gray-900">
                  <span className="truncate font-mono">{origem}</span>
                  <span className="shrink-0 text-gray-400">→</span>
                  <span className="truncate font-mono">{destino}</span>
               </div>
               <span className="shrink-0 font-mono text-xs font-medium tracking-wide text-gray-500">
                  {anv || "----"}
               </span>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs tabular-nums">
               <span
                  className="truncate text-gray-500"
                  title={data ? formatDateFull(data) : undefined}
               >
                  {data ? isoDateToShort(data) : "--/--"}
                  <span className="mx-1 text-gray-300">·</span>
                  {depHora}–{arrHora}
               </span>
               <span className="shrink-0 font-mono text-sm font-semibold text-gray-900">
                  {minutesToTime(tvooMin)}
               </span>
            </div>
         </div>

         <div className="flex items-center justify-end gap-2">
            {isNew && (
               <span
                  className="flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200"
                  title="Esta etapa é nova e ainda não foi salva"
               >
                  <HiSparkles className="h-3 w-3" />
                  Nova
               </span>
            )}
            {isModified && (
               <span
                  className="flex items-center gap-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200"
                  title="Esta etapa foi modificada e ainda não foi salva"
               >
                  <HiPencil className="h-3 w-3" />
                  Modificado
               </span>
            )}
            <EtapaStatusBadge status={status} />
         </div>
      </button>
   );
}

export const EtapaSidebarItem = memo(EtapaSidebarItemBase);
