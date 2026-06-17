"use client";

import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
   Tooltip,
} from "flowbite-react";
import { FaPenToSquare, FaTrashCan } from "react-icons/fa6";
import type { Organizacao } from "services/routes/organizacoes";
import { Skeleton } from "@/components/ui/Skeleton";

interface OrganizacoesTableProps {
   organizacoes: Organizacao[];
   onEdit: (org: Organizacao) => void;
   onDelete: (org: Organizacao) => void;
}

export function OrganizacoesTable({
   organizacoes,
   onEdit,
   onDelete,
}: OrganizacoesTableProps) {
   return (
      <div className="overflow-x-auto rounded border border-slate-200 bg-white shadow-sm">
         <Table hoverable>
            <TableHead>
               <TableRow>
                  <TableHeadCell>Sigla</TableHeadCell>
                  <TableHeadCell className="hidden sm:table-cell">
                     Sigla 2
                  </TableHeadCell>
                  <TableHeadCell className="hidden lg:table-cell">
                     Sigla 3
                  </TableHeadCell>
                  <TableHeadCell>Nome</TableHeadCell>
                  <TableHeadCell className="hidden md:table-cell">
                     Codinome
                  </TableHeadCell>
                  <TableHeadCell className="w-24">
                     <span className="sr-only">Ações</span>
                  </TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className="divide-y">
               {organizacoes.map((org) => (
                  <TableRow key={org.sigla} className="bg-white">
                     <TableCell>
                        <span className="font-medium text-gray-900">
                           {org.sigla}
                        </span>
                     </TableCell>
                     <TableCell className="hidden font-mono text-xs text-gray-500 sm:table-cell">
                        {org.sigla_2 || "—"}
                     </TableCell>
                     <TableCell className="hidden font-mono text-xs text-gray-500 lg:table-cell">
                        {org.sigla_3 || "—"}
                     </TableCell>
                     <TableCell className="text-gray-600">{org.nome}</TableCell>
                     <TableCell className="hidden text-gray-600 md:table-cell">
                        {org.alias || "—"}
                     </TableCell>
                     <TableCell>
                        <div className="flex items-center justify-end gap-1">
                           <Tooltip content="Editar organização">
                              <button
                                 type="button"
                                 onClick={() => onEdit(org)}
                                 className="rounded p-2 text-gray-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                                 aria-label={`Editar organização ${org.sigla}`}
                              >
                                 <FaPenToSquare className="h-4 w-4" />
                              </button>
                           </Tooltip>
                           <Tooltip content="Excluir organização">
                              <button
                                 type="button"
                                 onClick={() => onDelete(org)}
                                 className="rounded p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                 aria-label={`Excluir organização ${org.sigla}`}
                              >
                                 <FaTrashCan className="h-4 w-4" />
                              </button>
                           </Tooltip>
                        </div>
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
   );
}

export function OrganizacoesTableSkeleton({ rows = 8 }: { rows?: number }) {
   return (
      <div className="overflow-x-auto rounded border border-slate-200 bg-white shadow-sm">
         <Table hoverable>
            <TableHead>
               <TableRow>
                  <TableHeadCell>Sigla</TableHeadCell>
                  <TableHeadCell className="hidden sm:table-cell">
                     Sigla 2
                  </TableHeadCell>
                  <TableHeadCell className="hidden lg:table-cell">
                     Sigla 3
                  </TableHeadCell>
                  <TableHeadCell>Nome</TableHeadCell>
                  <TableHeadCell className="hidden md:table-cell">
                     Codinome
                  </TableHeadCell>
                  <TableHeadCell className="w-24">
                     <span className="sr-only">Ações</span>
                  </TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className="divide-y">
               {Array.from({ length: rows }).map((_, i) => (
                  <TableRow key={i} className="bg-white">
                     <TableCell>
                        <Skeleton className="h-4 w-16" />
                     </TableCell>
                     <TableCell className="hidden sm:table-cell">
                        <Skeleton className="h-3 w-12" />
                     </TableCell>
                     <TableCell className="hidden lg:table-cell">
                        <Skeleton className="h-3 w-12" />
                     </TableCell>
                     <TableCell>
                        <Skeleton className="h-4 w-full max-w-xs" />
                     </TableCell>
                     <TableCell className="hidden md:table-cell">
                        <Skeleton className="h-4 w-24" />
                     </TableCell>
                     <TableCell>
                        <div className="flex items-center justify-end gap-1">
                           <Skeleton className="h-8 w-8 rounded" />
                           <Skeleton className="h-8 w-8 rounded" />
                        </div>
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
   );
}
