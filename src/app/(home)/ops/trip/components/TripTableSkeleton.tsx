import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";

type TripTableSkeletonProps = {
   rows?: number;
};

const Bar = ({ className = "" }: { className?: string }) => (
   <div className={`h-3 animate-pulse rounded bg-slate-200 ${className}`} />
);

/**
 * Skeleton que espelha exatamente a tabela de tripulantes (mesmas colunas,
 * mesmos hides responsivos) para evitar layout-shift quando os dados chegam.
 */
export function TripTableSkeleton({ rows = 8 }: TripTableSkeletonProps) {
   return (
      <div className="min-h-96 overflow-x-auto">
         <Table>
            <TableHead>
               <TableRow>
                  <TableHeadCell>P/G</TableHeadCell>
                  <TableHeadCell className="hidden lg:table-cell">
                     Quadro
                  </TableHeadCell>
                  <TableHeadCell className="hidden lg:table-cell">
                     Especialidade
                  </TableHeadCell>
                  <TableHeadCell className="hidden md:table-cell">
                     Nome de Guerra
                  </TableHeadCell>
                  <TableHeadCell className="hidden md:table-cell">
                     Nome Completo
                  </TableHeadCell>
                  <TableHeadCell className="text-center">
                     Trigrama
                  </TableHeadCell>
                  <TableHeadCell className="text-center">Funções</TableHeadCell>
                  <TableHeadCell className="hidden text-center md:table-cell">
                     Status
                  </TableHeadCell>
                  <TableHeadCell>
                     <span className="sr-only">Ações</span>
                  </TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className="divide-y divide-slate-100">
               {Array.from({ length: rows }).map((_, i) => (
                  <TableRow key={i}>
                     <TableCell>
                        <Bar className="w-12" />
                     </TableCell>
                     <TableCell className="hidden lg:table-cell">
                        <Bar className="w-10" />
                     </TableCell>
                     <TableCell className="hidden lg:table-cell">
                        <Bar className="w-12" />
                     </TableCell>
                     <TableCell className="hidden md:table-cell">
                        <Bar className="w-24" />
                     </TableCell>
                     <TableCell className="hidden md:table-cell">
                        <Bar className="w-40" />
                     </TableCell>
                     <TableCell>
                        <Bar className="mx-auto w-10" />
                     </TableCell>
                     <TableCell>
                        <div className="flex justify-center gap-1">
                           <Bar className="h-6 w-24 rounded-full" />
                        </div>
                     </TableCell>
                     <TableCell className="hidden md:table-cell">
                        <Bar className="mx-auto w-14" />
                     </TableCell>
                     <TableCell>
                        <Bar className="mx-auto w-16" />
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
   );
}
