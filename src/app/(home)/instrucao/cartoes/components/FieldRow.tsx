import {
   getCartaoStatus,
   getDaysLabel,
   formatDate,
} from "../utils/cartaoStatus";
import { getStatusColors } from "../utils/statusColors";

export default function FieldRow({
   label,
   dateStr,
}: {
   label: string;
   dateStr: string | null | undefined;
}) {
   if (!dateStr) {
      return (
         <div className="flex items-center justify-between border-b border-slate-100 py-1 last:border-0">
            <span className="text-xs text-gray-500">{label}</span>
            <span className="text-xs font-normal text-gray-300">—</span>
         </div>
      );
   }
   const status = getCartaoStatus(dateStr);
   const colors = getStatusColors(status);
   return (
      <div className="flex items-center justify-between border-b border-slate-100 py-1 last:border-0">
         <span className="text-xs text-gray-500">{label}</span>
         <span className="flex items-center gap-1.5 text-xs font-medium">
            <span
               className="inline-block shrink-0 rounded-full"
               style={{ backgroundColor: colors.dot, width: 7, height: 7 }}
            />
            <span className="font-mono text-sm">{formatDate(dateStr)}</span>
            <span className="text-xs text-gray-400">
               ({getDaysLabel(dateStr)})
            </span>
         </span>
      </div>
   );
}
