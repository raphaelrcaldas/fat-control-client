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

const COLUMNS = [
   "Militar",
   "Abertura",
   "Fechamento",
   "Tipo",
   "Progresso",
   "Módulo",
   "Previsto",
   "Computado",
   "Restante",
] as const;

interface TableComissSkeletonProps {
   rows?: number;
}

/**
 * Skeleton fiel à `TableComiss`: mesma moldura, mesmo cabeçalho (9 colunas)
 * e mesmas dimensões de célula, para zero layout-shift quando a lista
 * carrega. Reaproveita os componentes `Table` do Flowbite para herdar as
 * alturas/estilos reais.
 */
export function TableComissSkeleton({ rows = 18 }: TableComissSkeletonProps) {
   return (
      <div className="overflow-x-auto rounded bg-white shadow ring-1 ring-slate-200">
         <Table striped>
            <TableHead>
               <TableRow>
                  {COLUMNS.map((label, i) => (
                     <TableHeadCell
                        key={label}
                        className={
                           i === 0 ? "bg-white" : "bg-white text-center"
                        }
                     >
                        {label}
                     </TableHeadCell>
                  ))}
               </TableRow>
            </TableHead>
            <TableBody className="divide-y divide-gray-200">
               {Array.from({ length: rows }).map((_, i) => (
                  <TableRow key={i} className="bg-white">
                     {/* Militar */}
                     <TableCell>
                        <div className="flex items-center gap-2">
                           <div className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-slate-200" />
                           <Bar className="h-4 w-40" />
                        </div>
                     </TableCell>
                     {/* Abertura */}
                     <TableCell>
                        <Bar className="mx-auto h-4 w-12" />
                     </TableCell>
                     {/* Fechamento */}
                     <TableCell>
                        <Bar className="mx-auto h-4 w-12" />
                     </TableCell>
                     {/* Tipo */}
                     <TableCell>
                        <Bar className="mx-auto h-5 w-20" />
                     </TableCell>
                     {/* Progresso */}
                     <TableCell>
                        <div className="mx-auto w-28 space-y-1.5">
                           <Bar className="mx-auto h-3 w-10" />
                           <Bar className="h-1.5 w-full" />
                        </div>
                     </TableCell>
                     {/* Módulo */}
                     <TableCell>
                        <Bar className="mx-auto h-5 w-12" />
                     </TableCell>
                     {/* Previsto */}
                     <TableCell>
                        <Bar className="mx-auto h-4 w-14" />
                     </TableCell>
                     {/* Computado */}
                     <TableCell>
                        <Bar className="mx-auto h-4 w-14" />
                     </TableCell>
                     {/* Restante */}
                     <TableCell>
                        <Bar className="mx-auto h-4 w-14" />
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
   );
}
