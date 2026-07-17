"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
   Modal,
   ModalHeader,
   ModalBody,
   Button,
   Checkbox,
   Spinner,
   Alert,
} from "flowbite-react";
import {
   MdLink,
   MdWarning,
   MdInfoOutline,
   MdCalendarToday,
} from "react-icons/md";
import {
   isoDateToString,
   formatTime,
   minutesToTime,
} from "@/../utils/dateHandler";
import { useToast } from "@/app/context/toast";
import { useCandidatas, useAssociarEtapas } from "@/hooks/queries/useOperacoes";
import type { OperacaoDetail } from "services/routes/ops/operacoes";

interface Props {
   show: boolean;
   onClose: () => void;
   op: OperacaoDetail;
}

export function AssociarEtapasModal({ show, onClose, op }: Props) {
   const { push } = useToast();
   const { data: candidatas, isLoading } = useCandidatas(op.id, show);
   const associarMutation = useAssociarEtapas(op.id);
   const [selected, setSelected] = useState<Set<number>>(new Set());
   const [anvFilter, setAnvFilter] = useState<string | null>(null);

   useEffect(() => {
      if (show) {
         setSelected(new Set());
         setAnvFilter(null);
      }
   }, [show]);

   function toggle(id: number) {
      setSelected((prev) => {
         const next = new Set(prev);
         if (next.has(id)) next.delete(id);
         else next.add(id);
         return next;
      });
   }

   const lista = candidatas ?? [];

   const anvs = useMemo(
      () => Array.from(new Set(lista.map((c) => c.anv))).sort(),
      [lista]
   );

   const rows = useMemo(
      () => (anvFilter ? lista.filter((c) => c.anv === anvFilter) : lista),
      [lista, anvFilter]
   );

   const preview = useMemo(() => {
      const sel = lista.filter((c) => selected.has(c.id));
      const anv = new Set(sel.map((c) => c.anv));
      const missoes = new Set(sel.map((c) => c.missao_id));
      const horas = sel.reduce((sum, c) => sum + c.tvoo, 0);
      return {
         etapas: sel.length,
         horas,
         anv: anv.size,
         missoes: missoes.size,
      };
   }, [lista, selected]);

   async function handleAssociar() {
      const ids = Array.from(selected);
      if (ids.length === 0) return;
      try {
         const res = await associarMutation.mutateAsync(ids);
         const bloq = res.data?.bloqueadas?.length ?? 0;
         push({
            title: res.ok ? "Associadas" : "Erro",
            message: res.message + (bloq > 0 ? ` · ${bloq} bloqueada(s)` : ""),
            type: res.ok ? "success" : "error",
         });
         if (res.ok) onClose();
      } catch (err: unknown) {
         push({
            title: "Erro",
            message: err instanceof Error ? err.message : "Erro ao associar",
            type: "error",
         });
      }
   }

   return (
      <Modal show={show} size="2xl" onClose={onClose} dismissible>
         <ModalHeader>
            <span className="flex items-center gap-2">
               <MdLink className="text-primary-600 h-5 w-5" />
               Associar etapas
            </span>
         </ModalHeader>
         <ModalBody>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded border border-slate-200 bg-slate-50 px-4 py-3">
               <h3 className="text-lg leading-tight font-bold text-slate-800">
                  {op.nome}
               </h3>
               <span className="bg-primary-600 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-sm font-bold text-white tabular-nums">
                  <MdCalendarToday className="h-4 w-4" />
                  {isoDateToString(op.data_inicio)} –{" "}
                  {isoDateToString(op.data_fim)}
               </span>
            </div>

            <Alert color="info" icon={MdInfoOutline} className="mb-3" rounded>
               As etapas candidatas são as compreendidas dentro do período da
               operação. Etapas já vinculadas a outra operação aparecem
               bloqueadas (cada etapa pertence a no máximo uma operação).
            </Alert>

            <div className="mb-3 flex min-h-6.5 flex-wrap items-center gap-1.5">
               {anvs.length > 0 && (
                  <>
                     <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
                        Aeronaves
                     </span>
                     <button
                        type="button"
                        onClick={() => setAnvFilter(null)}
                        className={clsx(
                           "rounded-md px-2 py-1.5 text-[11px] font-bold transition-colors pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]",
                           anvFilter === null
                              ? "bg-primary-600 text-white"
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
                              "rounded-md px-2 py-1.5 font-mono text-[11px] font-bold transition-colors pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]",
                              anvFilter === a
                                 ? "bg-primary-600 text-white"
                                 : "bg-primary-50 text-primary-700 hover:bg-primary-100"
                           )}
                        >
                           {a}
                        </button>
                     ))}
                  </>
               )}
            </div>

            <div className="h-[38vh]">
               {isLoading ? (
                  <div className="h-full overflow-hidden rounded border border-slate-300 shadow">
                     <div className="animate-pulse divide-y divide-slate-100">
                        {Array.from({ length: 7 }).map((_, i) => (
                           <div
                              key={i}
                              className="grid grid-cols-6 items-center gap-2 px-3 py-2.5"
                           >
                              <div className="h-4 w-4 rounded bg-slate-200" />
                              <div className="mx-auto h-3.5 w-16 rounded bg-slate-100" />
                              <div className="mx-auto h-3.5 w-20 rounded bg-slate-200" />
                              <div className="mx-auto h-3.5 w-20 rounded bg-slate-100" />
                              <div className="mx-auto h-3.5 w-12 rounded bg-slate-200" />
                              <div className="mx-auto h-3.5 w-14 rounded bg-slate-100" />
                           </div>
                        ))}
                     </div>
                  </div>
               ) : lista.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50 px-4 text-center">
                     <p className="text-sm font-semibold text-slate-600">
                        Nenhuma etapa candidata no período
                     </p>
                     <p className="mt-1 text-xs text-slate-400">
                        Só aparecem etapas dentro do intervalo da operação.
                     </p>
                  </div>
               ) : (
                  <div className="h-full overflow-y-auto rounded border border-slate-300 shadow">
                     <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-white shadow-[inset_0_-1px_0_var(--color-slate-200)]">
                           <tr className="text-center font-mono text-[10px] tracking-[0.15em] text-slate-500 uppercase">
                              <th className="w-8 px-3 py-2" />
                              <th className="px-2 py-2 text-center font-bold">
                                 Data
                              </th>
                              <th className="px-2 py-2 text-center font-bold">
                                 Rota
                              </th>
                              <th className="px-2 py-2 text-center font-bold">
                                 Dep/Pso
                              </th>
                              <th className="px-2 py-2 text-center font-bold">
                                 T. voo
                              </th>
                              <th className="px-2 py-2 text-center font-bold">
                                 Aeronave
                              </th>
                              <th className="px-2 py-2 text-center font-bold" />
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {rows.map((c) => {
                              const checked = selected.has(c.id);
                              return (
                                 <tr
                                    key={c.id}
                                    className={clsx(
                                       "text-center",
                                       c.bloqueada
                                          ? "bg-slate-50 opacity-60"
                                          : checked
                                            ? "bg-primary-50/50"
                                            : "hover:bg-slate-50"
                                    )}
                                 >
                                    <td className="px-3 py-2">
                                       <Checkbox
                                          checked={checked}
                                          disabled={c.bloqueada}
                                          onChange={() => toggle(c.id)}
                                          color="primary"
                                       />
                                    </td>
                                    <td className="px-2 py-2 text-center font-mono text-slate-600 tabular-nums">
                                       {isoDateToString(c.data)}
                                    </td>
                                    <td className="px-2 py-2 text-center font-mono font-semibold text-slate-700">
                                       {c.origem}{" "}
                                       <span className="text-slate-300">→</span>{" "}
                                       {c.destino}
                                    </td>
                                    <td className="px-2 py-2 text-center font-mono text-slate-600 tabular-nums">
                                       {formatTime(c.dep)}{" "}
                                       <span className="text-slate-300">→</span>{" "}
                                       {formatTime(c.arr)}
                                    </td>
                                    <td className="px-2 py-2 text-center font-mono font-bold text-slate-800 tabular-nums">
                                       {minutesToTime(c.tvoo)}
                                    </td>
                                    <td className="px-2 py-2 text-center font-mono text-slate-700">
                                       {c.anv}
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                       {c.bloqueada && (
                                          <span className="inline-flex items-center gap-1 rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 uppercase">
                                             <MdWarning className="h-3 w-3" />
                                             em OP.{" "}
                                             {String(c.operacao_atual).padStart(
                                                3,
                                                "0"
                                             )}
                                          </span>
                                       )}
                                    </td>
                                 </tr>
                              );
                           })}
                        </tbody>
                     </table>
                  </div>
               )}
            </div>
         </ModalBody>

         <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-6 py-3">
            <div className="flex items-center gap-3 font-mono text-xs text-slate-500 tabular-nums">
               <span>
                  <strong className="text-slate-800">{preview.etapas}</strong>{" "}
                  etapas
               </span>
               <span>
                  <strong className="text-slate-800">
                     {minutesToTime(preview.horas)}
                  </strong>{" "}
                  de voo
               </span>
               <span>
                  <strong className="text-slate-800">{preview.anv}</strong> anv
               </span>
               <span>
                  <strong className="text-slate-800">{preview.missoes}</strong>{" "}
                  missões
               </span>
            </div>
            <div className="flex gap-2">
               <Button color="gray" size="sm" onClick={onClose}>
                  Cancelar
               </Button>
               <Button
                  color="primary"
                  size="sm"
                  disabled={preview.etapas === 0 || associarMutation.isPending}
                  onClick={handleAssociar}
               >
                  {associarMutation.isPending ? (
                     <Spinner size="sm" color="primary" />
                  ) : (
                     <>
                        <MdLink className="mr-1 h-4 w-4" /> Associar{" "}
                        {preview.etapas}{" "}
                        {preview.etapas === 1 ? "etapa" : "etapas"}
                     </>
                  )}
               </Button>
            </div>
         </div>
      </Modal>
   );
}
