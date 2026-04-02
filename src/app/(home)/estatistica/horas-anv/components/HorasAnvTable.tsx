"use client";

import { Fragment } from "react";
import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";
import clsx from "clsx";
import { minutesToTime } from "@/../utils/dateHandler";
import type { AnvHorasResponse } from "services/routes/estatistica/horasAnv";

const MONTH_LABELS = [
   "jan",
   "fev",
   "mar",
   "abr",
   "mai",
   "jun",
   "jul",
   "ago",
   "set",
   "out",
   "nov",
   "dez",
];

interface HorasAnvTableProps {
   data: AnvHorasResponse;
}

export function HorasAnvTable({ data }: HorasAnvTableProps) {
   return (
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
         <Table
            theme={{
               root: {
                  base: "text-center whitespace-nowrap text-base",
               },
               body: { cell: { base: "px-1.5 py-1" } },
               head: { cell: { base: "px-1.5 py-1.5 bg-gray-200" } },
            }}
         >
            <TableHead>
               <TableRow>
                  <TableHeadCell className="border-r border-gray-300 font-bold">
                     ANV
                  </TableHeadCell>
                  {MONTH_LABELS.map((m) => (
                     <TableHeadCell
                        key={m}
                        colSpan={2}
                        className="border-x border-gray-300"
                     >
                        {m}
                     </TableHeadCell>
                  ))}
                  <TableHeadCell
                     colSpan={2}
                     className="border-l border-gray-300 font-bold"
                  >
                     TOTAL
                  </TableHeadCell>
               </TableRow>
            </TableHead>

            <TableBody className="divide-y">
               {data.items.map((item) => (
                  <TableRow key={item.matricula} className="hover:bg-gray-50">
                     <TableCell className="border-r border-gray-300 font-bold text-gray-800">
                        {item.matricula}
                     </TableCell>
                     {item.meses.map((mes, i) => {
                        const hasData = mes.tvoo > 0 || mes.pousos > 0;
                        return (
                           <Fragment key={i}>
                              <TableCell
                                 className={clsx(
                                    hasData
                                       ? "font-semibold text-gray-700"
                                       : "text-gray-300"
                                 )}
                              >
                                 {minutesToTime(mes.tvoo)}
                              </TableCell>
                              <TableCell
                                 className={clsx(
                                    "border-r border-gray-200",
                                    hasData
                                       ? "font-semibold text-gray-700"
                                       : "text-gray-300"
                                 )}
                              >
                                 {mes.pousos}
                              </TableCell>
                           </Fragment>
                        );
                     })}
                     <TableCell
                        className={clsx(
                           "bg-gray-50 font-semibold",
                           item.total_tvoo > 0
                              ? "text-gray-800"
                              : "text-gray-300"
                        )}
                     >
                        {minutesToTime(item.total_tvoo)}
                     </TableCell>
                     <TableCell
                        className={clsx(
                           "bg-gray-50 font-semibold",
                           item.total_pousos > 0
                              ? "text-gray-800"
                              : "text-gray-300"
                        )}
                     >
                        {item.total_pousos}
                     </TableCell>
                  </TableRow>
               ))}

               {/* TOTAL row */}
               <TableRow className="font-semibold text-gray-800">
                  <TableCell className="border-r border-gray-300 bg-gray-200">
                     TOTAL
                  </TableCell>
                  {data.total_meses.map((mes, i) => (
                     <Fragment key={i}>
                        <TableCell className="bg-gray-200">
                           {minutesToTime(mes.tvoo)}
                        </TableCell>
                        <TableCell className="border-r border-gray-200 bg-gray-200">
                           {mes.pousos}
                        </TableCell>
                     </Fragment>
                  ))}
                  <TableCell className="bg-gray-200">
                     {minutesToTime(data.total_tvoo)}
                  </TableCell>
                  <TableCell className="bg-gray-200">
                     {data.total_pousos}
                  </TableCell>
               </TableRow>
            </TableBody>
         </Table>
      </div>
   );
}
