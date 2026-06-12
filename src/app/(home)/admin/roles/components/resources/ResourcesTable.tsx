"use client";

import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";
import { FaPenToSquare, FaTrashCan } from "react-icons/fa6";
import type { Resource } from "services/routes/security/resources";
import { Skeleton } from "@/components/ui/Skeleton";

interface ResourcesTableProps {
   resources: Resource[];
   /** Quantidade de permissões por nome de recurso; undefined enquanto carrega */
   permissionCounts?: Map<string, number>;
   onEdit: (resource: Resource) => void;
   onDelete: (resource: Resource) => void;
}

export function ResourcesTable({
   resources,
   permissionCounts,
   onEdit,
   onDelete,
}: ResourcesTableProps) {
   return (
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
         <Table hoverable>
            <TableHead>
               <TableRow>
                  <TableHeadCell className="w-16">ID</TableHeadCell>
                  <TableHeadCell className="w-48">Nome</TableHeadCell>
                  <TableHeadCell className="hidden w-full sm:table-cell">
                     Descrição
                  </TableHeadCell>
                  <TableHeadCell className="hidden w-36 whitespace-nowrap md:table-cell">
                     Permissões
                  </TableHeadCell>
                  <TableHeadCell className="w-24">
                     <span className="sr-only">Ações</span>
                  </TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className="divide-y">
               {resources.map((resource) => {
                  const count = permissionCounts?.get(resource.name) ?? 0;

                  return (
                     <TableRow
                        key={resource.id}
                        className="bg-white dark:border-gray-700 dark:bg-gray-800"
                     >
                        <TableCell className="font-mono text-xs text-gray-500 dark:text-gray-400">
                           {resource.id}
                        </TableCell>
                        <TableCell>
                           <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 font-mono text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                              {resource.name}
                           </span>
                           {/* Show description inline on mobile */}
                           <p
                              className="mt-1 text-xs text-gray-500 sm:hidden dark:text-gray-400"
                              aria-hidden="true"
                           >
                              {resource.description}
                           </p>
                        </TableCell>
                        <TableCell className="hidden text-gray-600 sm:table-cell dark:text-gray-300">
                           {resource.description}
                        </TableCell>
                        <TableCell className="hidden whitespace-nowrap md:table-cell">
                           {permissionCounts === undefined ? (
                              <Skeleton className="h-4 w-16" />
                           ) : (
                              <span
                                 className={
                                    count === 0
                                       ? "text-xs text-gray-400 dark:text-gray-500"
                                       : "text-sm text-gray-700 tabular-nums dark:text-gray-200"
                                 }
                              >
                                 {count === 0
                                    ? "nenhuma"
                                    : `${count} ${count === 1 ? "permissão" : "permissões"}`}
                              </span>
                           )}
                        </TableCell>
                        <TableCell>
                           <div className="flex items-center justify-end gap-1">
                              <button
                                 onClick={() => onEdit(resource)}
                                 className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                                 aria-label={`Editar recurso ${resource.name}`}
                              >
                                 <FaPenToSquare className="h-4 w-4" />
                              </button>
                              <button
                                 onClick={() => onDelete(resource)}
                                 className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                                 aria-label={`Excluir recurso ${resource.name}`}
                              >
                                 <FaTrashCan className="h-4 w-4" />
                              </button>
                           </div>
                        </TableCell>
                     </TableRow>
                  );
               })}
            </TableBody>
         </Table>
      </div>
   );
}

export function ResourcesTableSkeleton({ rows = 8 }: { rows?: number }) {
   return (
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
         <Table hoverable>
            <TableHead>
               <TableRow>
                  <TableHeadCell className="w-16">ID</TableHeadCell>
                  <TableHeadCell className="w-48">Nome</TableHeadCell>
                  <TableHeadCell className="hidden w-full sm:table-cell">
                     Descrição
                  </TableHeadCell>
                  <TableHeadCell className="hidden w-36 whitespace-nowrap md:table-cell">
                     Permissões
                  </TableHeadCell>
                  <TableHeadCell className="w-24">
                     <span className="sr-only">Ações</span>
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
                        <Skeleton className="h-3 w-6" />
                     </TableCell>
                     <TableCell>
                        <Skeleton className="h-5 w-28 rounded-md" />
                     </TableCell>
                     <TableCell className="hidden sm:table-cell">
                        <Skeleton className="h-4 w-full max-w-sm" />
                     </TableCell>
                     <TableCell className="hidden md:table-cell">
                        <Skeleton className="h-4 w-16" />
                     </TableCell>
                     <TableCell>
                        <div className="flex items-center justify-end gap-1">
                           <Skeleton className="h-8 w-8 rounded-lg" />
                           <Skeleton className="h-8 w-8 rounded-lg" />
                        </div>
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
   );
}
