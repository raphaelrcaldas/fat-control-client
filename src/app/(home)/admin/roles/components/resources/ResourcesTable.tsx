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
import type { Resource } from "services/routes/security/resources";

interface ResourcesTableProps {
   resources: Resource[];
   onEdit: (resource: Resource) => void;
   onDelete: (resource: Resource) => void;
}

export function ResourcesTable({
   resources,
   onEdit,
   onDelete,
}: ResourcesTableProps) {
   return (
      <div className="overflow-x-auto">
         <Table hoverable>
            <TableHead>
               <TableRow>
                  <TableHeadCell className="w-16">ID</TableHeadCell>
                  <TableHeadCell>Nome</TableHeadCell>
                  <TableHeadCell className="hidden sm:table-cell">
                     Descricao
                  </TableHeadCell>
                  <TableHeadCell className="w-28">
                     <span className="sr-only">Acoes</span>
                  </TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className="divide-y">
               {resources.map((resource) => (
                  <TableRow
                     key={resource.id}
                     className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                     <TableCell className="font-mono text-xs text-gray-500 dark:text-gray-400">
                        {resource.id}
                     </TableCell>
                     <TableCell>
                        <span className="font-medium text-gray-900 dark:text-white">
                           {resource.name}
                        </span>
                        {/* Show description inline on mobile */}
                        <p
                           className="mt-0.5 text-xs text-gray-500 sm:hidden dark:text-gray-400"
                           aria-hidden="true"
                        >
                           {resource.description}
                        </p>
                     </TableCell>
                     <TableCell className="hidden text-gray-600 sm:table-cell dark:text-gray-300">
                        {resource.description}
                     </TableCell>
                     <TableCell>
                        <div className="flex items-center gap-2">
                           <Button
                              color="light"
                              size="sm"
                              onClick={() => onEdit(resource)}
                              aria-label={`Editar recurso ${resource.name}`}
                           >
                              <FaPenToSquare className="h-4 w-4" />
                           </Button>
                           <Button
                              color="red"
                              size="sm"
                              onClick={() => onDelete(resource)}
                              aria-label={`Excluir recurso ${resource.name}`}
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
