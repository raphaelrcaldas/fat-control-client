// Skeleton que espelha CartoesSaudeTable (mesmos componentes Flowbite e
// classes de célula), para zero layout-shift quando os dados chegam.

import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";

// Larguras dos blocos por coluna de dados (a 1ª coluna é a faixa de status):
// Militar, Prontuário, Ata, CEMAL, TOVN, IMAE. Só Militar alinha à esquerda —
// o resto é centralizado, como na tabela real.
const BAR_WIDTHS = ["w-40", "w-20", "w-4", "w-32", "w-28", "w-28"] as const;

export default function CartoesSaudeTableSkeleton({
   rows = 8,
}: {
   rows?: number;
}) {
   return (
      <div className="overflow-x-auto">
         <Table>
            <TableHead className="border-b border-slate-200 bg-gray-50 text-xs text-gray-700 uppercase">
               <TableRow>
                  <TableHeadCell className="w-1 p-0" />
                  {BAR_WIDTHS.map((w, i) => (
                     <TableHeadCell key={i} className="px-4 py-2">
                        <div
                           className={`h-3 ${w} animate-pulse rounded bg-slate-200 ${i > 0 ? "mx-auto" : ""}`}
                        />
                     </TableHeadCell>
                  ))}
               </TableRow>
            </TableHead>
            <TableBody>
               {Array.from({ length: rows }).map((_, r) => (
                  <TableRow key={r} className="border-b border-slate-200">
                     <TableCell className="w-1 animate-pulse bg-slate-200 p-0" />
                     {BAR_WIDTHS.map((w, c) => (
                        <TableCell key={c} className="px-4 py-2">
                           <div
                              className={`h-4 ${w} animate-pulse rounded bg-slate-200 ${c > 0 ? "mx-auto" : ""}`}
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
