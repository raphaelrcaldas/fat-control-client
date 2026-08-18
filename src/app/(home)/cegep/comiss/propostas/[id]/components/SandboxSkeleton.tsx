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

const FaintBar = ({ className = "" }: { className?: string }) => (
   <div className={`animate-pulse rounded bg-slate-100 ${className}`} />
);

const COLUMNS = [
   "Militar",
   "Abertura",
   "Fechamento",
   "Exercícios",
   "Subtotal",
   "",
] as const;

interface SandboxSkeletonProps {
   rows?: number;
}

/**
 * Espelha o corpo do sandbox — trilho de cenários, 3 cartões e a tabela de
 * linhas — para que a chegada dos dados não empurre nada na tela. O subheader
 * fica de fora de propósito: ele já renderiza de cara.
 */
export function SandboxSkeleton({ rows = 6 }: SandboxSkeletonProps) {
   return (
      <div className="flex flex-col space-y-2">
         {/* Trilho de cenários */}
         <div className="rounded border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
               <div className="flex gap-2 pb-1">
                  {[0, 1, 2].map((i) => (
                     <div
                        key={i}
                        className="flex w-52 shrink-0 flex-col gap-1.5 rounded px-3 py-2 ring-1 ring-slate-200"
                     >
                        <div className="flex items-center gap-2">
                           <FaintBar className="h-5 w-5 rounded-md" />
                           <Bar className="h-3.5 w-24" />
                        </div>
                        <div className="flex justify-between">
                           <FaintBar className="h-3 w-20" />
                           <FaintBar className="h-3 w-10" />
                        </div>
                        <FaintBar className="h-1 w-full rounded-full" />
                     </div>
                  ))}
                  <div className="w-36 shrink-0 rounded border border-dashed border-slate-200" />
               </div>
               <div className="flex shrink-0 gap-2">
                  <FaintBar className="h-8 w-28" />
                  <FaintBar className="h-8 w-10" />
               </div>
            </div>
         </div>

         {/* Cartões de métrica */}
         <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
               <div
                  key={i}
                  className="rounded border border-slate-200 bg-white p-5 shadow-sm"
               >
                  <div className="mb-2 flex items-start justify-between">
                     <FaintBar className="h-3 w-32" />
                     <FaintBar className="h-4 w-4" />
                  </div>
                  {/* Número grande (projetado) + chip do rascunho */}
                  <div className="flex items-center gap-2">
                     <Bar className="h-8 w-40" />
                     <FaintBar className="h-5 w-24" />
                  </div>
                  <div className="mt-1 mb-4 flex justify-between">
                     <FaintBar className="h-4 w-32" />
                     <FaintBar className="h-4 w-20" />
                  </div>
                  <Bar className="h-2.5 w-full rounded-full" />
                  {/* Legenda: rótulo em cima, valor embaixo, 3 colunas */}
                  <div className="mt-3 grid grid-cols-3 gap-x-2 gap-y-1">
                     {Array.from({ length: 3 }).map((_, j) => (
                        <div
                           key={j}
                           className="flex flex-col items-center gap-1"
                        >
                           <FaintBar className="h-4 w-16" />
                           <FaintBar className="h-4 w-20" />
                        </div>
                     ))}
                  </div>
               </div>
            ))}
         </div>

         {/* Tabela de linhas */}
         <div className="overflow-hidden rounded bg-white shadow-sm ring-1 ring-slate-200">
            <div className="flex items-baseline justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-3">
               <FaintBar className="h-4 w-20" />
               <FaintBar className="h-4 w-56" />
            </div>
            <div className="overflow-x-auto">
               <Table striped>
                  <TableHead>
                     <TableRow>
                        {COLUMNS.map((label, i) => (
                           <TableHeadCell
                              key={i}
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
                              <Bar className="mx-auto h-4 w-28" />
                           </TableCell>
                           <TableCell>
                              <Bar className="mx-auto h-4 w-28" />
                           </TableCell>
                           <TableCell>
                              <Bar className="mx-auto h-5 w-28 rounded" />
                           </TableCell>
                           <TableCell>
                              <Bar className="mx-auto h-4 w-24" />
                           </TableCell>
                           <TableCell>
                              <FaintBar className="mx-auto h-7 w-7" />
                           </TableCell>
                        </TableRow>
                     ))}
                     <TableRow className="bg-white">
                        <TableCell colSpan={6} className="p-2">
                           <div className="h-11 w-full rounded border border-dashed border-slate-200" />
                        </TableCell>
                     </TableRow>
                  </TableBody>
               </Table>
            </div>
         </div>
      </div>
   );
}
