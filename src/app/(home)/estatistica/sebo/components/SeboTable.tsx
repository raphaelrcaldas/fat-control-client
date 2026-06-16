"use client";
import clsx from "clsx";
import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
   Tooltip,
} from "flowbite-react";
import { minutesToTime } from "@/../utils/dateHandler";
import type { SeboTripItem } from "services/routes/estatistica/sebo";
import { INFO_COLUMNS_CONFIG } from "../constants";
import type { InfoColumn } from "../types";
import {
   getDsvBadgeClasses,
   getDsvTooltip,
   getOperBadgeClasses,
} from "../utils";
import { CardDateCell } from "./CardDateCell";

interface SeboTableProps {
   trips: SeboTripItem[];
   activeRow: number;
   setRow: (index: number) => void;
   infoCols: Record<InfoColumn, boolean>;
   isPilot: boolean;
}

export function SeboTable({
   trips,
   activeRow,
   setRow,
   infoCols,
   isPilot,
}: SeboTableProps) {
   // Colunas de cartões visíveis: ligadas no toggle e, se exclusivas de
   // piloto, só quando a função é Piloto. Fonte única para header e corpo.
   const visibleCols = INFO_COLUMNS_CONFIG.filter(
      (c) => infoCols[c.key] && (isPilot || !c.pilotOnly)
   );

   return (
      <div className="overflow-x-auto rounded border border-slate-200 bg-white uppercase shadow-sm">
         <Table hoverable theme={{ head: { cell: { base: "bg-white" } } }}>
            <TableHead>
               <TableRow>
                  <TableHeadCell className="hidden text-center lg:table-cell">
                     PG
                  </TableHeadCell>
                  <TableHeadCell className="hidden min-w-40 text-center lg:table-cell">
                     NOME DE GUERRA
                  </TableHeadCell>
                  <TableHeadCell className="sticky left-0 z-20 bg-white px-4 text-center lg:hidden">
                     TRIG
                  </TableHeadCell>
                  <TableHeadCell className="px-4 text-center">OP</TableHeadCell>
                  <TableHeadCell className="px-4 text-center">
                     DSV
                  </TableHeadCell>
                  {visibleCols.map((col) => (
                     <TableHeadCell key={col.key} className="text-center">
                        {col.label}
                     </TableHeadCell>
                  ))}
                  <TableHeadCell className="px-6 text-center">
                     ANO
                  </TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className="divide-y">
               {trips.map((trip, index) => (
                  <TableRow
                     key={trip.trip_id}
                     onClick={() => setRow(index)}
                     className={clsx(
                        "group cursor-pointer border-l-4 transition-colors",
                        index === activeRow
                           ? "border-l-red-500 bg-red-50! hover:bg-red-100!"
                           : "border-l-transparent"
                     )}
                  >
                     <TableCell className="hidden px-0.5 text-center font-semibold text-slate-700 lg:table-cell">
                        {trip.p_g}
                     </TableCell>
                     <TableCell className="hidden px-0.5 text-center font-semibold text-nowrap text-slate-800 lg:table-cell">
                        {trip.nome_guerra}
                     </TableCell>
                     <TableCell
                        className={clsx(
                           "sticky left-0 z-10 px-0.5 text-center font-bold text-slate-900 transition-colors lg:hidden",
                           index === activeRow
                              ? "bg-red-50 group-hover:bg-red-100"
                              : "bg-white group-hover:bg-gray-50"
                        )}
                     >
                        {trip.trig}
                     </TableCell>
                     <TableCell className="px-0.5 text-center">
                        <span className={getOperBadgeClasses(trip.oper)}>
                           {trip.oper}
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
                     <TableCell className="px-0.5 text-center font-bold text-red-600">
                        {minutesToTime(trip.voo.h_ano)}
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
   );
}
