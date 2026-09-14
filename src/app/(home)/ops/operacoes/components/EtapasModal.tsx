"use client";

import { useMemo, useState } from "react";
import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
   Button,
   TextInput,
   Spinner,
} from "flowbite-react";
import { IoMdSearch } from "react-icons/io";
import { HiPlus } from "react-icons/hi";
import { MdDelete } from "react-icons/md";
import {
   isoDateToShort,
   formatTime,
   minutesToTime,
} from "@/../utils/dateHandler";
import { useToast } from "@/app/context/toast";
import { useDesassociarEtapa } from "@/hooks/queries/useOperacoes";
import { PermBased } from "../../../hooks/usePermBased";
import { ListaModal, ModalTools, FiltroGrupo } from "./ListaModal";
import { Segmented } from "./Segmented";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import type { OperacaoEtapaRow } from "services/routes/ops/operacoes";

interface Props {
   show: boolean;
   onClose: () => void;
   opId: number;
   opNome: string;
   opInicio: string;
   opFim: string;
   etapas: OperacaoEtapaRow[];
   onAssociar: () => void;
}

export function EtapasModal({
   show,
   onClose,
   opId,
   opNome,
   etapas,
   onAssociar,
}: Props) {
   const [busca, setBusca] = useState("");
   const [anvFilter, setAnvFilter] = useState<string | null>(null);
   const [removingId, setRemovingId] = useState<number | null>(null);
   const [confirmId, setConfirmId] = useState<number | null>(null);
   const { push } = useToast();
   const removeMutation = useDesassociarEtapa(opId);

   const anvs = useMemo(() => {
      return Array.from(new Set(etapas.map((e) => e.anv))).sort();
   }, [etapas]);

   const anvOptions = useMemo(
      () => [
         { value: null, label: "Todas", count: etapas.length },
         ...anvs.map((a) => ({
            value: a,
            label: a,
            count: etapas.filter((e) => e.anv === a).length,
         })),
      ],
      [anvs, etapas]
   );

   // O backend devolve em ordem crescente de data; a lista mostra da mais
   // recente para a mais antiga, que é a ordem em que se procura um voo.
   const rows = useMemo(() => {
      const termo = busca.trim().toLowerCase();
      const filtradas = etapas.filter((e) => {
         if (anvFilter && e.anv !== anvFilter) return false;
         if (!termo) return true;
         return (
            e.origem.toLowerCase().includes(termo) ||
            e.destino.toLowerCase().includes(termo) ||
            e.anv.toLowerCase().includes(termo)
         );
      });
      return filtradas.slice().reverse();
   }, [etapas, busca, anvFilter]);

   const totalTvoo = useMemo(
      () => rows.reduce((sum, e) => sum + e.tvoo, 0),
      [rows]
   );

   function limparFiltros() {
      setBusca("");
      setAnvFilter(null);
   }

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
      <ListaModal
         show={show}
         onClose={onClose}
         titulo="Etapas"
         contexto={opNome}
         ferramentas={
            <ModalTools>
               <div className="flex w-full items-center gap-2">
                  <TextInput
                     icon={IoMdSearch}
                     sizing="sm"
                     placeholder="buscar rota, aeronave…"
                     value={busca}
                     onChange={(e) => setBusca(e.target.value)}
                     className="min-w-0 flex-1"
                  />
                  <PermBased
                     resource="ops.operacoes.etapas"
                     requiredPerm="create"
                  >
                     <Button
                        color="primary"
                        size="xs"
                        onClick={onAssociar}
                        className="ml-auto shrink-0"
                     >
                        <HiPlus className="mr-1 h-4 w-4" /> Associar etapas
                     </Button>
                  </PermBased>
               </div>

               {anvs.length > 0 && (
                  <FiltroGrupo label="Anv">
                     <Segmented
                        options={anvOptions}
                        value={anvFilter}
                        onChange={setAnvFilter}
                        ariaLabel="Filtrar por aeronave"
                     />
                  </FiltroGrupo>
               )}
            </ModalTools>
         }
         rodape={
            <>
               <span>
                  Mostrando <strong>{rows.length}</strong> de{" "}
                  <strong>{etapas.length}</strong> etapas
               </span>
               <span>
                  Σ do recorte <strong>{minutesToTime(totalTvoo)}</strong>
               </span>
            </>
         }
      >
         {rows.length === 0 && etapas.length > 0 ? (
            <div className="flex min-h-70 flex-col items-center justify-center gap-2 px-4 text-center">
               <p className="text-sm font-semibold text-slate-600">
                  Nenhuma etapa neste recorte
               </p>
               <p className="text-xs text-slate-500">
                  {etapas.length}{" "}
                  {etapas.length === 1
                     ? "etapa ficou fora"
                     : "etapas ficaram fora"}{" "}
                  do recorte atual.
               </p>
               <Button color="light" size="xs" onClick={limparFiltros}>
                  Limpar filtros
               </Button>
            </div>
         ) : (
            <>
               {/* Seis colunas não sobrevivem a 360px — a coluna Anv fica
                   cortada fora da tela —, então abaixo de `md` a etapa vira
                   linha de duas alturas. */}
               <ul className="divide-y divide-slate-100 md:hidden">
                  {rows.map((e) => (
                     <li
                        key={e.id}
                        className="flex items-stretch gap-2 px-4 py-2.5"
                     >
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                           <div className="flex items-baseline justify-between gap-2">
                              <span className="min-w-0 truncate font-mono text-[13px] font-bold text-slate-900">
                                 {e.origem}{" "}
                                 <span aria-hidden className="text-slate-500">
                                    →
                                 </span>{" "}
                                 {e.destino}
                              </span>
                              <span className="shrink-0 font-mono text-[13px] font-bold text-slate-900 tabular-nums">
                                 {minutesToTime(e.tvoo)}
                              </span>
                           </div>
                           <div className="flex items-baseline justify-between gap-2">
                              <span className="min-w-0 truncate text-[11px] text-slate-500">
                                 {isoDateToShort(e.data)} · {formatTime(e.dep)}{" "}
                                 → {formatTime(e.arr)}
                                 {e.esforco ? ` · ${e.esforco}` : ""}
                              </span>
                              <span className="shrink-0 font-mono text-[11px] text-slate-500">
                                 {e.anv}
                              </span>
                           </div>
                        </div>
                        <PermBased
                           resource="ops.operacoes.etapas"
                           requiredPerm="delete"
                        >
                           <button
                              type="button"
                              onClick={() => setConfirmId(e.id)}
                              disabled={removingId === e.id}
                              className="flex shrink-0 items-center justify-center p-1 text-red-700 pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]"
                              title="Desassociar etapa"
                           >
                              {removingId === e.id ? (
                                 <Spinner size="sm" color="primary" />
                              ) : (
                                 <MdDelete className="h-4 w-4" />
                              )}
                           </button>
                        </PermBased>
                     </li>
                  ))}
               </ul>

               <div className="hidden md:block">
                  <Table>
                     <TableHead className="sticky top-0 z-10">
                        <TableRow>
                           <TableHeadCell>Data</TableHeadCell>
                           <TableHeadCell>Rota</TableHeadCell>
                           <TableHeadCell>Dep → Pso</TableHeadCell>
                           <TableHeadCell className="text-right">
                              T. voo
                           </TableHeadCell>
                           <TableHeadCell>Anv</TableHeadCell>
                           <TableHeadCell>Esforço</TableHeadCell>
                           <TableHeadCell className="w-8 px-2">
                              <span className="sr-only">Ações</span>
                           </TableHeadCell>
                        </TableRow>
                     </TableHead>
                     <TableBody className="divide-y">
                        {rows.map((e) => (
                           <TableRow key={e.id} className="bg-white">
                              <TableCell className="w-px font-mono whitespace-nowrap text-slate-600 tabular-nums">
                                 {isoDateToShort(e.data)}
                              </TableCell>
                              <TableCell className="w-px font-mono font-bold whitespace-nowrap">
                                 {e.origem}{" "}
                                 <span aria-hidden className="text-slate-500">
                                    →
                                 </span>{" "}
                                 {e.destino}
                              </TableCell>
                              <TableCell className="w-px font-mono whitespace-nowrap text-slate-600 tabular-nums">
                                 {formatTime(e.dep)}{" "}
                                 <span aria-hidden className="text-slate-500">
                                    →
                                 </span>{" "}
                                 {formatTime(e.arr)}
                              </TableCell>
                              <TableCell className="w-px text-right font-mono font-bold whitespace-nowrap text-slate-800 tabular-nums">
                                 {minutesToTime(e.tvoo)}
                              </TableCell>
                              <TableCell className="w-px font-mono whitespace-nowrap text-slate-700">
                                 {e.anv}
                              </TableCell>
                              <TableCell className="max-w-0">
                                 {e.esforco ? (
                                    <span
                                       className="block truncate text-slate-600"
                                       title={e.esforco}
                                    >
                                       {e.esforco}
                                    </span>
                                 ) : (
                                    <span className="text-slate-500">—</span>
                                 )}
                              </TableCell>
                              <TableCell className="w-px px-2">
                                 <PermBased
                                    resource="ops.operacoes.etapas"
                                    requiredPerm="delete"
                                 >
                                    <button
                                       type="button"
                                       onClick={() => setConfirmId(e.id)}
                                       disabled={removingId === e.id}
                                       className="p-1 text-red-700 pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]"
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
            </>
         )}

         <ConfirmDeleteModal
            show={confirmId !== null}
            message="Desassociar esta etapa da operação?"
            confirmLabel="Sim, desassociar"
            onClose={() => setConfirmId(null)}
            onConfirm={() => confirmId !== null && handleRemove(confirmId)}
         />
      </ListaModal>
   );
}
