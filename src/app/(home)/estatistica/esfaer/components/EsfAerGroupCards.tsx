import clsx from "clsx";
import { minutesToTime } from "@/../utils/dateHandler";
import { formatMinutes, type GroupSummary } from "../utils";

const GROUP_STYLES: Record<string, { border: string; title: string }> = {
   COMPREP: {
      border: "border-orange-400",
      title: "text-orange-500",
   },
   COMAE: {
      border: "border-blue-400",
      title: "text-blue-500",
   },
   DCTA: {
      border: "border-slate-400",
      title: "text-slate-600",
   },
};

interface EsfAerGroupCardsProps {
   groups: GroupSummary[];
}

export function EsfAerGroupCards({ groups }: EsfAerGroupCardsProps) {
   return (
      <div className="grid w-2/3 grid-cols-3 gap-4">
         {groups.map((group) => {
            const styles = GROUP_STYLES[group.label] ?? {
               border: "border-gray-300",
               title: "text-gray-700",
            };

            return (
               <div
                  key={group.label}
                  className={clsx(
                     "rounded-lg border-t-4 bg-white p-4 shadow-sm",
                     styles.border
                  )}
               >
                  <h3 className={clsx("mb-3 text-sm font-bold", styles.title)}>
                     {group.label}
                  </h3>
                  <div className="space-y-1 text-sm">
                     <div className="flex justify-between">
                        <span className="text-gray-500">Alocado</span>
                        <span className="font-semibold text-slate-700">
                           {minutesToTime(group.alocado)}
                        </span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-gray-500">Voado</span>
                        <span className="text-slate-600">
                           {minutesToTime(group.voado)}
                        </span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-gray-500">Saldo</span>
                        <span
                           className={clsx("font-semibold", {
                              "text-green-600": group.saldo > 0,
                              "text-red-600": group.saldo < 0,
                              "text-slate-600": group.saldo === 0,
                           })}
                        >
                           {formatMinutes(group.saldo)}
                        </span>
                     </div>
                  </div>
               </div>
            );
         })}
      </div>
   );
}
