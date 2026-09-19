import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
} from "flowbite-react";

/**
 * Espelha `LocEspTable`: mesmas seis colunas, mesmos alinhamentos.
 *
 * Larguras fixas por índice (não aleatórias) para não haver flicker nem
 * divergência de hidratação.
 */
const LARGURAS = [
   "w-32",
   "w-40",
   "w-28",
   "w-36",
   "w-24",
   "w-44",
   "w-36",
   "w-28",
];

function Bar({ className }: { className: string }) {
   return (
      <div className={`h-3 animate-pulse rounded bg-slate-200 ${className}`} />
   );
}

export function LocEspTableSkeleton({ rows = 8 }: { rows?: number }) {
   return (
      <div className="overflow-x-auto">
         <Table>
            <TableHead>
               <TableRow>
                  <TableHeadCell className="bg-slate-50 text-left!">
                     Município
                  </TableHeadCell>
                  <TableHeadCell className="bg-slate-50">UF</TableHeadCell>
                  <TableHeadCell className="bg-slate-50">Grupo</TableHeadCell>
                  <TableHeadCell className="bg-slate-50">Fuso</TableHeadCell>
                  <TableHeadCell className="bg-slate-50 text-left!">
                     Aeródromos
                  </TableHeadCell>
                  <TableHeadCell className="w-px bg-slate-50">
                     <span className="sr-only">Ações</span>
                  </TableHeadCell>
               </TableRow>
            </TableHead>

            <TableBody className="divide-y">
               {Array.from({ length: rows }).map((_, i) => (
                  <TableRow key={i} className="bg-white">
                     <TableCell>
                        <Bar className={LARGURAS[i % LARGURAS.length]} />
                     </TableCell>
                     <TableCell>
                        <Bar className="mx-auto w-6" />
                     </TableCell>
                     <TableCell>
                        <div className="mx-auto h-5 w-6 animate-pulse rounded bg-slate-200" />
                     </TableCell>
                     <TableCell>
                        <Bar className="mx-auto w-12" />
                     </TableCell>
                     <TableCell>
                        <div className="flex gap-1">
                           <div className="h-5 w-12 animate-pulse rounded bg-slate-100" />
                           {i % 3 === 0 && (
                              <div className="h-5 w-12 animate-pulse rounded bg-slate-100" />
                           )}
                        </div>
                     </TableCell>
                     <TableCell>
                        <div className="ml-auto h-[32px] w-[32px] animate-pulse rounded bg-slate-100" />
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
   );
}
