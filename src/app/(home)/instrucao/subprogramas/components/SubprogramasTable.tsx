"use client";

import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
   Button,
} from "flowbite-react";
import { FaPenToSquare, FaTrashCan } from "react-icons/fa6";
import { Skeleton } from "@/components/ui/Skeleton";
import { PermBased } from "../../../hooks/usePermBased";
import type { Subprograma } from "services/routes/instrucao/subprogramas";
import { FuncBadge, TipoBadge } from "./SubprogramaBadges";

interface SubprogramasTableProps {
   subprogramas: Subprograma[];
   isBusy: boolean;
   onEdit: (subprograma: Subprograma) => void;
   onDelete: (subprograma: Subprograma) => void;
}

export function SubprogramasTable({
   subprogramas,
   isBusy,
   onEdit,
   onDelete,
}: SubprogramasTableProps) {
   return (
      <div className="overflow-x-auto rounded border border-slate-200 bg-white shadow-sm">
         <Table hoverable>
            <TableHead>
               <TableRow>
                  <TableHeadCell className="w-28 text-center">
                     Código
                  </TableHeadCell>
                  <TableHeadCell>Descrição</TableHeadCell>
                  <TableHeadCell className="w-36 text-center">
                     Tipo
                  </TableHeadCell>
                  <TableHeadCell className="w-24 text-center">
                     Função
                  </TableHeadCell>
                  <TableHeadCell className="w-28 text-center">
                     <span className="sr-only">Ações</span>
                  </TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className="divide-y">
               {subprogramas.map((subprograma) => (
                  <TableRow key={subprograma.id} className="bg-white">
                     <TableCell className="text-center font-mono text-sm font-bold whitespace-nowrap text-slate-800">
                        {subprograma.codigo}
                     </TableCell>
                     <TableCell>
                        <span className="font-semibold text-slate-800">
                           {subprograma.descricao}
                        </span>
                        {subprograma.observacoes && (
                           <span className="mt-0.5 block text-xs text-slate-500">
                              {subprograma.observacoes}
                           </span>
                        )}
                     </TableCell>
                     <TableCell className="text-center">
                        <TipoBadge tipo={subprograma.tipo} />
                     </TableCell>
                     <TableCell className="text-center">
                        <FuncBadge func={subprograma.func} />
                     </TableCell>
                     <TableCell>
                        <div className="flex items-center justify-center gap-1.5">
                           <PermBased
                              resource="instrucao-subprogramas"
                              requiredPerm="update"
                           >
                              <Button
                                 size="xs"
                                 color="light"
                                 disabled={isBusy}
                                 onClick={() => onEdit(subprograma)}
                                 title="Editar subprograma"
                              >
                                 <FaPenToSquare className="size-3.5" />
                              </Button>
                           </PermBased>
                           <PermBased
                              resource="instrucao-subprogramas"
                              requiredPerm="delete"
                           >
                              <Button
                                 size="xs"
                                 color="red"
                                 disabled={isBusy}
                                 onClick={() => onDelete(subprograma)}
                                 title="Remover subprograma"
                              >
                                 <FaTrashCan className="size-3.5" />
                              </Button>
                           </PermBased>
                        </div>
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
   );
}

export function SubprogramasTableSkeleton() {
   return (
      <div className="space-y-2 rounded border border-slate-200 bg-white p-4 shadow-sm">
         {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
               <Skeleton className="h-4 w-20" />
               <Skeleton className="h-4 w-64" />
               <Skeleton className="ml-auto h-5 w-28" />
               <Skeleton className="h-5 w-12" />
               <Skeleton className="h-7 w-20" />
            </div>
         ))}
      </div>
   );
}
