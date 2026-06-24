import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";
import { minutesToTime } from "@/../utils/dateHandler";
import { useEsfAerMonthly } from "../hooks/useEsfAerMonthly";

interface EsfAerChartTableProps {
   totalAlocado: number;
   totalMeses: number[];
}

export function EsfAerChartTable({
   totalAlocado,
   totalMeses,
}: EsfAerChartTableProps) {
   const { rows } = useEsfAerMonthly(totalAlocado, totalMeses);

   return (
      <Table
         striped
         className="text-xs"
         theme={{
            root: {
               wrapper:
                  "relative overflow-x-auto rounded border border-slate-200 bg-white shadow-sm",
            },
         }}
      >
         <TableHead>
            <TableRow>
               <TableHeadCell>MES</TableHeadCell>
               <TableHeadCell className="text-center">PLANEJADO</TableHeadCell>
               <TableHeadCell className="text-center">VOADO</TableHeadCell>
               <TableHeadCell className="text-center">ACUMULADO</TableHeadCell>
            </TableRow>
         </TableHead>
         <TableBody className="divide-y">
            {rows.map((row) => (
               <TableRow key={row.label}>
                  <TableCell className="text-center font-medium text-gray-900">
                     {row.label}
                  </TableCell>
                  <TableCell className="text-center">
                     {minutesToTime(row.planejado)}
                  </TableCell>
                  <TableCell className="text-center">
                     {minutesToTime(row.voado)}
                  </TableCell>
                  <TableCell className="text-center">
                     {row.acumulado !== null
                        ? minutesToTime(row.acumulado)
                        : "-"}
                  </TableCell>
               </TableRow>
            ))}
         </TableBody>
      </Table>
   );
}
