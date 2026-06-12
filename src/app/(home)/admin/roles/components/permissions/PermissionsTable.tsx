"use client";

import { Fragment } from "react";
import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";
import { FaCubes, FaPenToSquare, FaTrashCan } from "react-icons/fa6";
import type { PermissionDetail } from "services/routes/security/resources";
import { Skeleton } from "@/components/ui/Skeleton";
import { getActionChipTheme, compareActions } from "@/constants/admin/roles";
import clsx from "clsx";

interface PermissionsTableProps {
   permissions: PermissionDetail[];
   onEdit: (permission: PermissionDetail) => void;
   onDelete: (permission: PermissionDetail) => void;
}

function groupByResource(permissions: PermissionDetail[]) {
   const grouped = new Map<string, PermissionDetail[]>();
   permissions.forEach((permission) => {
      const group = grouped.get(permission.resource) ?? [];
      group.push(permission);
      grouped.set(permission.resource, group);
   });
   grouped.forEach((group) =>
      group.sort((a, b) => compareActions(a.action, b.action))
   );
   return [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export function PermissionsTable({
   permissions,
   onEdit,
   onDelete,
}: PermissionsTableProps) {
   const groups = groupByResource(permissions);

   return (
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
         <Table>
            <TableHead>
               <TableRow>
                  <TableHeadCell className="w-44">Ação</TableHeadCell>
                  <TableHeadCell className="hidden sm:table-cell">
                     Descrição
                  </TableHeadCell>
                  <TableHeadCell className="w-24">
                     <span className="sr-only">Ações</span>
                  </TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className="divide-y">
               {groups.map(([resource, resourcePermissions]) => (
                  <Fragment key={resource}>
                     <TableRow className="bg-gray-50 dark:border-gray-700 dark:bg-gray-900/60">
                        <TableCell colSpan={3} className="py-2">
                           <div className="flex items-center gap-2">
                              <FaCubes
                                 className="h-3 w-3 text-gray-400 dark:text-gray-500"
                                 aria-hidden="true"
                              />
                              <span className="text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-300">
                                 {resource}
                              </span>
                              <span className="text-xs text-gray-400 tabular-nums dark:text-gray-500">
                                 {resourcePermissions.length}
                              </span>
                           </div>
                        </TableCell>
                     </TableRow>

                     {resourcePermissions.map((permission) => {
                        const chip = getActionChipTheme(permission.action);
                        return (
                           <TableRow
                              key={permission.id}
                              className="bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700/40"
                           >
                              <TableCell>
                                 <span
                                    className={clsx(
                                       "inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-xs font-medium",
                                       chip.bg,
                                       chip.text,
                                       chip.border
                                    )}
                                 >
                                    {permission.action}
                                 </span>
                                 {/* Show description inline on mobile */}
                                 <p
                                    className="mt-1 text-xs text-gray-500 sm:hidden dark:text-gray-400"
                                    aria-hidden="true"
                                 >
                                    {permission.description}
                                 </p>
                              </TableCell>
                              <TableCell className="hidden text-gray-600 sm:table-cell dark:text-gray-300">
                                 {permission.description}
                              </TableCell>
                              <TableCell>
                                 <div className="flex items-center justify-end gap-1">
                                    <button
                                       onClick={() => onEdit(permission)}
                                       className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                                       aria-label={`Editar permissão ${permission.resource}.${permission.action}`}
                                    >
                                       <FaPenToSquare className="h-4 w-4" />
                                    </button>
                                    <button
                                       onClick={() => onDelete(permission)}
                                       className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                                       aria-label={`Excluir permissão ${permission.resource}.${permission.action}`}
                                    >
                                       <FaTrashCan className="h-4 w-4" />
                                    </button>
                                 </div>
                              </TableCell>
                           </TableRow>
                        );
                     })}
                  </Fragment>
               ))}
            </TableBody>
         </Table>
      </div>
   );
}

export function PermissionsTableSkeleton({ rows = 8 }: { rows?: number }) {
   return (
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
         <Table>
            <TableHead>
               <TableRow>
                  <TableHeadCell className="w-44">Ação</TableHeadCell>
                  <TableHeadCell className="hidden sm:table-cell">
                     Descrição
                  </TableHeadCell>
                  <TableHeadCell className="w-24">
                     <span className="sr-only">Ações</span>
                  </TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className="divide-y">
               {Array.from({ length: rows }).map((_, i) =>
                  i % 4 === 0 ? (
                     <TableRow
                        key={i}
                        className="bg-gray-50 dark:border-gray-700 dark:bg-gray-900/60"
                     >
                        <TableCell colSpan={3} className="py-2">
                           <Skeleton className="h-3 w-28" />
                        </TableCell>
                     </TableRow>
                  ) : (
                     <TableRow
                        key={i}
                        className="bg-white dark:border-gray-700 dark:bg-gray-800"
                     >
                        <TableCell>
                           <Skeleton className="h-5 w-20 rounded-md" />
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                           <Skeleton className="h-4 w-full max-w-sm" />
                        </TableCell>
                        <TableCell>
                           <div className="flex items-center justify-end gap-1">
                              <Skeleton className="h-8 w-8 rounded-lg" />
                              <Skeleton className="h-8 w-8 rounded-lg" />
                           </div>
                        </TableCell>
                     </TableRow>
                  )
               )}
            </TableBody>
         </Table>
      </div>
   );
}
