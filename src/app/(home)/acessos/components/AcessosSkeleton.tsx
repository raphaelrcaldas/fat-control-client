"use client";

import {
   Button,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
   TextInput,
} from "flowbite-react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { HiRefresh } from "react-icons/hi";
import { Skeleton } from "@/components/ui/Skeleton";

const ROWS = 8;

/**
 * Espelha o layout real de UsersTable para evitar layout-shift. A toolbar é
 * a real, só desabilitada (busca e atualizar não dependem do dado para
 * existir); o `role="status"` cobre só a tabela.
 */
export function AcessosSkeleton() {
   return (
      <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
         {/* Toolbar: busca + atualizar */}
         <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 p-4">
            <TextInput
               icon={FaMagnifyingGlass}
               className="flex-1"
               placeholder="Buscar por nome, posto ou perfil..."
               aria-label="Buscar por nome, posto ou perfil"
               disabled
            />
            <Button color="light" disabled aria-label="Atualizar lista">
               <HiRefresh />
            </Button>
         </div>

         <div role="status" className="overflow-x-auto">
            <span className="sr-only">Carregando acessos…</span>
            <Table hoverable aria-hidden>
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
