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
import type { PermissionDetail } from "services/routes/security/resources";
import { Skeleton } from "@/components/ui/Skeleton";

interface PermissionsTableProps {
   permissions: PermissionDetail[];
   onEdit: (permission: PermissionDetail) => void;
   onDelete: (permission: PermissionDetail) => void;
}

export function PermissionsTable({
   permissions,
   onEdit,
   onDelete,
}: PermissionsTableProps) {
   return (
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
         <Table hoverable>
            <TableHead>
               <TableRow>
                  <TableHeadCell>Recurso</TableHeadCell>
                  <TableHeadCell>Acao</TableHeadCell>
                  <TableHeadCell className="hidden sm:table-cell">
                     Descricao
                  </TableHeadCell>
                  <TableHeadCell className="w-28">
                     <span className="sr-only">Acoes</span>
                  </TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className="divide-y">
               {permissions.map((permission) => (
                  <TableRow
                     key={permission.id}
                     className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                     <TableCell>
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                           {permission.resource}
                        </span>
                     </TableCell>
                     <TableCell>
                        <span className="font-medium text-gray-900 dark:text-white">
                           {permission.action}
                        </span>
                        {/* Show description inline on mobile */}
                        <p
                           className="mt-0.5 text-xs text-gray-500 sm:hidden dark:text-gray-400"
                           aria-hidden="true"
                        >
                           {permission.description}
                        </p>
                     </TableCell>
                     <TableCell className="hidden text-gray-600 sm:table-cell dark:text-gray-300">
                        {permission.description}
                     </TableCell>
                     <TableCell>
                        <div className="flex items-center gap-2">
                           <Button
                              color="light"
                              size="sm"
                              onClick={() => onEdit(permission)}
                              aria-label={`Editar permissao ${permission.resource}.${permission.action}`}
                           >
                              <FaPenToSquare className="h-4 w-4" />
                           </Button>
                           <Button
                              color="red"
                              size="sm"
                              onClick={() => onDelete(permission)}
                              aria-label={`Excluir permissao ${permission.resource}.${permission.action}`}
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

export function PermissionsTableSkeleton({ rows = 8 }: { rows?: number }) {
   return (
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
         <Table hoverable>
            <TableHead>
               <TableRow>
                  <TableHeadCell>Recurso</TableHeadCell>
                  <TableHeadCell>Acao</TableHeadCell>
                  <TableHeadCell className="hidden sm:table-cell">
                     Descricao
                  </TableHeadCell>
                  <TableHeadCell className="w-28">
                     <span className="sr-only">Acoes</span>
                  </TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className="divide-y">
               {Array.from({ length: rows }).map((_, i) => (
                  <TableRow
                     key={i}
                     className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                     <TableCell>
                        <Skeleton className="h-5 w-20 rounded-md" />
                     </TableCell>
                     <TableCell>
                        <Skeleton className="h-4 w-24" />
                     </TableCell>
                     <TableCell className="hidden sm:table-cell">
                        <Skeleton className="h-4 w-full max-w-sm" />
                     </TableCell>
                     <TableCell>
                        <div className="flex items-center gap-2">
                           <Skeleton className="h-9 w-10" />
                           <Skeleton className="h-9 w-10" />
                        </div>
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
   );
}
