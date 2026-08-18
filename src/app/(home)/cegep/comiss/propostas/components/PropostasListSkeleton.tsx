import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
} from "flowbite-react";

const Bar = ({ className = "" }: { className?: string }) => (
   <div className={`animate-pulse rounded bg-slate-200 ${className}`} />
);

const COLUMNS = ["Proposta", "Exercício", "Cenários", "Atualizado em"] as const;

interface PropostasListSkeletonProps {
   rows?: number;
}

/**
 * Espelha a `PropostasList` nas duas formas — cards no mobile, tabela de `md:`
 * para cima — para que a chegada dos dados não empurre o layout.
 */
export function PropostasListSkeleton({
   rows = 4,
}: PropostasListSkeletonProps) {
   return (
      <>
         <div className="flex flex-col gap-2 md:hidden">
            {Array.from({ length: rows }).map((_, i) => (
               <div
                  key={i}
                  className="flex items-start justify-between gap-2 rounded border border-slate-200 bg-white px-3 py-2 shadow-sm"
               >
                  <div className="min-w-0 flex-1">
                     {/* Mesma altura do botão do nome no card real (44px no
                         toque), para a lista não pular quando os dados chegam. */}
                     <div className="flex items-center pointer-coarse:min-h-[44px]">
                        <Bar className="h-4 w-40" />
                     </div>
                     <Bar className="mt-1.5 h-3.5 w-56" />
                  </div>
                  <Bar className="h-8 w-8" />
               </div>
            ))}
         </div>

         <div className="hidden overflow-hidden rounded bg-white shadow-sm ring-1 ring-slate-200 md:block">
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
                        <TableHeadCell className="bg-slate-50 text-center">
                           <span className="sr-only">Ações</span>
                        </TableHeadCell>
                     </TableRow>
                  </TableHead>
                  <TableBody className="divide-y divide-slate-200">
                     {Array.from({ length: rows }).map((_, i) => (
                        <TableRow key={i} className="bg-white">
                           <TableCell>
                              <Bar className="h-4 w-48" />
                           </TableCell>
                           <TableCell>
                              <Bar className="mx-auto h-4 w-12" />
                           </TableCell>
                           <TableCell>
                              <Bar className="mx-auto h-4 w-6" />
                           </TableCell>
                           <TableCell>
                              <Bar className="mx-auto h-4 w-28" />
                           </TableCell>
                           <TableCell>
                              <Bar className="ml-auto h-7 w-9" />
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </div>
         </div>
      </>
   );
}
