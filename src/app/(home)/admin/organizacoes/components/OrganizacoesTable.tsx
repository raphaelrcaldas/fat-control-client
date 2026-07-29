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
import { FaImage, FaPenToSquare, FaTrashCan } from "react-icons/fa6";
import type { Organizacao } from "services/routes/organizacoes";
import { brasaoUrl } from "@/lib/orgBrasao";
import { Skeleton } from "@/components/ui/Skeleton";

interface OrganizacoesTableProps {
   organizacoes: Organizacao[];
   canManage: boolean;
   onEdit: (org: Organizacao) => void;
   onDelete: (org: Organizacao) => void;
}

/** Cabeçalho compartilhado pela tabela e pelo skeleton — as classes de
 *  visibilidade por breakpoint precisam ser as mesmas nos dois. */
function OrganizacoesTableHead({ canManage }: { canManage: boolean }) {
   return (
      <TableHead>
         <TableRow>
            <TableHeadCell className="w-16">
               <span className="sr-only">Brasão</span>
            </TableHeadCell>
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
            {canManage && (
               <TableHeadCell className="w-24">
                  <span className="sr-only">Ações</span>
               </TableHeadCell>
            )}
         </TableRow>
      </TableHead>
   );
}

export function OrganizacoesTable({
   organizacoes,
   canManage,
   onEdit,
   onDelete,
}: OrganizacoesTableProps) {
   return (
      <div className="overflow-x-auto rounded border border-slate-200 bg-white shadow-sm">
         <Table hoverable>
            <OrganizacoesTableHead canManage={canManage} />
            <TableBody className="divide-y">
               {organizacoes.map((org) => {
                  // Brasão é asset estático registrado em lib/orgBrasao.ts —
                  // sem ele o export da OM da org fica bloqueado.
                  const brasao = brasaoUrl(org.sigla);
                  return (
                     <TableRow key={org.sigla} className="bg-white">
                        <TableCell>
                           <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded border border-slate-200 bg-slate-50">
                              {brasao ? (
                                 // eslint-disable-next-line @next/next/no-img-element
                                 <img
                                    src={brasao}
                                    alt={`Brasão de ${org.sigla.toUpperCase()}`}
                                    className="h-full w-full object-contain"
                                 />
                              ) : (
                                 <Tooltip content="Sem brasão cadastrado">
                                    <FaImage className="h-4 w-4 text-slate-300" />
                                 </Tooltip>
                              )}
                           </div>
                        </TableCell>
                        <TableCell>
                           <span className="font-medium text-gray-900 uppercase">
                              {org.sigla}
                           </span>
                        </TableCell>
                        <TableCell className="hidden font-mono text-xs text-gray-500 sm:table-cell">
                           {org.sigla_2 || "—"}
                        </TableCell>
                        <TableCell className="hidden font-mono text-xs text-gray-500 lg:table-cell">
                           {org.sigla_3 || "—"}
                        </TableCell>
                        <TableCell className="text-gray-600">
                           {org.nome}
                        </TableCell>
                        <TableCell className="hidden text-gray-600 md:table-cell">
                           {org.alias || "—"}
                        </TableCell>
                        {canManage && (
                           <TableCell>
                              <div className="flex items-center justify-end gap-1">
                                 <Tooltip content="Editar organização">
                                    <button
                                       type="button"
                                       onClick={() => onEdit(org)}
                                       className="inline-flex items-center justify-center rounded p-2 text-gray-400 transition-colors hover:bg-slate-100 hover:text-slate-700 pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]"
                                       aria-label={`Editar organização ${org.sigla}`}
                                    >
                                       <FaPenToSquare className="h-4 w-4" />
                                    </button>
                                 </Tooltip>
                                 <Tooltip content="Excluir organização">
                                    <button
                                       type="button"
                                       onClick={() => onDelete(org)}
                                       className="inline-flex items-center justify-center rounded p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]"
                                       aria-label={`Excluir organização ${org.sigla}`}
                                    >
                                       <FaTrashCan className="h-4 w-4" />
                                    </button>
                                 </Tooltip>
                              </div>
                           </TableCell>
                        )}
                     </TableRow>
                  );
               })}
            </TableBody>
         </Table>
      </div>
   );
}

export function OrganizacoesTableSkeleton({
   rows = 8,
   canManage,
}: {
   rows?: number;
   canManage: boolean;
}) {
   return (
      <div className="overflow-x-auto rounded border border-slate-200 bg-white shadow-sm">
         <Table hoverable>
            <OrganizacoesTableHead canManage={canManage} />
            <TableBody className="divide-y">
               {Array.from({ length: rows }).map((_, i) => (
                  <TableRow key={i} className="bg-white">
                     <TableCell>
                        <Skeleton className="h-9 w-9" />
                     </TableCell>
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
                     {canManage && (
                        <TableCell>
                           <div className="flex items-center justify-end gap-1">
                              <Skeleton className="h-8 w-8 rounded pointer-coarse:h-[44px] pointer-coarse:w-[44px]" />
                              <Skeleton className="h-8 w-8 rounded pointer-coarse:h-[44px] pointer-coarse:w-[44px]" />
                           </div>
                        </TableCell>
                     )}
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
   );
}
