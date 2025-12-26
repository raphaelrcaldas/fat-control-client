import clsx from "clsx";
import { statusConfig } from "../constants";
import { StatusType } from "../types";

interface StatusBadgeProps {
   status: StatusType;
}

export function StatusBadge({ status }: StatusBadgeProps) {
   const config = statusConfig[status];
   return (
      <span
         className={clsx(
            "inline-flex w-full items-center justify-center gap-1.5",
            "rounded-full px-3 py-1",
            "text-xs font-bold uppercase",
            "border",
            config.bg,
            config.text,
            config.border
         )}
      >
         {status}
      </span>
   );
}
