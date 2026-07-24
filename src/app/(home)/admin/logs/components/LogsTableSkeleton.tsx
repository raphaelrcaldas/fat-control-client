"use client";

import { TableCell, TableRow } from "flowbite-react";
import clsx from "clsx";
import { Skeleton } from "@/components/ui/Skeleton";

/** Espelha o LogRow: mesmas colunas, mesmas larguras por breakpoint. */
function LogRowSkeleton({ showAction }: { showAction: boolean }) {
   return (
      <TableRow className="bg-white">
         <TableCell className="w-px align-middle md:w-auto">
            {/* Sem ano nem segundos, a coluna é mais estreita no mobile */}
            <Skeleton className="h-4 w-16 md:w-28" />
         </TableCell>
         <TableCell className="align-middle">
            <Skeleton className="h-4 w-32" />
         </TableCell>
         <TableCell className="w-px align-middle md:w-auto">
            <div className="flex items-center justify-center gap-1.5">
               <Skeleton className="size-2 rounded-full" />
               <Skeleton className="h-4 w-8" />
            </div>
         </TableCell>
         <TableCell
            className={clsx(
               "w-px align-middle md:w-auto",
               !showAction && "hidden md:table-cell"
            )}
         >
            <Skeleton className="mx-auto h-6 w-14 rounded" />
         </TableCell>
         <TableCell className="w-px align-middle md:w-auto">
            {/* Só o dot no mobile; a pílula com rótulo volta no md+ */}
            <Skeleton className="mx-auto size-2 rounded-full md:h-6 md:w-20 md:rounded" />
         </TableCell>
         <TableCell className="w-px align-middle md:w-auto">
            <Skeleton className="size-8 rounded" />
         </TableCell>
      </TableRow>
   );
}

export function LogsTableSkeleton({
   showAction,
   rows = 8,
}: {
   showAction: boolean;
   rows?: number;
}) {
   return (
      <>
         {Array.from({ length: rows }).map((_, i) => (
            <LogRowSkeleton key={i} showAction={showAction} />
         ))}
      </>
   );
}
