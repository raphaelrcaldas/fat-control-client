import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";
import { minutesToTime } from "@/../utils/dateHandler";
import { MONTH_LABELS } from "../../constants";
import type { EsfAerImportRow } from "../../utils";

interface ImportPreviewTableProps {
   rows: EsfAerImportRow[];
}

export function ImportPreviewTable({ rows }: ImportPreviewTableProps) {
   return (
      <Table
         striped
         theme={{
            root: {
               base: "text-xs text-center",
               wrapper:
                  "relative max-h-96 overflow-auto rounded border border-slate-200",
            },
            body: { cell: { base: "px-2 py-1" } },
            head: { cell: { base: "px-2 py-1 bg-gray-200" } },
         }}
      >
         <TableHead>
            <TableRow>
               <TableHeadCell>TIPO</TableHeadCell>
               <TableHeadCell>MODELO</TableHeadCell>
               <TableHeadCell>GRUPO</TableHeadCell>
               <TableHeadCell>PROGRAMA</TableHeadCell>
               <TableHeadCell>SUBPROGRAMA</TableHeadCell>
               <TableHeadCell>APLICAÇÃO</TableHeadCell>
               {MONTH_LABELS.map((m) => (
                  <TableHeadCell key={m}>{m}</TableHeadCell>
               ))}
               <TableHeadCell>ALOCADAS</TableHeadCell>
               <TableHeadCell>GASTAS</TableHeadCell>
               <TableHeadCell>SALDO</TableHeadCell>
            </TableRow>
         </TableHead>
         <TableBody className="divide-y">
            {rows.map((row, idx) => (
               <TableRow key={idx}>
                  <TableCell className="whitespace-nowrap">
                     {row.tipo}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                     {row.modelo}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                     {row.grupo}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                     {row.programa}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                     {row.subprograma}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                     {row.aplicacao}
                  </TableCell>
                  {row.meses.map((val, i) => (
                     <TableCell key={MONTH_LABELS[i]}>
                        {minutesToTime(val)}
                     </TableCell>
                  ))}
                  <TableCell className="font-semibold">
                     {minutesToTime(row.horasAlocadas)}
                  </TableCell>
                  <TableCell>{minutesToTime(row.horasGastas)}</TableCell>
                  <TableCell className="font-semibold">
                     {minutesToTime(row.saldoHoras)}
                  </TableCell>
               </TableRow>
            ))}
         </TableBody>
      </Table>
   );
}
