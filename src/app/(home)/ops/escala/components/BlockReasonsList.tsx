import clsx from "clsx";
import { MdMedicalServices, MdEventBusy } from "react-icons/md";
import type { BlockReason } from "../types";

interface BlockReasonsListProps {
   reasons: BlockReason[];
}

export function BlockReasonsList({ reasons }: BlockReasonsListProps) {
   if (reasons.length === 0) return null;

   return (
      <ul className="mt-2 flex flex-col gap-1">
         {reasons.map((r, idx) => {
            const isCemal = r.kind === "cemal";
            const Icon = isCemal ? MdMedicalServices : MdEventBusy;
            return (
               <li
                  key={idx}
                  className={clsx(
                     "flex items-center gap-2 rounded-md border px-2 py-1 text-[11px] tracking-wide",
                     isCemal
                        ? "border-rose-200 bg-rose-50/80 text-rose-900"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                  )}
               >
                  <Icon
                     className={clsx(
                        "shrink-0 text-base",
                        isCemal ? "text-rose-700" : "text-slate-500"
                     )}
                     aria-hidden="true"
                  />
                  <span className="flex-1 font-semibold uppercase">
                     {r.label}
                  </span>
                  {r.detail && (
                     <span className="font-mono text-[10px] tabular-nums opacity-80">
                        {r.detail}
                     </span>
                  )}
               </li>
            );
         })}
      </ul>
   );
}
