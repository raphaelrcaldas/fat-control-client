import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";

const Bar = ({ className = "" }: { className?: string }) => (
   <div className={`animate-pulse rounded bg-slate-200 ${className}`} />
);

const FaintBar = ({ className = "" }: { className?: string }) => (
   <div className={`animate-pulse rounded bg-slate-100 ${className}`} />
);

const COLUMNS = [
   "Militar",
   "Abertura",
   "Fechamento",
   "Valor Ab.",
   "Valor Fc.",
   "Impacto",
   "Status",
   "Completude",
] as const;

interface GestaoFiscalSkeletonProps {
   rows?: number;
}

/**
 * Skeleton fiel ao corpo da `GestaoFiscalPage`: 3 cards de KPI + tabela de
 * 8 colunas, para zero layout-shift quando os dados orçamentários carregam.
 */
export function GestaoFiscalSkeleton({ rows = 8 }: GestaoFiscalSkeletonProps) {
   return (
      <div className="flex flex-col gap-2">
         {/* Cards de KPI */}
         <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
               <div
                  key={i}
                  className="rounded border border-slate-200 bg-white p-5 shadow-sm"
               >
                  <div className="mb-2 flex items-start justify-between">
                     <FaintBar className="h-3 w-32" />
                     <FaintBar className="h-4 w-4" />
                  </div>
                  <Bar className="mb-4 h-8 w-40" />
                  <div className="mb-1 flex justify-between">
                     <FaintBar className="h-4 w-28" />
                     <FaintBar className="h-4 w-12" />
                  </div>
                  <Bar className="h-2.5 w-full rounded-full" />
                  <div className="mt-3 flex gap-4">
                     <FaintBar className="h-3 w-20" />
                     <FaintBar className="h-3 w-20" />
                  </div>
               </div>
            ))}
         </div>

         {/* Tabela do ano */}
         <div className="overflow-hidden rounded bg-white shadow-sm ring-1 ring-slate-200">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3">
               <FaintBar className="h-4 w-72" />
            </div>
            <div className="overflow-x-auto">
               <Table striped>
                  <TableHead>
                     <TableRow>
                        {COLUMNS.map((label, i) => (
                           <TableHeadCell
                              key={label}
                              className={
                                 i === 0
                                    ? "bg-slate-50"
                                    : "bg-slate-50 text-center"
                              }
                           >
                              {label}
                           </TableHeadCell>
                        ))}
                     </TableRow>
                  </TableHead>
                  <TableBody className="divide-y divide-slate-200">
                     {Array.from({ length: rows }).map((_, i) => (
                        <TableRow key={i} className="bg-white">
                           <TableCell>
                              <Bar className="h-4 w-40" />
                           </TableCell>
                           <TableCell>
                              <Bar className="mx-auto h-4 w-16" />
                           </TableCell>
                           <TableCell>
                              <Bar className="mx-auto h-4 w-16" />
                           </TableCell>
                           <TableCell>
                              <Bar className="mx-auto h-4 w-20" />
                           </TableCell>
                           <TableCell>
                              <Bar className="mx-auto h-4 w-20" />
                           </TableCell>
                           <TableCell>
                              <Bar className="mx-auto h-4 w-20" />
                           </TableCell>
                           <TableCell>
                              <Bar className="mx-auto h-5 w-16 rounded-full" />
                           </TableCell>
                           <TableCell>
                              <div className="mx-auto w-20 space-y-1.5">
                                 <Bar className="mx-auto h-3 w-8" />
                                 <Bar className="h-1.5 w-full" />
                              </div>
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </div>
         </div>
      </div>
   );
}
