import clsx from "clsx";
import { HiMoon, HiSun } from "react-icons/hi";
import { GiOwl } from "react-icons/gi";
import { FaClock } from "react-icons/fa";
import { minutesToTime } from "@/../utils/dateHandler";
import type { OIEtapaItem } from "services/routes/estatistica/etapas";

export const REG_CONFIG: Record<
   string,
   { label: string; icon: typeof HiSun; color: string }
> = {
   d: { label: "Diurno", icon: HiSun, color: "text-amber-500" },
   n: { label: "Noturno", icon: HiMoon, color: "text-indigo-500" },
   v: { label: "NVG", icon: GiOwl, color: "text-emerald-500" },
};

export function OIEtapasList({ items }: { items: OIEtapaItem[] }) {
   if (items.length === 0) return null;

   return (
      <div className="space-y-2">
         {items.map((oi, i) => {
            const reg = REG_CONFIG[oi.reg];
            const RegIcon = reg?.icon ?? HiSun;

            return (
               <div
                  key={i}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
               >
                  <div className="flex items-center gap-1.5">
                     <RegIcon
                        className={clsx(
                           "h-4 w-4",
                           reg?.color ?? "text-gray-500"
                        )}
                     />
                     <span className="w-12 text-center text-xs font-bold text-gray-700">
                        {reg?.label ?? oi.reg}
                     </span>
                  </div>

                  <div className="h-4 w-px bg-gray-200" />

                  <div className="flex items-center justify-center gap-1.5">
                     <FaClock className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                     <span className="font-mono text-sm font-bold text-gray-900">
                        {minutesToTime(oi.tvoo)}
                     </span>
                  </div>

                  <div className="h-4 w-px bg-gray-200" />

                  <span className="w-16 rounded-md bg-slate-100 px-2 py-1 text-center text-xs font-bold tracking-wider text-slate-800 uppercase">
                     {oi.tipo_missao_cod}
                  </span>

                  <span
                     className={clsx(
                        "rounded-lg border px-2.5 py-1 text-xs font-semibold",
                        oi.esf_aer.includes("COMAE")
                           ? "border-blue-200 bg-blue-50 text-blue-700"
                           : oi.esf_aer.includes("COMPREP")
                             ? "border-amber-200 bg-amber-50 text-amber-700"
                             : "border-gray-200 bg-gray-50 text-gray-700"
                     )}
                  >
                     {oi.esf_aer}
                  </span>
               </div>
            );
         })}
      </div>
   );
}
