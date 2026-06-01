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
import type { Organizacao } from "services/routes/organizacoes";

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
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
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
                  <TableHeadCell className="w-28">
                     <span className="sr-only">Ações</span>
                  </TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className="divide-y">
               {organizacoes.map((org) => (
                  <TableRow
                     key={org.sigla}
                     className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                     <TableCell>
                        <span className="font-medium text-gray-900 dark:text-white">
                           {org.sigla}
                        </span>
                     </TableCell>
                     <TableCell className="hidden font-mono text-xs text-gray-500 sm:table-cell dark:text-gray-400">
                        {org.sigla_2 || "—"}
                     </TableCell>
                     <TableCell className="hidden font-mono text-xs text-gray-500 lg:table-cell dark:text-gray-400">
                        {org.sigla_3 || "—"}
                     </TableCell>
                     <TableCell className="text-gray-600 dark:text-gray-300">
                        {org.nome}
                     </TableCell>
                     <TableCell className="hidden text-gray-600 md:table-cell dark:text-gray-300">
                        {org.alias || "—"}
                     </TableCell>
                     <TableCell>
                        <div className="flex items-center gap-2">
                           <Button
                              color="light"
                              size="sm"
                              onClick={() => onEdit(org)}
                              aria-label={`Editar organização ${org.sigla}`}
                           >
                              <FaPenToSquare className="h-4 w-4" />
                           </Button>
                           <Button
                              color="red"
                              size="sm"
                              onClick={() => onDelete(org)}
                              aria-label={`Excluir organização ${org.sigla}`}
                           >
                              <FaTrashCan className="h-4 w-4" />
                           </Button>
                        </div>
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
   );
}
