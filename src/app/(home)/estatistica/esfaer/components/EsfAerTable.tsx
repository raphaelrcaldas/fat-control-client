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
import type { EsfAerResumoItem } from "services/routes/estatistica/esfAer";
import { MONTH_LABELS } from "../constants";
import { formatMinutes, getDescricaoStyles } from "../utils";

interface EsfAerTableProps {
   items: EsfAerResumoItem[];
   totalAlocado: number;
   totalVoado: number;
   totalSaldo: number;
   totalMesesVoados: number[];
}

export function EsfAerTable({
   items,
   totalAlocado,
   totalVoado,
   totalSaldo,
   totalMesesVoados,
}: EsfAerTableProps) {
   return (
      <div className="w-full overflow-x-auto rounded border border-slate-200 bg-white font-mono">
         <Table
            striped
            theme={{
               root: { base: "text-sm text-center" },
               body: { cell: { base: "p-2" } },
               head: {
                  cell: {
                     base: "p-2 bg-slate-100 border-b border-slate-300 text-sm",
                  },
               },
            }}
         >
            <TableHead>
               <TableRow>
                  <TableHeadCell>Esforço Aéreo</TableHeadCell>
                  <TableHeadCell>ALOCADO</TableHeadCell>
                  <TableHeadCell>VOADO</TableHeadCell>
                  <TableHeadCell className="border-r border-slate-300">
                     SALDO
                  </TableHeadCell>
                  {MONTH_LABELS.map((m) => (
                     <TableHeadCell key={m}>{m}</TableHeadCell>
                  ))}
               </TableRow>
            </TableHead>
            <TableBody className="divide-y">
               {items.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-200">
                     <TableCell className={getDescricaoStyles(item.descricao)}>
                        {item.descricao}
                     </TableCell>
                     <TableCell className="font-semibold text-slate-600">
                        {minutesToTime(item.alocado)}
                     </TableCell>
                     <TableCell
                        className={clsx({
                           "text-slate-300": item.voado === 0,
                        })}
                     >
                        {minutesToTime(item.voado)}
                     </TableCell>
                     <TableCell
                        className={clsx(
                           "border-r border-slate-300 font-semibold text-slate-800",
                           {
                              "text-green-600": item.saldo > 0,
                              "text-red-600": item.saldo < 0,
                              "text-slate-600": item.saldo === 0,
                           }
                        )}
                     >
                        {formatMinutes(item.saldo)}
                     </TableCell>
                     {item.meses_voados.map((val, i) => (
                        <TableCell
                           key={MONTH_LABELS[i]}
                           className={clsx("text-slate-300", {
                              "font-bold text-slate-500": val > 0,
                           })}
                        >
                           {minutesToTime(val)}
                        </TableCell>
                     ))}
                  </TableRow>
               ))}

               {/* Footer / Total row */}
               <TableRow className="font-semibold text-slate-800">
                  <TableCell className="bg-slate-300">TOTAL</TableCell>
                  <TableCell className="bg-slate-300">
                     {minutesToTime(totalAlocado)}
                  </TableCell>
                  <TableCell className="bg-slate-300">
                     {minutesToTime(totalVoado)}
                  </TableCell>
                  <TableCell className="border-r border-slate-300 bg-slate-300">
                     {formatMinutes(totalSaldo)}
                  </TableCell>
                  {totalMesesVoados.map((val, i) => (
                     <TableCell key={MONTH_LABELS[i]} className="bg-slate-300">
                        {minutesToTime(val)}
                     </TableCell>
                  ))}
               </TableRow>
            </TableBody>
         </Table>
      </div>
   );
}
