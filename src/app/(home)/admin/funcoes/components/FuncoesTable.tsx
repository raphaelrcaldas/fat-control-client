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
import { FaPenToSquare, FaTrashCan, FaListOl } from "react-icons/fa6";
import clsx from "clsx";
import { getFuncColors } from "@/constants/tripulantes/funcoes";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Funcao } from "services/routes/funcs";

interface FuncoesTableProps {
   funcoes: Funcao[];
   isBusy: boolean;
   onEdit: (funcao: Funcao) => void;
   onPosicoes: (funcao: Funcao) => void;
   onDelete: (funcao: Funcao) => void;
}

export function FuncoesTable({
   funcoes,
   isBusy,
   onEdit,
   onPosicoes,
   onDelete,
}: FuncoesTableProps) {
   return (
      <div className="overflow-x-auto rounded border border-slate-200 bg-white shadow-sm">
         <Table hoverable>
            <TableHead>
               <TableRow>
                  <TableHeadCell className="w-20">Código</TableHeadCell>
                  <TableHeadCell className="w-48">Nome</TableHeadCell>
                  <TableHeadCell className="w-28">Curto</TableHeadCell>
                  <TableHeadCell className="w-20">Ordem</TableHeadCell>
                  <TableHeadCell>Posições a bordo</TableHeadCell>
                  <TableHeadCell className="w-32">Situação</TableHeadCell>
                  <TableHeadCell className="w-40">
                     <span className="sr-only">Ações</span>
                  </TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className="divide-y">
               {funcoes.map((funcao) => {
                  const colors = getFuncColors(funcao.cor);
                  return (
                     <TableRow key={funcao.cod} className="bg-white">
                        <TableCell>
                           <span
                              className={clsx(
                                 "inline-grid size-9 place-items-center rounded-md font-mono text-xs font-bold uppercase",
                                 colors.badge
                              )}
                           >
                              {funcao.cod}
                           </span>
                        </TableCell>
                        <TableCell className="font-semibold text-slate-800">
                           {funcao.nome}
                        </TableCell>
                        <TableCell className="text-slate-600">
                           {funcao.nome_curto}
                        </TableCell>
                        <TableCell className="text-slate-600 tabular-nums">
                           {funcao.ordem}
                        </TableCell>
                        <TableCell>
                           {funcao.posicoes.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                 {funcao.posicoes.map((p) => (
                                    <Tooltip key={p.id} content={p.nome}>
                                       <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-600 uppercase">
                                          {p.cod}
                                       </span>
                                    </Tooltip>
                                 ))}
                              </div>
                           ) : (
                              <span className="text-xs text-slate-500 italic">
                                 {funcao.esporadica
                                    ? "esporádica — sem controle"
                                    : "nenhuma"}
                              </span>
                           )}
                        </TableCell>
                        <TableCell>
                           <Badge color={funcao.active ? "success" : "gray"}>
                              {funcao.active ? "Ativa" : "Inativa"}
                           </Badge>
                        </TableCell>
                        <TableCell>
                           <div className="flex items-center justify-end gap-1.5">
                              <Button
                                 size="xs"
                                 color="light"
                                 disabled={isBusy}
                                 onClick={() => onPosicoes(funcao)}
                                 title="Posições a bordo"
                              >
                                 <FaListOl className="size-3.5" />
                              </Button>
                              <Button
                                 size="xs"
                                 color="light"
                                 disabled={isBusy}
                                 onClick={() => onEdit(funcao)}
                                 title="Editar função"
                              >
                                 <FaPenToSquare className="size-3.5" />
                              </Button>
                              <Button
                                 size="xs"
                                 color="red"
                                 disabled={isBusy}
                                 onClick={() => onDelete(funcao)}
                                 title="Remover função"
                              >
                                 <FaTrashCan className="size-3.5" />
                              </Button>
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

export function FuncoesTableSkeleton() {
   return (
      <div className="space-y-2 rounded border border-slate-200 bg-white p-4 shadow-sm">
         {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
               <Skeleton className="size-9 rounded-md" />
               <Skeleton className="h-4 w-48" />
               <Skeleton className="h-4 w-24" />
               <Skeleton className="ml-auto h-7 w-28" />
            </div>
         ))}
      </div>
   );
}
