"use client";

import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
} from "flowbite-react";
import { Skeleton } from "@/components/ui/Skeleton";

const ROWS = 8;

/** Espelha o layout real de UsersTable para evitar layout-shift. */
export function AcessosSkeleton() {
   return (
      <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
         {/* Toolbar: busca + atualizar */}
         <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 p-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-11" />
         </div>

         <div className="overflow-x-auto">
            <Table hoverable>
               <TableHead>
                  <TableRow>
                     <TableHeadCell>Usuário</TableHeadCell>
                     <TableHeadCell>Perfil</TableHeadCell>
                     <TableHeadCell>Escopo</TableHeadCell>
                     <TableHeadCell className="text-center">
                        Ações
                     </TableHeadCell>
                  </TableRow>
               </TableHead>
               <TableBody className="divide-y divide-slate-200">
                  {Array.from({ length: ROWS }).map((_, i) => (
                     <TableRow key={i} className="bg-white">
                        <TableCell>
                           <div className="flex items-center gap-3">
                              <Skeleton className="size-10 shrink-0 rounded-full" />
                              <Skeleton className="h-4 w-28" />
                           </div>
                        </TableCell>
                        <TableCell>
                           <Skeleton className="h-6 w-24" />
                        </TableCell>
                        <TableCell>
                           <Skeleton className="h-6 w-16" />
                        </TableCell>
                        <TableCell>
                           <div className="flex justify-center gap-2">
                              <Skeleton className="size-8" />
                              <Skeleton className="size-8" />
                              <Skeleton className="size-8" />
                           </div>
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </div>
      </div>
   );
}
