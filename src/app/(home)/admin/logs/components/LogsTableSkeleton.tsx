"use client";

import { TableCell, TableRow } from "flowbite-react";
import { Skeleton } from "@/components/ui/Skeleton";

function LogRowSkeleton() {
   return (
      <TableRow className="bg-white">
         <TableCell>
            <Skeleton className="h-4 w-32" />
         </TableCell>
         <TableCell>
            <div className="flex flex-col gap-1">
               <Skeleton className="h-4 w-40" />
               <Skeleton className="h-6 w-16 rounded-full md:hidden" />
            </div>
         </TableCell>
         <TableCell>
            <Skeleton className="h-4 w-12" />
         </TableCell>
         <TableCell className="hidden md:table-cell">
            <Skeleton className="h-6 w-16 rounded-full" />
         </TableCell>
         <TableCell>
            <Skeleton className="h-6 w-20 rounded" />
         </TableCell>
         <TableCell>
            <Skeleton className="size-7 rounded" />
         </TableCell>
      </TableRow>
   );
}

export function LogsTableSkeleton({ rows = 8 }: { rows?: number }) {
   return (
      <>
         {Array.from({ length: rows }).map((_, i) => (
            <LogRowSkeleton key={i} />
         ))}
      </>
   );
}
