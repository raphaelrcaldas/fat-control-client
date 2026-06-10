"use client";

import { useState } from "react";
import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
   Button,
   Spinner,
} from "flowbite-react";
import { HiPlus } from "react-icons/hi";
import { MdEdit, MdDelete } from "react-icons/md";
import { isoDateToString } from "@/../utils/dateHandler";
import { useToast } from "@/app/context/toast";
import { usePessoal, useRemovePessoal } from "@/hooks/queries/useOperacoes";
import { PermBased } from "../../../hooks/usePermBased";
import { PessoalFormModal } from "./PessoalFormModal";
import type {
   OperacaoDetail,
   OperacaoPessoalOut,
} from "services/routes/ops/operacoes";

function iniciais(pg: string, nome: string): string {
   const a = nome.trim()[0] ?? "";
   const b = nome.trim().split(/\s+/).slice(-1)[0]?.[0] ?? pg.trim()[0] ?? "";
   return `${a}${b}`.toUpperCase();
}

export function PessoalTable({ op }: { op: OperacaoDetail }) {
   const { data: pessoal, isLoading } = usePessoal(op.id);
   const removeMutation = useRemovePessoal(op.id);
   const { push } = useToast();
   const [showForm, setShowForm] = useState(false);
   const [editing, setEditing] = useState<OperacaoPessoalOut | null>(null);
   const [removingId, setRemovingId] = useState<number | null>(null);

   const lista = pessoal ?? [];

   function openCreate() {
      setEditing(null);
      setShowForm(true);
   }

   function openEdit(p: OperacaoPessoalOut) {
      setEditing(p);
      setShowForm(true);
   }

   async function handleRemove(p: OperacaoPessoalOut) {
      setRemovingId(p.id);
      try {
         const res = await removeMutation.mutateAsync(p.id);
         push({
            title: res.ok ? "Removido" : "Erro",
            message: res.message || "Militar removido",
            type: res.ok ? "success" : "error",
         });
      } catch (err: unknown) {
         push({
            title: "Erro",
            message: err instanceof Error ? err.message : "Erro ao remover",
            type: "error",
         });
      } finally {
         setRemovingId(null);
      }
   }

   return (
      <section className="rounded-xl border border-slate-200 bg-white">
         <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
               <span className="h-4 w-1 rounded-full bg-red-600" />
               Militar envolvido
            </h2>
            <div className="flex items-center gap-2">
               <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                  {lista.length} {lista.length === 1 ? "militar" : "militares"}
               </span>
               <PermBased resource="operacoes" requiredPerm="create">
                  <Button color="red" size="xs" onClick={openCreate}>
                     <HiPlus className="mr-1 h-4 w-4" /> Associar
                  </Button>
               </PermBased>
            </div>
         </header>

         {isLoading ? (
            <div className="flex items-center justify-center py-12">
               <Spinner color="failure" size="lg" />
            </div>
         ) : lista.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-slate-400">
               Nenhum militar registrado nesta operação.
            </p>
         ) : (
            <div className="overflow-x-auto">
               <Table>
                  <TableHead>
                     <TableRow>
                        <TableHeadCell>Nome</TableHeadCell>
                        <TableHeadCell>Função</TableHeadCell>
                        <TableHeadCell>OM</TableHeadCell>
                        <TableHeadCell>Ingresso</TableHeadCell>
                        <TableHeadCell>Regresso</TableHeadCell>
                        <TableHeadCell className="text-right">
                           Dias
                        </TableHeadCell>
                        <TableHeadCell className="w-16 text-right" />
                     </TableRow>
                  </TableHead>
                  <TableBody className="divide-y">
                     {lista.map((p) => (
                        <TableRow key={p.id} className="bg-white">
                           <TableCell>
                              <div className="flex items-center gap-2">
                                 <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 font-mono text-[10px] font-bold text-slate-500">
                                    {iniciais(p.user.p_g, p.user.nome_guerra)}
                                 </span>
                                 <span className="font-medium text-slate-700">
                                    {p.user.p_g} {p.user.nome_guerra}
                                 </span>
                              </div>
                           </TableCell>
                           <TableCell className="text-slate-600">
                              {p.func}
                           </TableCell>
                           <TableCell className="font-mono text-xs text-slate-500">
                              {p.om}
                           </TableCell>
                           <TableCell className="font-mono text-slate-600 tabular-nums">
                              {isoDateToString(p.data_ingresso)}
                           </TableCell>
                           <TableCell className="font-mono text-slate-600 tabular-nums">
                              {isoDateToString(p.data_regresso)}
                           </TableCell>
                           <TableCell className="text-right font-mono font-bold text-slate-800 tabular-nums">
                              {p.dias}
                           </TableCell>
                           <TableCell className="text-right">
                              <PermBased
                                 resource="operacoes"
                                 requiredPerm="create"
                              >
                                 <div className="flex items-center justify-end gap-2">
                                    <button
                                       type="button"
                                       onClick={() => openEdit(p)}
                                       className="text-slate-300 hover:text-slate-600"
                                       title="Editar"
                                    >
                                       <MdEdit className="h-4 w-4" />
                                    </button>
                                    <button
                                       type="button"
                                       onClick={() => handleRemove(p)}
                                       disabled={removingId === p.id}
                                       className="text-slate-300 hover:text-rose-500"
                                       title="Remover"
                                    >
                                       {removingId === p.id ? (
                                          <Spinner size="sm" color="failure" />
                                       ) : (
                                          <MdDelete className="h-4 w-4" />
                                       )}
                                    </button>
                                 </div>
                              </PermBased>
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </div>
         )}

         <PessoalFormModal
            show={showForm}
            onClose={() => setShowForm(false)}
            op={op}
            editing={editing}
         />
      </section>
   );
}
