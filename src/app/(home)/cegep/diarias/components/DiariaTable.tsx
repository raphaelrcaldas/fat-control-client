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
import { HiPencil, HiTrash } from "react-icons/hi";
import { PermBased } from "../../../hooks/usePermBased";
import type { DiariaValorPublic, GrupoCidadePublic } from "../types";
import {
   formatCurrency,
   formatDiariaDate,
   getStatusBadge,
   getCidadeDisplayName,
} from "../utils";

interface DiariaTableProps {
   valores: DiariaValorPublic[];
   cidadesByGrupo: Map<number, GrupoCidadePublic[]>;
   onEdit: (valor: DiariaValorPublic) => void;
   onDelete: (id: number) => void;
}

export function DiariaTable({
   valores,
   cidadesByGrupo,
   onEdit,
   onDelete,
}: DiariaTableProps) {
   return (
      <div className="hidden overflow-x-auto rounded border border-slate-200 bg-white shadow-sm md:block">
         <Table hoverable>
            <TableHead>
               <TableRow>
                  <TableHeadCell>Grupo Cidade</TableHeadCell>
                  <TableHeadCell className="text-center">Valor</TableHeadCell>
                  <TableHeadCell className="text-center">Início</TableHeadCell>
                  <TableHeadCell className="text-center">Fim</TableHeadCell>
                  <TableHeadCell className="text-center">Status</TableHeadCell>
                  <TableHeadCell className="w-24">
                     <span className="sr-only">Ações</span>
                  </TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className="divide-y">
               {valores.map((valor) => {
                  const cidades = cidadesByGrupo.get(valor.grupo_cid) || [];
                  const cidadeNome = getCidadeDisplayName(
                     valor.grupo_cid,
                     cidades
                  );

                  return (
                     <TableRow key={valor.id} className="bg-white">
                        <TableCell className="text-gray-700">
                           {cidadeNome}
                        </TableCell>
                        <TableCell className="text-center font-mono font-semibold text-green-600">
                           {formatCurrency(valor.valor)}
                        </TableCell>
                        <TableCell className="text-center font-mono text-gray-600">
                           {formatDiariaDate(valor.data_inicio)}
                        </TableCell>
                        <TableCell className="text-center font-mono text-gray-600">
                           {formatDiariaDate(valor.data_fim)}
                        </TableCell>
                        <TableCell>
                           <div className="flex justify-center">
                              {getStatusBadge(valor.status)}
                           </div>
                        </TableCell>
                        <TableCell>
                           <div className="flex items-center justify-end gap-1">
                              <PermBased
                                 resource="diarias"
                                 requiredPerm="update"
                              >
                                 <Tooltip content="Editar valor">
                                    <button
                                       type="button"
                                       onClick={() => onEdit(valor)}
                                       className="rounded p-2 text-gray-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                                       aria-label="Editar valor de diária"
                                    >
                                       <HiPencil className="h-4 w-4" />
                                    </button>
                                 </Tooltip>
                              </PermBased>
                              <PermBased
                                 resource="diarias"
                                 requiredPerm="delete"
                              >
                                 <Tooltip content="Excluir valor">
                                    <button
                                       type="button"
                                       onClick={() => onDelete(valor.id)}
                                       className="rounded p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                       aria-label="Excluir valor de diária"
                                    >
                                       <HiTrash className="h-4 w-4" />
                                    </button>
                                 </Tooltip>
                              </PermBased>
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
