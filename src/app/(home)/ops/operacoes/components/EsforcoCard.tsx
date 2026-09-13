import {
   Badge,
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";
import { minutesToTime } from "@/../utils/dateHandler";
import type { EsforcoBloco } from "services/routes/ops/operacoes";

export function EsforcoCard({ esforco }: { esforco: EsforcoBloco }) {
   return (
      <section className="min-w-0 overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
         <header className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
            <h2 className="text-base font-bold text-slate-900">
               Esforço aéreo
            </h2>
            <Badge color="gray">
               {esforco.rows.length}{" "}
               {esforco.rows.length === 1 ? "esforço" : "esforços"}
            </Badge>
         </header>
         {esforco.rows.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-slate-600">
               Nenhum esforço aéreo registrado nas etapas associadas.
            </p>
         ) : (
            <Table aria-label="Esforço aéreo por categoria">
               <TableHead>
                  <TableRow>
                     <TableHeadCell className="px-4 normal-case">
                        Esforço aéreo
                     </TableHeadCell>
                     <TableHeadCell className="w-px px-2 text-right normal-case">
                        Etapas
                     </TableHeadCell>
                     <TableHeadCell className="w-px px-4 text-right normal-case">
                        Horas
                     </TableHeadCell>
                  </TableRow>
               </TableHead>
               <TableBody className="divide-y divide-slate-100">
                  {esforco.rows.map((r) => (
                     <TableRow key={r.esf_aer_id} className="hover:bg-slate-50">
                        <TableCell className="max-w-0 px-4 text-slate-700">
                           <span className="block truncate" title={r.descricao}>
                              {r.descricao}
                           </span>
                        </TableCell>
                        <TableCell className="px-2 text-right whitespace-nowrap text-slate-600 tabular-nums">
                           {r.etapas}
                        </TableCell>
                        <TableCell className="px-4 text-right font-semibold whitespace-nowrap text-slate-900 tabular-nums">
                           {minutesToTime(r.horas)}
                        </TableCell>
                     </TableRow>
                  ))}
                  <TableRow className="bg-slate-50 font-bold">
                     <TableCell className="px-4 text-slate-700">
                        Total da operação
                     </TableCell>
                     <TableCell className="px-2 text-right text-slate-700 tabular-nums">
                        {esforco.total_etapas}
                     </TableCell>
                     <TableCell className="px-4 text-right text-slate-900 tabular-nums">
                        {minutesToTime(esforco.total_horas)}
                     </TableCell>
                  </TableRow>
               </TableBody>
            </Table>
         )}
      </section>
   );
}
