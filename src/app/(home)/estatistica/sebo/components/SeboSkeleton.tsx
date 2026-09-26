import { Table, TableBody, TableCell, TableRow } from "flowbite-react";
import { INFO_COLUMNS_CONFIG } from "../constants";
import type { InfoColumn } from "../types";
import { SeboTableHeader } from "./SeboTableHeader";

const TABLE_ROWS = [0, 1, 2, 3, 4, 5, 6, 7];
const STAT_CARDS = [0, 1, 2];

function StatCardsSkeleton() {
   return (
      <div className="grid grid-cols-3 gap-3" aria-hidden>
         {STAT_CARDS.map((i) => (
            <div
               key={i}
               className="space-y-2 rounded border border-slate-200 bg-white p-3 shadow-sm"
            >
               <div className="h-3 w-12 animate-pulse rounded bg-slate-100" />
               <div className="h-7 w-16 animate-pulse rounded bg-slate-200" />
            </div>
         ))}
      </div>
   );
}

export function SeboChartSkeleton() {
   return (
      <div className="space-y-4" aria-hidden>
         <StatCardsSkeleton />
         <div className="flex min-h-[24px] items-center gap-3">
            <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
            <div className="h-2 flex-1 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-10 animate-pulse rounded bg-slate-100" />
         </div>
         <div className="h-[380px] animate-pulse rounded bg-slate-200" />
         <div className="flex justify-center gap-4 border-t border-slate-200 pt-2">
            {STAT_CARDS.map((i) => (
               <div
                  key={i}
                  className="h-4 w-24 animate-pulse rounded bg-slate-100"
               />
            ))}
         </div>
      </div>
   );
}

/** Espelha as colunas escolhidas e os mesmos breakpoints da tabela. */
export function SeboSkeleton({
   infoCols,
   isPilot,
}: {
   infoCols: Record<InfoColumn, boolean>;
   isPilot: boolean;
}) {
   const visibleCols = INFO_COLUMNS_CONFIG.filter(
      (col) => infoCols[col.key] && (isPilot || !col.pilotOnly)
   );
   return (
      <div
         role="status"
         className="grid min-w-0 grid-cols-1 items-start gap-3 xl:grid-cols-[minmax(0,max-content)_minmax(22rem,1fr)]"
      >
         <span className="sr-only">Carregando estatísticas</span>
         <div className="hidden sm:block xl:hidden">
            <StatCardsSkeleton />
         </div>
         <div
            aria-hidden
            className="min-w-0 overflow-x-auto rounded border border-slate-200 bg-white shadow-sm"
         >
            <Table theme={{ head: { cell: { base: "bg-white" } } }}>
               <SeboTableHeader visibleCols={visibleCols} />
               <TableBody className="divide-y">
                  {TABLE_ROWS.map((row) => (
                     <TableRow
                        key={row}
                        className="border-l-4 border-l-transparent"
                     >
                        <TableCell className="hidden px-0.5 lg:table-cell">
                           <div className="mx-auto h-5 w-6 animate-pulse rounded bg-slate-100" />
                        </TableCell>
                        <TableCell className="hidden px-0.5 lg:table-cell">
                           <div className="mx-auto h-5 w-32 animate-pulse rounded bg-slate-100" />
                        </TableCell>
                        <TableCell className="px-0.5 lg:hidden">
                           <div className="mx-auto h-5 w-8 animate-pulse rounded bg-slate-100" />
                        </TableCell>
                        <TableCell className="px-0.5">
                           <div className="mx-auto h-6 w-12 animate-pulse rounded bg-slate-100" />
                        </TableCell>
                        <TableCell className="px-0.5">
                           <div className="mx-auto h-6 w-[40px] animate-pulse rounded bg-slate-100" />
                        </TableCell>
                        {visibleCols.map((col) => (
                           <TableCell key={col.key} className="px-0.5">
                              <div className="mx-auto h-6 w-20 animate-pulse rounded bg-slate-100" />
                           </TableCell>
                        ))}
                        <TableCell className="px-0.5">
                           <div className="mx-auto h-5 w-12 animate-pulse rounded bg-slate-100" />
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </div>
         <div
            className="hidden min-w-0 space-y-4 rounded border border-slate-200 bg-white p-4 shadow-sm xl:block"
            aria-hidden
         >
            <div className="h-7 w-48 animate-pulse rounded bg-slate-200" />
            <SeboChartSkeleton />
         </div>
      </div>
   );
}
