// Skeleton que espelha CrmTable (mesmos componentes Flowbite e classes de
// célula, com o farol dentro da coluna Militar), para zero layout-shift quando
// os dados chegam.

import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";
import clsx from "clsx";

// Larguras dos blocos por coluna: Militar, Realização, Validade.
const BAR_WIDTHS = ["w-40", "w-24", "w-32"] as const;

export default function CrmTableSkeleton({ rows = 15 }: { rows?: number }) {
   return (
      <div className="overflow-x-auto">
         <Table>
            <TableHead className="border-b border-slate-200 bg-gray-50 text-xs text-gray-700 uppercase">
               <TableRow>
                  {BAR_WIDTHS.map((w, i) => (
                     <TableHeadCell
                        key={i}
                        className={clsx(
                           "px-4 py-3",
                           // Coluna Militar: mesma âncora do cabeçalho real.
                           i === 0 && "sticky left-0 z-20 bg-gray-50"
                        )}
                     >
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
                     <TableCell className="px-4 py-3 pointer-coarse:py-4">
                        <div className="flex items-center gap-2.5">
                           <div className="h-3 w-3 shrink-0 animate-pulse rounded-full bg-slate-200" />
                           <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
                        </div>
                     </TableCell>
                     {BAR_WIDTHS.slice(1).map((w, c) => (
                        <TableCell
                           key={c}
                           className="px-4 py-3 pointer-coarse:py-4"
                        >
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
