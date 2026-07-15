"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
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
import { MdDelete } from "react-icons/md";
import {
   isoDateToString,
   formatTime,
   minutesToTime,
} from "@/../utils/dateHandler";
import { useToast } from "@/app/context/toast";
import { useDesassociarEtapa } from "@/hooks/queries/useOperacoes";
import { PermBased } from "../../../hooks/usePermBased";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import type { OperacaoEtapaRow } from "services/routes/ops/operacoes";

interface Props {
   opId: number;
   etapas: OperacaoEtapaRow[];
   onAssociar: () => void;
}

export function EtapasTable({ opId, etapas, onAssociar }: Props) {
   const [anvFilter, setAnvFilter] = useState<string | null>(null);
   const [removingId, setRemovingId] = useState<number | null>(null);
   const [confirmId, setConfirmId] = useState<number | null>(null);
   const { push } = useToast();
   const removeMutation = useDesassociarEtapa(opId);

   const anvs = useMemo(() => {
      return Array.from(new Set(etapas.map((e) => e.anv))).sort();
   }, [etapas]);

   const rows = useMemo(
      () => (anvFilter ? etapas.filter((e) => e.anv === anvFilter) : etapas),
      [etapas, anvFilter]
   );

   const totalTvoo = useMemo(
      () => rows.reduce((sum, e) => sum + e.tvoo, 0),
      [rows]
   );

   async function handleRemove(etapaId: number) {
      setConfirmId(null);
      setRemovingId(etapaId);
      try {
         const res = await removeMutation.mutateAsync(etapaId);
         push({
            title: res.ok ? "Removida" : "Erro",
            message: res.message || "Etapa desassociada",
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
      <section className="rounded border border-slate-300 bg-white shadow">
         <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
               <span className="h-4 w-1 rounded-full bg-red-600" />
               Etapas associadas
            </h2>
            <div className="flex items-center gap-2">
               <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-500 tabular-nums">
                  {rows.length} de {etapas.length} · Σ{" "}
                  {minutesToTime(totalTvoo)}
               </span>
               <PermBased resource="operacoes.etapa" requiredPerm="create">
                  <Button color="red" size="xs" onClick={onAssociar}>
                     <HiPlus className="mr-1 h-4 w-4" /> Associar etapas
                  </Button>
               </PermBased>
            </div>
         </header>

         {anvs.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 px-4 py-2">
               <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                  Aeronaves
               </span>
               <button
                  type="button"
                  onClick={() => setAnvFilter(null)}
                  className={clsx(
                     "rounded-md px-2 py-0.5 text-[11px] font-bold transition-colors",
                     anvFilter === null
                        ? "bg-red-600 text-white"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  )}
               >
                  Todas
               </button>
               {anvs.map((a) => (
                  <button
                     key={a}
                     type="button"
                     onClick={() =>
                        setAnvFilter((cur) => (cur === a ? null : a))
                     }
                     className={clsx(
                        "rounded-md px-2 py-0.5 font-mono text-[11px] font-bold transition-colors",
                        anvFilter === a
                           ? "bg-red-600 text-white"
                           : "bg-red-50 text-red-700 hover:bg-red-100"
                     )}
                  >
                     {a}
                  </button>
               ))}
            </div>
         )}

         {etapas.length === 0 ? (
            <div className="flex min-h-70 flex-col items-center justify-center px-4 text-center">
               <p className="text-sm font-semibold text-slate-600">
                  Nenhuma etapa associada
               </p>
               <p className="mt-1 text-xs text-slate-400">
                  Associe etapas do período para consolidar as estatísticas.
               </p>
            </div>
         ) : (
            <div className="overflow-x-auto">
               <Table>
                  <TableHead>
                     <TableRow className="text-center">
                        <TableHeadCell className="text-center">
                           Data
                        </TableHeadCell>
                        <TableHeadCell className="text-center">
                           Rota
                        </TableHeadCell>
                        <TableHeadCell className="text-center">
                           Dep/Pso
                        </TableHeadCell>
                        <TableHeadCell className="text-center">
                           T. voo
                        </TableHeadCell>
                        <TableHeadCell className="text-center">
                           Aeronave
                        </TableHeadCell>
                        <TableHeadCell className="text-center">
                           Esforço
                        </TableHeadCell>
                        <TableHeadCell className="w-8 px-2" />
                     </TableRow>
                  </TableHead>
                  <TableBody className="divide-y">
                     {rows.map((e) => (
                        <TableRow key={e.id} className="bg-white">
                           <TableCell className="text-center font-mono text-slate-600 tabular-nums">
                              {isoDateToString(e.data)}
                           </TableCell>

                           <TableCell className="text-center font-mono font-semibold text-slate-700">
                              {e.origem}{" "}
                              <span className="text-slate-300">→</span>{" "}
                              {e.destino}
                           </TableCell>
                           <TableCell className="text-center font-mono text-slate-600 tabular-nums">
                              {formatTime(e.dep)}{" "}
                              <span className="text-slate-300">→</span>{" "}
                              {formatTime(e.arr)}
                           </TableCell>
                           <TableCell className="text-center font-mono font-bold text-slate-800 tabular-nums">
                              {minutesToTime(e.tvoo)}
                           </TableCell>
                           <TableCell className="text-center font-mono">
                              <span className="text-slate-700">{e.anv}</span>
                           </TableCell>
                           <TableCell className="text-center">
                              {e.esforco ? (
                                 <span className="px-1.5 py-0.5 text-[11px] text-red-700">
                                    {e.esforco}
                                 </span>
                              ) : (
                                 <span className="text-slate-300">—</span>
                              )}
                           </TableCell>
                           <TableCell className="px-2">
                              <PermBased
                                 resource="operacoes.etapa"
                                 requiredPerm="delete"
                              >
                                 <button
                                    type="button"
                                    onClick={() => setConfirmId(e.id)}
                                    disabled={removingId === e.id}
                                    className="text-slate-300 hover:text-rose-500"
                                    title="Desassociar etapa"
                                 >
                                    {removingId === e.id ? (
                                       <Spinner size="sm" color="primary" />
                                    ) : (
                                       <MdDelete className="h-4 w-4" />
                                    )}
                                 </button>
                              </PermBased>
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </div>
         )}

         <ConfirmDeleteModal
            show={confirmId !== null}
            message="Desassociar esta etapa da operação?"
            confirmLabel="Sim, desassociar"
            onClose={() => setConfirmId(null)}
            onConfirm={() => confirmId !== null && handleRemove(confirmId)}
         />
      </section>
   );
}
