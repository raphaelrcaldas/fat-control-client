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

// Larguras dos blocos por coluna de dados (a 1ª coluna é o farol de status):
// Militar, Prontuário, Ata, CEMAL, TOVN, IMAE. Só Militar alinha à esquerda —
// o resto é centralizado, como na tabela real.
const BAR_WIDTHS = ["w-40", "w-20", "w-4", "w-32", "w-28", "w-28"] as const;

export default function CartoesSaudeTableSkeleton({
   rows = 8,
}: {
   rows?: number;
}) {
   return (
      <div className="max-h-[70vh] overflow-auto">
         <Table>
            <TableHead className="sticky top-0 z-10 border-b border-slate-200 bg-gray-50 text-xs text-gray-700 uppercase">
               <TableRow>
                  <TableHeadCell className="w-10 px-3 py-3" />
                  {BAR_WIDTHS.map((w, i) => (
                     <TableHeadCell key={i} className="px-4 py-3">
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
                     <TableCell className="w-10 px-3 py-3 pointer-coarse:py-4">
                        <div className="h-3 w-3 animate-pulse rounded-full bg-slate-200" />
                     </TableCell>
                     {BAR_WIDTHS.map((w, c) => (
                        <TableCell
                           key={c}
                           className="px-4 py-3 pointer-coarse:py-4"
                        >
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
