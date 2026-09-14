import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";
import { COMISS_TABLE_THEME } from "../comissTableTheme";

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
 * Skeleton fiel ao corpo da `GestaoFiscalPage`: 3 cards de KPI mais a MESMA
 * troca de layout no `md` — lista no mobile, tabela de 8 colunas no desktop —
 * para zero layout-shift quando os dados orçamentários carregam.
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

         {/* Tabela do ano */}
         <div className="overflow-hidden rounded bg-white shadow-sm ring-1 ring-slate-200">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3">
               <FaintBar className="h-4 w-72" />
            </div>
            {/* Mobile: espelha o `GestaoFiscalRowCard` */}
            <ul className="divide-y divide-slate-100 md:hidden">
               {Array.from({ length: rows }).map((_, i) => (
                  <li
                     key={i}
                     className="border-l-4 border-l-slate-200 px-4 py-3"
                  >
                     <div className="flex items-center gap-2">
                        <Bar className="h-4 flex-1" />
                        <Bar className="h-5 w-20 shrink-0" />
                        <Bar className="h-4 w-4 shrink-0" />
                     </div>
                     <div className="mt-1.5 flex items-center gap-2">
                        <FaintBar className="h-4 w-20 shrink-0" />
                        <Bar className="h-4 w-24 shrink-0" />
                        <Bar className="ml-auto h-1.5 w-16 shrink-0" />
                        <FaintBar className="h-4 w-8 shrink-0" />
                     </div>
                     <div className="mt-1.5 flex items-center gap-4">
                        <FaintBar className="h-4 w-36" />
                        <FaintBar className="h-4 w-36" />
                     </div>
                  </li>
               ))}
            </ul>

            <div className="hidden overflow-x-auto md:block">
               <Table striped theme={COMISS_TABLE_THEME}>
                  <TableHead>
                     <TableRow>
                        {COLUMNS.map((label, i) => (
                           <TableHeadCell
                              key={label}
                              className={
                                 i === 0
                                    ? "bg-slate-50"
                                    : "bg-slate-50 text-center whitespace-nowrap"
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
                           {/* Militar — coluna elástica, com a espinha */}
                           <TableCell className="border-l-4 border-l-slate-200">
                              <Bar className="h-4 w-40" />
                           </TableCell>
                           <TableCell className="w-px">
                              <Bar className="mx-auto h-4 w-16" />
                           </TableCell>
                           <TableCell className="w-px">
                              <Bar className="mx-auto h-4 w-16" />
                           </TableCell>
                           <TableCell className="w-px">
                              <Bar className="mx-auto h-4 w-20" />
                           </TableCell>
                           <TableCell className="w-px">
                              <Bar className="mx-auto h-4 w-20" />
                           </TableCell>
                           <TableCell className="w-px">
                              <Bar className="mx-auto h-4 w-20" />
                           </TableCell>
                           <TableCell className="w-px">
                              <Bar className="mx-auto h-5 w-20" />
                           </TableCell>
                           <TableCell className="w-px">
                              <div className="flex items-center justify-center gap-2">
                                 <Bar className="h-1.5 w-16 xl:w-20" />
                                 <Bar className="h-3 w-9 shrink-0" />
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
