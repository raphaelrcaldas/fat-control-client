import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";
import { minutesToTime } from "utils/dateHandler";
import type { ResumoMensal } from "services/routes/estatistica/relatorioMensal";

export function TotaisMensais({
   resumo,
   titulo,
}: {
   resumo: ResumoMensal;
   titulo: string;
}) {
   return (
      <div
         role="region"
         aria-label={`${titulo}: totais por período`}
         tabIndex={0}
         className="focus-visible:outline-primary-600 overflow-x-auto focus-visible:outline-2 focus-visible:-outline-offset-2"
      >
         <Table hoverable className="text-xs sm:text-sm">
            <TableHead>
               <TableRow>
                  {[
                     "Período",
                     "Horas",
                     "Diurno",
                     "Noturno",
                     "NVG",
                     "Pousos",
                  ].map((nome) => (
                     <TableHeadCell
                        key={nome}
                        className="px-2 py-2 text-center text-slate-600"
                     >
                        {nome}
                     </TableHeadCell>
                  ))}
               </TableRow>
            </TableHead>
            <TableBody className="divide-y divide-slate-200">
               {[
                  { periodo: "Mês", metricas: resumo.total },
                  { periodo: "Ano", metricas: resumo.acumulado_ano },
                  { periodo: "Geral", metricas: resumo.acumulado_geral },
               ].map(({ periodo, metricas }) => (
                  <TableRow key={periodo}>
                     <TableCell className="px-2 py-2 text-center font-semibold text-slate-900">
                        {periodo}
                     </TableCell>
                     {[
                        metricas.tvoo,
                        metricas.diurno,
                        metricas.noturno,
                        metricas.nvg,
                     ].map((valor, i) => (
                        <TableCell
                           key={i}
                           className="px-2 py-2 text-center text-slate-600 tabular-nums"
                        >
                           {minutesToTime(valor)}
                        </TableCell>
                     ))}
                     <TableCell className="px-2 py-2 text-center text-slate-600 tabular-nums">
                        {metricas.pousos}
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
   );
}
