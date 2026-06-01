"use client";

import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
   Button,
   Badge,
   Tooltip,
} from "flowbite-react";
import { FaTrashCan, FaToggleOn, FaToggleOff } from "react-icons/fa6";
import type { Tenant } from "services/routes/tenants";
import { formatDateFull, extractDate } from "@/../utils/dateHandler";

interface TenantsTableProps {
   tenants: Tenant[];
   isUpdating: boolean;
   onToggleActive: (tenant: Tenant) => void;
   onDelete: (tenant: Tenant) => void;
}

export function TenantsTable({
   tenants,
   isUpdating,
   onToggleActive,
   onDelete,
}: TenantsTableProps) {
   return (
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
         <Table hoverable>
            <TableHead>
               <TableRow>
                  <TableHeadCell>Sigla</TableHeadCell>
                  <TableHeadCell>Nome</TableHeadCell>
                  <TableHeadCell className="w-24">Status</TableHeadCell>
                  <TableHeadCell className="hidden w-32 md:table-cell">
                     Registrado em
                  </TableHeadCell>
                  <TableHeadCell className="w-28">
                     <span className="sr-only">Ações</span>
                  </TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className="divide-y">
               {tenants.map((tenant) => (
                  <TableRow key={tenant.organizacao_id} className="bg-white">
                     <TableCell>
                        <span className="font-medium text-gray-900 uppercase">
                           {tenant.organizacao.sigla}
                        </span>
                     </TableCell>
                     <TableCell className="text-gray-600">
                        {tenant.organizacao.nome}
                     </TableCell>
                     <TableCell>
                        <Badge color={tenant.active ? "success" : "gray"}>
                           {tenant.active ? "Ativo" : "Inativo"}
                        </Badge>
                     </TableCell>
                     <TableCell className="hidden text-gray-500 md:table-cell">
                        {formatDateFull(extractDate(tenant.created_at))}
                     </TableCell>
                     <TableCell>
                        <div className="flex items-center gap-2">
                           <Tooltip
                              content={tenant.active ? "Desativar" : "Ativar"}
                           >
                              <button
                                 type="button"
                                 onClick={() => onToggleActive(tenant)}
                                 disabled={isUpdating}
                                 className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                                 aria-label={
                                    tenant.active
                                       ? `Desativar tenant ${tenant.organizacao.sigla}`
                                       : `Ativar tenant ${tenant.organizacao.sigla}`
                                 }
                              >
                                 {tenant.active ? (
                                    <FaToggleOn className="size-5 text-green-600" />
                                 ) : (
                                    <FaToggleOff className="size-5" />
                                 )}
                              </button>
                           </Tooltip>
                           <Tooltip content="Descadastrar tenant">
                              <Button
                                 color="red"
                                 size="sm"
                                 onClick={() => onDelete(tenant)}
                                 aria-label={`Descadastrar tenant ${tenant.organizacao.sigla}`}
                              >
                                 <FaTrashCan className="h-4 w-4" />
                              </Button>
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
