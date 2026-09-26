"use client";
import clsx from "clsx";
import { Table, TableBody, TableRow, TableCell, Tooltip } from "flowbite-react";
import { minutesToTime } from "@/../utils/dateHandler";
import { getOperSigla } from "@/constants/tripulantes/operacionalidade";
import type { SeboTripItem } from "services/routes/estatistica/sebo";
import { INFO_COLUMNS_CONFIG } from "../constants";
import type { InfoColumn } from "../types";
import {
   getDsvBadgeClasses,
   getDsvTooltip,
   getOperBadgeClasses,
} from "../utils";
import { SeboTableHeader } from "./SeboTableHeader";
import { CardDateCell } from "./CardDateCell";

interface SeboTableProps {
   trips: SeboTripItem[];
   activeTripId: number | null;
   onSelect: (tripId: number) => void;
   infoCols: Record<InfoColumn, boolean>;
   isPilot: boolean;
}

export function SeboTable({
   trips,
   activeTripId,
   onSelect,
   infoCols,
   isPilot,
}: SeboTableProps) {
   // Colunas de cartões visíveis: ligadas no toggle e, se exclusivas de
   // piloto, só quando a função é Piloto. Fonte única para header e corpo.
   const visibleCols = INFO_COLUMNS_CONFIG.filter(
      (c) => infoCols[c.key] && (isPilot || !c.pilotOnly)
   );

   return (
      <div className="overflow-x-auto rounded border border-slate-200 bg-white shadow-sm">
         <Table hoverable theme={{ head: { cell: { base: "bg-white" } } }}>
            <SeboTableHeader visibleCols={visibleCols} />
            <TableBody className="divide-y">
               {trips.map((trip, index) => (
                  <TableRow
                     key={trip.trip_id}
                     onClick={() => onSelect(trip.trip_id)}
                     // Roving tabindex: só a linha ativa entra no Tab (senão o
                     // teclado atravessa dezenas de linhas até o gráfico); as
                     // setas movem a seleção. `aria-current` porque
                     // `aria-selected` não é anunciado fora de `role="grid"`.
                     tabIndex={trip.trip_id === activeTripId ? 0 : -1}
                     aria-current={trip.trip_id === activeTripId || undefined}
                     onKeyDown={(event) => {
                        if (event.target !== event.currentTarget) return;
                        if (event.key === "Enter" || event.key === " ") {
                           event.preventDefault();
                           onSelect(trip.trip_id);
                           return;
                        }
                        const step =
                           event.key === "ArrowDown"
                              ? 1
                              : event.key === "ArrowUp"
                                ? -1
                                : 0;
                        const next = trips[index + step];
                        if (!step || !next) return;
                        event.preventDefault();
                        onSelect(next.trip_id);
                        const sibling =
                           step > 0
                              ? event.currentTarget.nextElementSibling
                              : event.currentTarget.previousElementSibling;
                        (sibling as HTMLElement | null)?.focus();
                     }}
                     className={clsx(
                        "group focus-visible:outline-primary-600 cursor-pointer border-l-4 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2",
                        trip.trip_id === activeTripId
                           ? "border-l-primary-500 bg-primary-50! hover:bg-primary-100!"
                           : "border-l-transparent"
                     )}
                  >
                     <TableCell className="hidden px-0.5 text-center font-semibold text-slate-700 uppercase lg:table-cell">
                        {trip.p_g}
                     </TableCell>
                     <TableCell className="hidden px-0.5 text-center font-semibold text-nowrap text-slate-800 uppercase lg:table-cell">
                        {trip.nome_guerra}
                     </TableCell>
                     <TableCell
                        className={clsx(
                           "sticky left-0 z-10 px-0.5 text-center font-bold text-slate-900 uppercase transition-colors lg:hidden",
                           trip.trip_id === activeTripId
                              ? "bg-primary-50 group-hover:bg-primary-100"
                              : "bg-white group-hover:bg-gray-50"
                        )}
                     >
                        {trip.trig}
                     </TableCell>
                     <TableCell className="px-0.5 text-center">
                        <span className={getOperBadgeClasses(trip.oper)}>
                           {getOperSigla(trip.oper, isPilot)}
                        </span>
                     </TableCell>
                     <TableCell className="px-0.5 text-center">
                        <Tooltip
                           content={getDsvTooltip(trip.voo.data_ult_voo)}
                           theme={{ target: "mx-auto w-fit" }}
                        >
                           <span className={getDsvBadgeClasses(trip.voo.dsv)}>
                              {trip.voo.dsv !== null ? trip.voo.dsv : "—"}
                           </span>
                        </Tooltip>
                     </TableCell>
                     {visibleCols.map((col) => (
                        <CardDateCell
                           key={col.key}
                           iso={trip.cartoes[col.key]}
                           label={col.tooltipLabel}
                        />
                     ))}
                     <TableCell className="text-primary-700 px-0.5 text-center font-bold">
                        {minutesToTime(trip.voo.h_ano)}
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
   );
}
