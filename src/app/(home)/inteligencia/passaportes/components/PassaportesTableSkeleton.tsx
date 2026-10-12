// Skeleton que espelha PassaportesTable (mesmos componentes Flowbite e
// classes de célula), para zero layout-shift quando os dados chegam.

import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";

// Larguras dos blocos por coluna de dados (antes delas, a faixa de status e o
// checkbox de seleção):
// militar, status, nº e validade do passaporte, nº e validade do visto.
const BAR_WIDTHS = ["w-40", "w-32", "w-24", "w-32", "w-24", "w-32"] as const;

export default function PassaportesTableSkeleton({
   rows = 15,
}: {
   rows?: number;
}) {
   return (
      <div role="status" className="overflow-x-auto">
         <span className="sr-only">Carregando passaportes…</span>
         <Table aria-hidden>
            <TableHead className="border-b border-slate-200 bg-gray-50 text-xs text-gray-700 uppercase">
               <TableRow>
                  <TableHeadCell className="w-1 p-0" />
                  <TableHeadCell className="w-10 px-3 py-2">
                     <div className="h-[20px] w-[20px] animate-pulse rounded bg-slate-200" />
                  </TableHeadCell>
                  {BAR_WIDTHS.map((w, i) => (
                     <TableHeadCell key={i} className="px-4 py-2">
                        <div
                           className={`h-5 ${w} animate-pulse rounded bg-slate-200`}
                        />
                     </TableHeadCell>
                  ))}
               </TableRow>
            </TableHead>
            <TableBody>
               {Array.from({ length: rows }).map((_, r) => (
                  <TableRow key={r} className="border-b border-slate-200">
                     <TableCell className="w-1 animate-pulse bg-slate-200 p-0" />
                     <TableCell className="w-10 px-3 py-2">
                        <div className="h-[20px] w-[20px] animate-pulse rounded bg-slate-200" />
                     </TableCell>
                     {BAR_WIDTHS.map((w, c) => (
                        <TableCell key={c} className="px-4 py-2">
                           <div
                              className={`h-5 ${w} animate-pulse rounded bg-slate-200`}
                           />
                        </TableCell>
                     ))}
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
   );
}
