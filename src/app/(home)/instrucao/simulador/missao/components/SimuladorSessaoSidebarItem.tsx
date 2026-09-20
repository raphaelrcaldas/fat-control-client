"use client";

import clsx from "clsx";
import { Badge } from "flowbite-react";
import { HiPencil, HiSparkles } from "react-icons/hi";
import {
   formatDateFull,
   formatTime,
   isoDateToShort,
   minutesToTime,
} from "@/../utils/dateHandler";
import type { SessaoPreview } from "../../helpers/sessaoDraft";

interface Props {
   numero: number;
   sessao: SessaoPreview;
   anoRef: number;
   selected: boolean;
   isDirty?: boolean;
   isNew?: boolean;
   onClick: () => void;
}

export function SimuladorSessaoSidebarItem({
   numero,
   sessao,
   anoRef,
   selected,
   isDirty,
   isNew,
   onClick,
}: Props) {
   const foraDoAno =
      !!sessao.data && sessao.data.slice(0, 4) !== String(anoRef);
   return (
      <button
         type="button"
         onClick={onClick}
         aria-current={selected ? "true" : undefined}
         className={clsx(
            "relative flex w-full flex-col gap-1 overflow-hidden rounded border p-3 pl-4 text-left shadow-sm transition-colors",
            "focus-visible:outline-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2",
            selected
               ? "border-primary-200 bg-primary-50/40 hover:bg-primary-50/60"
               : foraDoAno
                 ? "border-amber-300 bg-amber-50/60 hover:bg-amber-50"
                 : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
            "before:absolute before:top-0 before:left-0 before:h-full before:w-1",
            selected ? "before:bg-primary-500" : "before:bg-transparent"
         )}
      >
         <div className="flex min-w-0 items-center gap-1 text-sm font-semibold text-gray-900">
            <span className="mr-0.5 shrink-0 font-mono text-xs text-gray-500">
               {String(numero).padStart(2, "0")}
            </span>
            <span className="truncate font-mono">
               {sessao.origem || "----"}
            </span>
            <span className="shrink-0 text-gray-400">→</span>
            <span className="truncate font-mono">
               {sessao.destino || "----"}
            </span>
         </div>
         <div className="flex items-center justify-between gap-2 text-xs tabular-nums">
            <span
               className="truncate text-gray-500"
               title={sessao.data ? formatDateFull(sessao.data) : undefined}
            >
               {sessao.data ? isoDateToShort(sessao.data) : "--/--"}
               {foraDoAno && (
                  <span
                     className="ml-1 font-semibold text-amber-700"
                     title={`Ano ${sessao.data.slice(0, 4)} fora da referência (${anoRef}) — corrija a data`}
                  >
                     /{sessao.data.slice(0, 4)}
                  </span>
               )}
               <span className="mx-1 text-gray-300">·</span>
               {sessao.dep ? formatTime(sessao.dep) : "--:--"}–
               {sessao.arr ? formatTime(sessao.arr) : "--:--"}
            </span>
            <span className="shrink-0 font-mono text-sm font-semibold text-gray-900">
               {minutesToTime(sessao.tvoo)}
            </span>
         </div>
         {(isNew || isDirty) && (
            <div className="flex flex-wrap justify-end gap-1.5 pt-1">
               <Badge
                  color={isNew ? "gray" : "warning"}
                  icon={isNew ? HiSparkles : HiPencil}
                  title={
                     isNew
                        ? "Esta sessão é um rascunho e ainda não foi salva"
                        : "Esta sessão foi alterada e ainda não foi salva"
                  }
               >
                  {isNew ? "Rascunho" : "Alterada"}
               </Badge>
            </div>
         )}
      </button>
   );
}
