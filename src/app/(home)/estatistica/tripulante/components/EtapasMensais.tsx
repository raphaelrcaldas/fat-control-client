import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";
import { formatTime, minutesToTime } from "utils/dateHandler";
import type { EtapaMensal } from "services/routes/estatistica/relatorioMensal";
import { DataRelatorio } from "./DataRelatorio";
import clsx from "clsx";

export const COLUNAS_MENSAIS = [
   "Tipo",
   "Matrícula",
   "Função",
   "Data",
   "Origem",
   "Destino",
   "DEP",
   "PSO",
   "Horas",
   "Diurno",
   "Noturno",
   "NVG",
   "Pousos",
];

export function EtapasMensais({
   etapas,
   titulo,
}: {
   etapas: EtapaMensal[];
   titulo: string;
}) {
   return (
      <div
         role="region"
         aria-label={`${titulo}: etapas do mês`}
         tabIndex={0}
         className="focus-visible:outline-primary-600 overflow-x-auto focus-visible:outline-2 focus-visible:-outline-offset-2"
      >
         <Table hoverable className="min-w-[960px] text-xs lg:text-sm">
            <TableHead>
               <TableRow>
                  {COLUNAS_MENSAIS.map((coluna) => (
                     <TableHeadCell
                        key={coluna}
                        className="px-3 py-2 text-center whitespace-nowrap text-slate-600"
                     >
                        {coluna}
                     </TableHeadCell>
                  ))}
               </TableRow>
            </TableHead>
            <TableBody className="divide-y divide-slate-200">
               {etapas.map((etapa) => (
                  <TableRow key={etapa.id}>
                     <TableCell className="px-3 py-2 text-center whitespace-nowrap text-slate-900 uppercase">
                        {etapa.modelo}
                     </TableCell>
                     <TableCell className="px-3 py-2 text-center whitespace-nowrap text-slate-600 tabular-nums">
                        {etapa.anv}
                     </TableCell>
                     <TableCell className="px-3 py-2 text-center whitespace-nowrap text-slate-900 uppercase">
                        {etapa.funcoes
                           .map((funcao) => funcao.func_bordo)
                           .join(", ")}
                     </TableCell>
                     <TableCell className="px-3 py-2 text-center whitespace-nowrap text-slate-600 tabular-nums">
                        <DataRelatorio data={etapa.data} />
                     </TableCell>
                     <TableCell className="px-3 py-2 text-center whitespace-nowrap text-slate-600 uppercase">
                        {etapa.origem}
                     </TableCell>
                     <TableCell className="px-3 py-2 text-center whitespace-nowrap text-slate-600 uppercase">
                        {etapa.destino}
                     </TableCell>
                     <TableCell className="px-3 py-2 text-center whitespace-nowrap text-slate-600 tabular-nums">
                        {formatTime(etapa.dep)}
                     </TableCell>
                     <TableCell className="px-3 py-2 text-center whitespace-nowrap text-slate-600 tabular-nums">
                        {formatTime(etapa.arr)}
                     </TableCell>
                     {[etapa.tvoo, etapa.diurno, etapa.noturno, etapa.nvg].map(
                        (valor, i) => (
                           <TableCell
                              key={i}
                              className={clsx(
                                 "px-3 py-2 text-center whitespace-nowrap tabular-nums",
                                 i === 0
                                    ? "font-semibold text-slate-900"
                                    : "text-slate-600"
                              )}
                           >
                              {minutesToTime(valor)}
                           </TableCell>
                        )
                     )}
                     <TableCell className="px-3 py-2 text-center text-slate-600 tabular-nums">
                        {etapa.pousos}
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
   );
}
