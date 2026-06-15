import type { CartaoStatus } from "../types";
import { getStatusColors } from "../utils/statusColors";

export default function StatusBadge({
   label,
   status,
   daysLabel,
}: {
   label: string;
   status: CartaoStatus;
   daysLabel: string;
}) {
   const colors = getStatusColors(status);
   return (
      <span
         className="inline-flex w-44 shrink-0 items-center justify-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium whitespace-nowrap"
         style={{
            backgroundColor: colors.badgeBg,
            border: `0.5px solid ${colors.badgeBorder}`,
            color: colors.text,
         }}
      >
         <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: colors.dot }}
         />
         {label} · {status === "empty" ? "—" : daysLabel}
      </span>
   );
}
