import type { ReactNode } from "react";

export function MetarInfoTile({
   icon,
   label,
   value,
   sub,
   highlight,
}: {
   icon: ReactNode;
   label: string;
   value: string;
   sub?: string;
   highlight?: boolean;
}) {
   return (
      <div
         className={`flex flex-col gap-1 rounded-xl p-3 ${highlight ? "bg-amber-50 ring-1 ring-amber-200" : "bg-gray-50"}`}
      >
         <div className="flex items-center gap-1.5 text-gray-500">
            <span className="text-base">{icon}</span>
            <span className="text-xs font-medium tracking-wide uppercase">
               {label}
            </span>
         </div>
         <p className="text-lg font-bold text-gray-800">{value}</p>
         {sub && <p className="text-xs text-gray-500">{sub}</p>}
      </div>
   );
}
