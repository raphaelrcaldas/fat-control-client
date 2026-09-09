"use client";

import clsx from "clsx";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import { formatDateTimeShort, isoDateToShort } from "utils/dateHandler";
import { getIndispOption } from "@/constants/ops/indisponibilidades";
import { CrewIndispList } from "services/routes/indisps";
import { useLastIndisps, type LastIndispItem } from "./hooks/useLastIndisps";
import { useIndispModalActions } from "../../context/indispModalContext";

export function LastIndisps({ indisps }: { indisps: CrewIndispList[] }) {
   const lastIndisps = useLastIndisps(indisps);
   const { openForm } = useIndispModalActions();

   return (
      <div className="flex min-h-0 w-full flex-col gap-3 rounded border border-slate-200 bg-white p-3 shadow-sm">
         <h2 className="border-b border-slate-200 pb-2 text-center text-base font-bold text-slate-800">
            Últimas Atualizações
         </h2>

         <div className="grid min-h-0 flex-1 grid-cols-[max-content_max-content_max-content_max-content_max-content] content-start justify-between gap-x-2 gap-y-0.5 overflow-y-auto">
            <div className="sticky top-0 z-10 col-span-5 grid grid-cols-subgrid items-center justify-items-center border-b border-slate-200 bg-white py-2 text-center text-[9px] font-semibold tracking-wide text-slate-500 uppercase">
               <span>Trip.</span>
               <span>Motivo</span>
               <span>Período</span>
               <span>Atualização</span>
               <span title="Situação">Sit.</span>
            </div>
            {lastIndisps.length === 0 && (
               <p className="col-span-5 p-3 text-center text-sm text-slate-600">
                  Nenhuma atualização neste período.
               </p>
            )}
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

   const status = item.isDeleted
      ? "Excluído"
      : item.wasModified
        ? "Alterado"
        : "Criado";
   return (
      <button
         type="button"
         onClick={onClick}
         aria-label={`${item.trig}, ${indispTheme?.label ?? item.mtv}, ${dateIni} a ${dateEnd}, ${status} em ${lastChangeDate}`}
         title={`${indispTheme?.label ?? item.mtv} · ${status} em ${lastChangeDate}`}
         className={clsx(
            "col-span-5 grid w-full grid-cols-subgrid items-center justify-items-center rounded border-b border-slate-100 py-1 text-center text-xs whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none",
            item.isDeleted
               ? "bg-red-50 hover:bg-red-100"
               : item.wasModified
                 ? "bg-amber-50 hover:bg-amber-100"
                 : "hover:bg-slate-50"
         )}
      >
         <span className="font-mono font-bold text-slate-800 uppercase">
            {item.trig}
         </span>
         <span
            className={clsx(
               "rounded px-1 py-0.5 text-center font-semibold uppercase",
               item.isDeleted
                  ? "bg-slate-100 text-slate-600 line-through"
                  : indispTheme?.bar
            )}
         >
            {item.mtv}
         </span>
         <span
            className={clsx(
               "text-center font-mono text-slate-600",
               item.isDeleted && "line-through"
            )}
         >
            {dateIni}–{dateEnd}
         </span>
         <span className="shrink-0 font-mono text-slate-600">
            {lastChangeDate}
         </span>
         <span className="flex items-center justify-center" aria-hidden>
            {item.isDeleted ? (
               <HiOutlineTrash className="h-3.5 w-3.5 text-red-700" />
            ) : item.wasModified ? (
               <HiOutlinePencil className="h-3.5 w-3.5 text-amber-700" />
            ) : null}
         </span>
      </button>
   );
}
