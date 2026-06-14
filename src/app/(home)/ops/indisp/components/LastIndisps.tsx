"use client";

import clsx from "clsx";
import { formatDateTimeShort, isoDateToShort } from "utils/dateHandler";
import { getIndispOption } from "@/constants/ops/indisponibilidades";
import { CrewIndispList } from "services/routes/indisps";
import { useLastIndisps, type LastIndispItem } from "../hooks/useLastIndisps";
import { useIndispModalActions } from "../context/indispModalContext";

export function LastIndisps({ indisps }: { indisps: CrewIndispList[] }) {
   const lastIndisps = useLastIndisps(indisps);
   const { openForm } = useIndispModalActions();

   return (
      <div className="h-fit w-fit rounded border border-slate-200 bg-white p-3 shadow">
         <h3 className="mb-3 border-b border-slate-200 pb-2 text-center text-base font-bold whitespace-nowrap text-gray-900">
            Últimas Atualizações
         </h3>

         <div className="flex flex-col gap-0.5">
            {lastIndisps.map((item, idx) => (
               <LastIndispRow
                  key={item.id ?? `${item.trig}-${item.created_at}-${idx}`}
                  item={item}
                  onClick={() =>
                     openForm({
                        trip: item.trip,
                        indisp: item,
                        readOnly: item.isDeleted,
                     })
                  }
               />
            ))}
         </div>
      </div>
   );
}

function LastIndispRow({
   item,
   onClick,
}: {
   item: LastIndispItem;
   onClick: () => void;
}) {
   const dateIni = isoDateToShort(item.date_start);
   const dateEnd = isoDateToShort(item.date_end);
   const lastChangeDate = formatDateTimeShort(item.lastChange);
   const indispTheme = getIndispOption(item.mtv);

   return (
      <div
         className={clsx(
            "flex cursor-pointer items-center gap-2 rounded border-b border-slate-100 px-2 py-1 text-xs uppercase transition-colors select-none last:border-b-0",
            item.isDeleted && "bg-red-100 hover:bg-red-200",
            !item.isDeleted &&
               item.wasModified &&
               "bg-yellow-100 hover:bg-yellow-200",
            !item.isDeleted && !item.wasModified && "hover:bg-blue-50"
         )}
         onClick={onClick}
      >
         <span
            className={clsx(
               "w-10 shrink-0 text-center font-bold",
               item.isDeleted ? "text-gray-500 line-through" : "text-gray-900"
            )}
         >
            {item.trig}
         </span>
         <span
            className={clsx(
               "w-12 shrink-0 rounded border border-slate-300 px-2 py-0.5 text-center text-xs font-semibold",
               item.isDeleted
                  ? "bg-gray-200 line-through"
                  : indispTheme?.color.bg
            )}
         >
            {item.mtv}
         </span>
         <span
            className={clsx(
               "w-24 shrink-0 text-center text-xs font-medium whitespace-nowrap",
               item.isDeleted ? "text-gray-500 line-through" : "text-gray-700"
            )}
         >
            {dateIni} <span className="text-gray-500 lowercase">a</span>{" "}
            {dateEnd}
         </span>

         <span className="w-24 shrink-0 text-center font-mono text-xs whitespace-nowrap text-gray-500">
            {lastChangeDate}
         </span>

         <span className="w-6 text-center">
            {item.isDeleted && <span title="Deletado">🗑️</span>}
            {!item.isDeleted && item.wasModified && (
               <span title="Modificado">✏️</span>
            )}
         </span>
      </div>
   );
}
