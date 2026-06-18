import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";

interface ListDadosBancariosSkeletonProps {
   rows?: number;
}

function Bar({ className = "" }: { className?: string }) {
   return (
      <span
         className={`inline-block h-4 animate-pulse rounded bg-slate-200 ${className}`}
      />
   );
}

/** Skeleton que espelha a tabela de listDadosBancarios (9 colunas). */
export default function ListDadosBancariosSkeleton({
   rows = 8,
}: ListDadosBancariosSkeletonProps) {
   return (
      <div className="overflow-x-auto rounded border border-slate-200 shadow-sm">
         <Table hoverable>
            <TableHead>
               <TableRow>
                  <TableHeadCell>Militar</TableHeadCell>
                  <TableHeadCell>Nome Completo</TableHeadCell>
                  <TableHeadCell>Banco</TableHeadCell>
                  <TableHeadCell>Agência</TableHeadCell>
                  <TableHeadCell>Conta</TableHeadCell>
                  <TableHeadCell className="text-center">
                     Remuneração
                  </TableHeadCell>
                  <TableHeadCell className="text-center">Mês/Ano</TableHeadCell>
                  <TableHeadCell className="text-center">
                     Aux. Transp.
                  </TableHeadCell>
                  <TableHeadCell className="text-center">
                     Atualizado em
                  </TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody>
               {Array.from({ length: rows }).map((_, i) => (
                  <TableRow
                     key={i}
                     className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                     <TableCell>
                        <Bar className="w-24" />
                     </TableCell>
                     <TableCell>
                        <Bar className="w-40" />
                     </TableCell>
                     <TableCell>
                        <Bar className="w-28" />
                     </TableCell>
                     <TableCell>
                        <Bar className="w-12" />
                     </TableCell>
                     <TableCell>
                        <Bar className="w-16" />
                     </TableCell>
                     <TableCell className="text-center">
                        <Bar className="w-20" />
                     </TableCell>
                     <TableCell className="text-center">
                        <Bar className="w-14" />
                     </TableCell>
                     <TableCell className="text-center">
                        <Bar className="w-16" />
                     </TableCell>
                     <TableCell className="text-center">
                        <Bar className="w-20" />
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
   );
}
