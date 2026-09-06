import { Table, TableBody, TableRow, TableCell } from "flowbite-react";
import { TRIP_TABLE_THEME } from "../tripTableTheme";
import { TripTableHead } from "./TripTableHead";

type TripListSkeletonProps = {
   rows?: number;
};

/**
 * `tone` e prop, e nao classe na chamada: a string do `className` nao passa por
 * twMerge, entao um `bg-slate-100` passado de fora perdia para o `bg-slate-200`
 * da base na cascata e TODAS as barras saiam no tom primario.
 */
const Bar = ({
   className = "",
   tone = "strong",
}: {
   className?: string;
   tone?: "strong" | "soft";
}) => (
   <div
      className={`h-3 animate-pulse rounded ${tone === "soft" ? "bg-slate-100" : "bg-slate-200"} ${className}`}
   />
);

/**
 * Espelha os dois layouts da lista — cartoes no mobile, tabela a partir de
 * `md` —, com as mesmas larguras de coluna, o mesmo tema de celula e o mesmo
 * numero de linhas, para que a chegada dos dados nao mova nada.
 */
export function TripListSkeleton({ rows = 10 }: TripListSkeletonProps) {
   return (
      <>
         {/* Mobile */}
         <ul className="divide-y divide-slate-100 md:hidden">
            {Array.from({ length: rows }).map((_, i) => (
               <li key={i} className="flex items-center gap-3 px-4 py-2.5">
                  <Bar className="w-9 shrink-0" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                     <Bar className="w-24" />
                     <Bar className="w-32" tone="soft" />
                  </div>
                  <Bar className="h-5 w-18 shrink-0" tone="soft" />
                  <Bar className="w-4 shrink-0" tone="soft" />
               </li>
            ))}
         </ul>

         {/* Desktop */}
         <div className="hidden min-h-96 overflow-x-auto md:block">
            <Table theme={TRIP_TABLE_THEME}>
               <TripTableHead />
               <TableBody className="divide-y divide-slate-100">
                  {Array.from({ length: rows }).map((_, i) => (
                     <TableRow key={i}>
                        <TableCell>
                           <Bar className="w-8" />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                           <Bar className="w-12" tone="soft" />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                           <Bar className="w-10" tone="soft" />
                        </TableCell>
                        <TableCell>
                           <Bar className="w-24" />
                        </TableCell>
                        <TableCell>
                           <Bar className="w-48" tone="soft" />
                        </TableCell>
                        <TableCell>
                           <Bar className="mx-auto w-10" />
                        </TableCell>
                        <TableCell>
                           <Bar className="mx-auto h-5 w-18" tone="soft" />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                           <Bar className="mx-auto w-12" tone="soft" />
                        </TableCell>
                        <TableCell>
                           <Bar className="ml-auto h-7 w-7" tone="soft" />
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </div>
      </>
   );
}
