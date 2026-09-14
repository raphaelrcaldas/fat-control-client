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
 * Skeleton fiel à `TableComiss`: mesma moldura, mesmo cabeçalho (9 colunas),
 * mesmo tema de padding e a MESMA troca de layout no `md` — lista no mobile,
 * tabela no desktop. Espelhar só a tabela faria o celular carregar com uma
 * grade que nunca chega.
 */
export function TableComissSkeleton({ rows = 18 }: TableComissSkeletonProps) {
   return (
      <div className="overflow-hidden rounded bg-white shadow ring-1 ring-slate-200">
         {/* Mobile: espelha o `ComissCard` */}
         <ul className="divide-y divide-slate-100 md:hidden">
            {Array.from({ length: rows }).map((_, i) => (
               <li key={i} className="border-l-4 border-l-slate-200 px-4 py-3">
                  <div className="flex items-center gap-2">
                     <Bar className="h-4 flex-1" />
                     <Bar className="h-5 w-20 shrink-0" />
                     <Bar className="h-4 w-4 shrink-0" />
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                     <Bar className="h-4 w-28 shrink-0" />
                     <Bar className="h-1.5 flex-1" />
                     <Bar className="h-4 w-8 shrink-0" />
                  </div>
                  <div className="mt-1.5 flex items-center gap-3">
                     <Bar className="h-4 w-20" />
                     <Bar className="h-4 w-24" />
                     <Bar className="h-4 w-20" />
                     <Bar className="ml-auto h-5 w-20 shrink-0" />
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
               <TableBody className="divide-y divide-gray-200">
                  {Array.from({ length: rows }).map((_, i) => (
                     <TableRow key={i} className="bg-white">
                        {/* Militar — única coluna elástica, com a espinha */}
                        <TableCell className="border-l-4 border-l-slate-200">
                           <Bar className="h-4 w-40" />
                        </TableCell>
                        {/* Abertura */}
                        <TableCell className="w-px">
                           <Bar className="mx-auto h-4 w-12" />
                        </TableCell>
                        {/* Fechamento */}
                        <TableCell className="w-px">
                           <Bar className="mx-auto h-4 w-12" />
                        </TableCell>
                        {/* Tipo */}
                        <TableCell className="w-px">
                           <Bar className="mx-auto h-5 w-20" />
                        </TableCell>
                        {/* Progresso — barra e percentual lado a lado */}
                        <TableCell className="w-px">
                           <div className="flex items-center justify-center gap-2">
                              <Bar className="h-1.5 w-20 xl:w-24" />
                              <Bar className="h-3 w-10 shrink-0" />
                           </div>
                        </TableCell>
                        {/* Módulo */}
                        <TableCell className="w-px">
                           <Bar className="mx-auto h-5 w-12" />
                        </TableCell>
                        {/* Previsto */}
                        <TableCell className="w-px">
                           <Bar className="mx-auto h-4 w-10" />
                        </TableCell>
                        {/* Computado */}
                        <TableCell className="w-px">
                           <Bar className="mx-auto h-4 w-10" />
                        </TableCell>
                        {/* Restante */}
                        <TableCell className="w-px">
                           <Bar className="mx-auto h-4 w-10" />
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </div>
      </div>
   );
}
