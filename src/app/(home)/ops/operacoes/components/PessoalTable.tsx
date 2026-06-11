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
import {
   HiPlus,
   HiLogin,
   HiLogout,
   HiUser,
   HiBriefcase,
   HiFlag,
   HiCalendar,
} from "react-icons/hi";
import { MdEdit, MdDelete } from "react-icons/md";
import { isoDateToString } from "@/../utils/dateHandler";
import { useToast } from "@/app/context/toast";
import { usePessoal, useRemovePessoal } from "@/hooks/queries/useOperacoes";
import { PermBased } from "../../../hooks/usePermBased";
import { SIT_VALUES, type SitOption } from "../schemas/operacaoSchema";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { FUNC_STYLE, SIT_LABEL, SIT_STYLE } from "./operacaoUi";
import { PessoalFormModal } from "./PessoalFormModal";
import type {
   OperacaoDetail,
   OperacaoPessoalOut,
} from "services/routes/ops/operacoes";

export function PessoalTable({ op }: { op: OperacaoDetail }) {
   const { data: pessoal, isLoading } = usePessoal(op.id);
   const removeMutation = useRemovePessoal(op.id);
   const { push } = useToast();
   const [showForm, setShowForm] = useState(false);
   const [editing, setEditing] = useState<OperacaoPessoalOut | null>(null);
   const [removingId, setRemovingId] = useState<number | null>(null);
   const [confirmTarget, setConfirmTarget] =
      useState<OperacaoPessoalOut | null>(null);
   const [sitFilter, setSitFilter] = useState<SitOption | null>(null);

   const lista = pessoal ?? [];

   const sitCounts = { d: 0, g: 0, c: 0 } as Record<SitOption, number>;
   for (const p of lista) sitCounts[p.sit] += 1;

   const rows = sitFilter ? lista.filter((p) => p.sit === sitFilter) : lista;

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
         if (res.ok) setConfirmTarget(null);
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
      <section className="rounded border border-slate-300 bg-white shadow">
         <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
            <div className="flex flex-wrap items-center gap-3">
               <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <span className="h-4 w-1 rounded-full bg-red-600" />
                  Militares envolvidos
               </h2>
               {lista.length > 0 && (
                  <div className="flex items-center gap-1.5">
                     {SIT_VALUES.map((s) => {
                        const active = sitFilter === s;
                        return (
                           <button
                              key={s}
                              type="button"
                              aria-pressed={active}
                              onClick={() =>
                                 setSitFilter((cur) => (cur === s ? null : s))
                              }
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ring-1 transition-colors ring-inset ${
                                 active
                                    ? SIT_STYLE[s].active
                                    : SIT_STYLE[s].badge
                              }`}
                           >
                              {SIT_LABEL[s]}
                              <span className="tabular-nums opacity-70">
                                 {sitCounts[s]}
                              </span>
                           </button>
                        );
                     })}
                  </div>
               )}
            </div>
            <div className="flex items-center gap-2">
               <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                  {lista.length} {lista.length === 1 ? "militar" : "militares"}
               </span>
               <PermBased resource="operacoes.militar" requiredPerm="create">
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
                        <TableHeadCell>
                           <span className="inline-flex items-center gap-1">
                              <HiUser className="h-4 w-4 text-slate-400" />
                              Nome
                           </span>
                        </TableHeadCell>
                        <TableHeadCell className="text-center">
                           <span className="inline-flex items-center gap-1">
                              <HiBriefcase className="h-4 w-4 text-slate-400" />
                              Função
                           </span>
                        </TableHeadCell>
                        <TableHeadCell className="text-center">
                           <span className="inline-flex items-center gap-1">
                              <HiFlag className="h-4 w-4 text-slate-400" />
                              Situação
                           </span>
                        </TableHeadCell>
                        <TableHeadCell className="text-center">
                           <span className="inline-flex items-center gap-1">
                              <HiLogin className="h-4 w-4 text-emerald-600" />
                              Ingresso
                           </span>
                        </TableHeadCell>
                        <TableHeadCell className="text-center">
                           <span className="inline-flex items-center gap-1">
                              <HiLogout className="h-4 w-4 text-rose-600" />
                              Regresso
                           </span>
                        </TableHeadCell>
                        <TableHeadCell className="text-center">
                           <span className="inline-flex items-center gap-1">
                              <HiCalendar className="h-4 w-4 text-slate-400" />
                              Dias
                           </span>
                        </TableHeadCell>
                        <TableHeadCell className="w-16 text-right" />
                     </TableRow>
                  </TableHead>
                  <TableBody className="divide-y">
                     {rows.length === 0 && (
                        <TableRow>
                           <TableCell
                              colSpan={7}
                              className="py-8 text-center text-sm text-slate-400"
                           >
                              Nenhum militar com situação{" "}
                              <strong>
                                 {sitFilter ? SIT_LABEL[sitFilter] : ""}
                              </strong>
                              .
                           </TableCell>
                        </TableRow>
                     )}
                     {rows.map((p) => (
                        <TableRow key={p.id} className="bg-white">
                           <TableCell>
                              <div className="flex items-center gap-2">
                                 <span className="font-medium text-slate-700 uppercase">
                                    {p.user.p_g} {p.user.nome_guerra}
                                 </span>
                              </div>
                           </TableCell>
                           <TableCell className="text-center">
                              <span
                                 className={`inline-flex w-24 justify-center rounded px-2 py-0.5 text-sm font-semibold ring-1 ring-inset ${FUNC_STYLE[p.func].badge}`}
                              >
                                 {p.func}
                              </span>
                           </TableCell>
                           <TableCell className="text-center">
                              <span
                                 className={`inline-flex justify-center rounded-md px-2 py-0.5 text-sm font-semibold uppercase ring-1 ring-inset ${SIT_STYLE[p.sit].badge}`}
                              >
                                 {p.sit}
                              </span>
                           </TableCell>
                           <TableCell className="text-center font-mono text-slate-600 tabular-nums">
                              {isoDateToString(p.data_ingresso)}
                           </TableCell>
                           <TableCell className="text-center font-mono text-slate-600 tabular-nums">
                              {isoDateToString(p.data_regresso)}
                           </TableCell>
                           <TableCell className="text-center font-mono font-bold text-slate-800 tabular-nums">
                              {p.dias}
                           </TableCell>
                           <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                 <PermBased
                                    resource="operacoes.militar"
                                    requiredPerm="create"
                                 >
                                    <button
                                       type="button"
                                       onClick={() => openEdit(p)}
                                       className="text-slate-300 hover:text-slate-600"
                                       title="Editar"
                                    >
                                       <MdEdit className="h-4 w-4" />
                                    </button>
                                 </PermBased>
                                 <PermBased
                                    resource="operacoes.militar"
                                    requiredPerm="delete"
                                 >
                                    <button
                                       type="button"
                                       onClick={() => setConfirmTarget(p)}
                                       className="text-slate-300 hover:text-rose-500"
                                       title="Remover"
                                    >
                                       <MdDelete className="h-4 w-4" />
                                    </button>
                                 </PermBased>
                              </div>
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
         <ConfirmDeleteModal
            show={confirmTarget !== null}
            message={
               confirmTarget
                  ? `Remover ${confirmTarget.user.p_g.toUpperCase()} ${confirmTarget.user.nome_guerra.toUpperCase()} desta operação?`
                  : ""
            }
            confirmLabel="Sim, remover"
            isDeleting={removingId === confirmTarget?.id}
            onClose={() => setConfirmTarget(null)}
            onConfirm={() => confirmTarget && handleRemove(confirmTarget)}
         />
      </section>
   );
}
