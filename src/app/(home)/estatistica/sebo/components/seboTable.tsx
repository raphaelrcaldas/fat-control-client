"use client";
import clsx from "clsx";
import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
   Spinner,
} from "flowbite-react";
import Tooltip from "./tooltip";
import { minutesToTime, isoDateToString } from "@/../utils/dateHandler";
import type { SeboTripItem } from "services/routes/estatistica/sebo";

interface SeboTableProps {
   trips: SeboTripItem[];
   activeRow: number;
   setRow: (index: number) => void;
   isLoading: boolean;
}

const getDsvColor = (value: number | null): string => {
   const styles =
      "rounded-lg text-white font-semibold px-2 py-1 text-xs inline-block min-w-[40px] text-center";

   if (value === null) return styles + " bg-slate-500";
   if (value > 45) return styles + " bg-red-500";
   if (value > 30) return styles + " bg-yellow-400 text-gray-800";
   return styles + " bg-green-500";
};

const getDsvTooltip = (dataUltVoo: string | null): string => {
   if (!dataUltVoo) return "Sem dados de voo";
   return isoDateToString(dataUltVoo);
};

const getOperBadgeClasses = (oper: string): string => {
   const lower = oper.toLowerCase();
   if (lower === "al") return "bg-green-100 text-green-700";
   if (lower === "op") return "bg-yellow-100 text-yellow-700";
   if (lower === "in") return "bg-red-100 text-red-700";
   if (lower === "ba") return "bg-orange-100 text-orange-700";
   return "bg-gray-100 text-gray-700";
};

const SeboTable = ({ trips, activeRow, setRow, isLoading }: SeboTableProps) => {
   if (isLoading) {
      return (
         <div className="flex h-64 items-center justify-center rounded-lg bg-white shadow-md">
            <Spinner color="failure" size="lg" />
         </div>
      );
   }

   return (
      <div className="overflow-x-auto rounded-lg uppercase shadow-md">
         <Table hoverable striped>
            <TableHead>
               <TableRow>
                  <TableHeadCell className="hidden text-center 2xl:table-cell">
                     PG
                  </TableHeadCell>
                  <TableHeadCell className="hidden text-center 2xl:table-cell">
                     NOME DE GUERRA
                  </TableHeadCell>
                  <TableHeadCell className="text-center">TRIG</TableHeadCell>
                  <TableHeadCell className="text-center">OP</TableHeadCell>
                  <TableHeadCell className="text-center">DSV</TableHeadCell>
                  <TableHeadCell className="text-center">TOTAL</TableHeadCell>
                  <TableHeadCell className="text-center">ANO</TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className="divide-y">
               {trips.length > 0 ? (
                  trips.map((trip, index) => (
                     <TableRow
                        key={trip.trip_id}
                        onClick={() => setRow(index)}
                        className={clsx(
                           "cursor-pointer border-l-4 transition-all duration-150",
                           {
                              "border-l-blue-500 bg-blue-50! hover:bg-blue-100!":
                                 index === activeRow,
                              "border-l-transparent": index !== activeRow,
                           }
                        )}
                     >
                        <TableCell className="hidden text-center font-semibold text-gray-700 2xl:table-cell">
                           {trip.p_g}
                        </TableCell>
                        <TableCell className="hidden text-center font-semibold text-nowrap text-gray-800 2xl:table-cell">
                           {trip.nome_guerra}
                        </TableCell>
                        <TableCell className="text-center font-bold text-gray-900">
                           {trip.trig}
                        </TableCell>
                        <TableCell className="text-center">
                           <span
                              className={clsx(
                                 "rounded-full px-3 py-1 text-xs font-bold",
                                 getOperBadgeClasses(trip.oper)
                              )}
                           >
                              {trip.oper}
                           </span>
                        </TableCell>
                        <TableCell className="text-center">
                           <Tooltip
                              content={getDsvTooltip(trip.voo.data_ult_voo)}
                           >
                              <span className={getDsvColor(trip.voo.dsv)}>
                                 {trip.voo.dsv !== null ? trip.voo.dsv : "—"}
                              </span>
                           </Tooltip>
                        </TableCell>
                        <TableCell className="text-center font-medium text-gray-700">
                           {minutesToTime(trip.voo.h_total)}
                        </TableCell>
                        <TableCell className="text-center font-bold text-blue-600">
                           {minutesToTime(trip.voo.h_ano)}
                        </TableCell>
                     </TableRow>
                  ))
               ) : (
                  <TableRow>
                     <TableCell
                        colSpan={7}
                        className="py-12 text-center text-gray-500"
                     >
                        Nenhum registro encontrado
                     </TableCell>
                  </TableRow>
               )}
            </TableBody>
         </Table>
      </div>
   );
};

export default SeboTable;
