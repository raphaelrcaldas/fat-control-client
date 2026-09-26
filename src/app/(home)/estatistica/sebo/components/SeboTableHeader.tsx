import { TableHead, TableRow, TableHeadCell } from "flowbite-react";
import type { InfoColumnConfig } from "../types";

export function SeboTableHeader({
   visibleCols,
}: {
   visibleCols: InfoColumnConfig[];
}) {
   return (
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
            <TableHeadCell className="px-4 text-center">DSV</TableHeadCell>
            {visibleCols.map((col) => (
               <TableHeadCell key={col.key} className="text-center">
                  {col.label}
               </TableHeadCell>
            ))}
            <TableHeadCell className="px-6 text-center">ANO</TableHeadCell>
         </TableRow>
      </TableHead>
   );
}
