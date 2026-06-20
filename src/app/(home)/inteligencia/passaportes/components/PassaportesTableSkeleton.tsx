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

// Larguras dos blocos por coluna de dados (a 1ª coluna é o dot de status).
const BAR_WIDTHS = ["w-40", "w-24", "w-32", "w-24", "w-32"] as const;

export default function PassaportesTableSkeleton({
   rows = 8,
}: {
   rows?: number;
}) {
   return (
      <div className="overflow-x-auto">
         <Table>
            <TableHead className="border-b border-slate-200 bg-gray-50 text-xs text-gray-700 uppercase">
               <TableRow>
                  <TableHeadCell className="w-10 px-3 py-3" />
                  {BAR_WIDTHS.map((w, i) => (
                     <TableHeadCell key={i} className="px-4 py-3">
                        <div
                           className={`h-3 ${w} animate-pulse rounded bg-slate-200`}
                        />
                     </TableHeadCell>
                  ))}
               </TableRow>
            </TableHead>
            <TableBody>
               {Array.from({ length: rows }).map((_, r) => (
                  <TableRow key={r} className="border-b border-slate-200">
                     <TableCell className="w-10 px-3 py-3">
                        <div className="h-3 w-3 animate-pulse rounded-full bg-slate-200" />
                     </TableCell>
                     {BAR_WIDTHS.map((w, c) => (
                        <TableCell key={c} className="px-4 py-3">
                           <div
                              className={`h-4 ${w} animate-pulse rounded bg-slate-200`}
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
