import clsx from "clsx";
import { BlockReasonsList } from "./BlockReasonsList";
import { DesadaptadoBadge } from "./DesadaptadoBadge";
import { minutesToTime } from "@/../utils/dateHandler";
import type { TripStatus } from "../types";

interface TripCardProps {
   status: TripStatus;
   index: number;
}

export function TripCard({ status, index }: TripCardProps) {
   const { trip, isAvailable, isDesadaptado, dsvDias, reasons } = status;

   return (
      <article
         className={clsx(
            "relative flex flex-col rounded border bg-white p-3 transition-shadow",
            isAvailable
               ? "border-slate-400 shadow-sm hover:shadow-md"
               : "border-slate-400/50 bg-slate-50/70 opacity-80"
         )}
      >
         <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-baseline gap-2">
               <span
                  className="font-mono text-[10px] text-slate-400 tabular-nums"
                  aria-hidden="true"
               >
                  {String(index).padStart(2, "0")}
               </span>
               <div className="min-w-0">
                  <p className="truncate text-sm leading-tight font-extrabold tracking-wide text-slate-900 uppercase">
                     {trip.trig ?? "—"}
                  </p>
               </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
               <span
                  className={clsx(
                     "inline-flex w-10 items-center justify-center rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase tabular-nums",
                     isAvailable
                        ? "border-slate-200 bg-slate-50 text-slate-700"
                        : "border-slate-200 bg-white text-slate-500"
                  )}
                  title={`Total de ${trip.quads_count} quads neste tipo`}
               >
                  {trip.quads_count}
               </span>
               <span
                  className={clsx(
                     "inline-flex w-14 items-center justify-center rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider tabular-nums",
                     isAvailable
                        ? "border-sky-200 bg-sky-50 text-sky-700"
                        : "border-slate-200 bg-white text-slate-500"
                  )}
                  title={`${minutesToTime(trip.tvoo_year)} de voo no ano`}
               >
                  {minutesToTime(trip.tvoo_year)}
               </span>
            </div>
         </div>

         {isAvailable && isDesadaptado && (
            <div className="mt-2">
               <DesadaptadoBadge dsvDias={dsvDias} />
            </div>
         )}

         {!isAvailable && <BlockReasonsList reasons={reasons} />}
      </article>
   );
}
