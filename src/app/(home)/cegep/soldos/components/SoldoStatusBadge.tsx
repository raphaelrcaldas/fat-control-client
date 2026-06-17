import clsx from "clsx";
import { SoldoStatus } from "../helpers/soldoHelpers";

interface SoldoStatusBadgeProps {
   status: SoldoStatus;
   size?: "sm" | "xs";
}

const STATUS_CONFIG: Record<
   SoldoStatus,
   { label: string; text: string; dot: string; pulse: boolean }
> = {
   vigente: {
      label: "Vigente",
      text: "text-green-600",
      dot: "bg-green-500",
      pulse: true,
   },
   proximo: {
      label: "Próximo",
      text: "text-blue-600",
      dot: "bg-blue-500",
      pulse: false,
   },
   anterior: {
      label: "Anterior",
      text: "text-gray-400",
      dot: "bg-gray-300",
      pulse: false,
   },
};

export default function SoldoStatusBadge({
   status,
   size = "sm",
}: SoldoStatusBadgeProps) {
   const cfg = STATUS_CONFIG[status];
   const dotSize = size === "xs" ? "h-1.5 w-1.5" : "h-2 w-2";

   return (
      <span
         className={clsx(
            "inline-flex items-center gap-1.5",
            size === "xs" ? "text-xs" : "text-sm",
            cfg.text
         )}
      >
         <span
            className={clsx(
               "rounded-full",
               dotSize,
               cfg.dot,
               cfg.pulse && "animate-pulse"
            )}
         />
         {cfg.label}
      </span>
   );
}
