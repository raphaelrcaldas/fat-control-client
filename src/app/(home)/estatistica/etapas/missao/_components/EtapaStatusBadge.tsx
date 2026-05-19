"use client";

import { HiCheckCircle, HiClock, HiExclamationCircle } from "react-icons/hi";
import clsx from "clsx";

import type { EtapaStatus } from "./EtapaSidebarItem";

interface Props {
   status: EtapaStatus;
   size?: "sm" | "md";
}

const STATUS_CONFIG: Record<
   EtapaStatus,
   { label: string; classes: string; Icon: typeof HiCheckCircle | null }
> = {
   ok: {
      label: "OK",
      classes: "bg-green-50 text-green-700 ring-green-200",
      Icon: HiCheckCircle,
   },
   verificar: {
      label: "Verificar",
      classes: "bg-amber-50 text-amber-700 ring-amber-200",
      Icon: HiExclamationCircle,
   },
   editando: {
      label: "Incompleta",
      classes: "bg-amber-50 text-amber-700 ring-amber-200",
      Icon: HiClock,
   },
   rascunho: {
      label: "Rascunho",
      classes: "bg-gray-50 text-gray-500 ring-gray-200",
      Icon: null,
   },
};

export function EtapaStatusBadge({ status, size = "sm" }: Props) {
   const { label, classes, Icon } = STATUS_CONFIG[status];
   return (
      <span
         className={clsx(
            "inline-flex items-center gap-1 rounded-full font-medium ring-1 ring-inset",
            classes,
            size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
         )}
      >
         {Icon ? (
            <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
         ) : (
            <span
               className={clsx(
                  "rounded-full bg-gray-300",
                  size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2"
               )}
            />
         )}
         {label}
      </span>
   );
}
