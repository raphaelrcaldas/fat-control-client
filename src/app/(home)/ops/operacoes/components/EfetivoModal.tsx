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
} from "flowbite-react";
import { HiPlus } from "react-icons/hi";
import { IoMdSearch } from "react-icons/io";
import { MdEdit, MdDelete } from "react-icons/md";
import { isoDateToShort } from "@/../utils/dateHandler";
import { useToast } from "@/app/context/toast";
import { usePessoal, useRemovePessoal } from "@/hooks/queries/useOperacoes";
import { PermBased } from "../../../hooks/usePermBased";
import { SIT_VALUES, type SitOption } from "../schemas/operacaoSchema";
import { BarraPresenca } from "./BarraPresenca";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { ListaModal, ModalTools, FiltroGrupo } from "./ListaModal";
import { FUNC_STYLE, SIT_LABEL, SIT_STYLE } from "./operacaoUi";
import { agruparPessoal, type MilitarAgrupado } from "./pessoalAgrupado";
import { PessoalFormModal } from "./PessoalFormModal";
import { Segmented } from "./Segmented";
import type {
   OperacaoDetail,
   OperacaoPessoalOut,
   FuncPessoal,
} from "services/routes/ops/operacoes";

interface Props {
   show: boolean;
   onClose: () => void;
   op: OperacaoDetail;
}

/** Espelha as sete colunas da tabela real — mesma contagem de linhas do vazio. */
function EfetivoSkeleton() {
   return (
      <div className="divide-y divide-slate-100 motion-safe:animate-pulse">
         {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
               <div className="h-3.5 w-40 rounded bg-slate-200" />
               <div className="h-5 w-20 rounded bg-slate-100" />
               <div className="h-5 w-14 rounded bg-slate-100" />
               <div className="h-3.5 flex-1 rounded bg-slate-100" />
               <div className="h-3.5 w-8 rounded bg-slate-200" />
               <div className="ml-auto h-4 w-12 rounded bg-slate-100" />
            </div>
         ))}
      </div>
   );
}

export function EfetivoModal({ show, onClose, op }: Props) {
   const { data: pessoal, isLoading, isError, refetch } = usePessoal(op.id);
   const removeMutation = useRemovePessoal(op.id);
   const { push } = useToast();

   const [busca, setBusca] = useState("");
   const [sitFilter, setSitFilter] = useState<SitOption | null>(null);
   const [funcFilter, setFuncFilter] = useState<FuncPessoal | null>(null);
   const [showForm, setShowForm] = useState(false);
   const [editing, setEditing] = useState<OperacaoPessoalOut | null>(null);
   const [removingId, setRemovingId] = useState<number | null>(null);
   const [confirmTarget, setConfirmTarget] =
      useState<OperacaoPessoalOut | null>(null);

   const lista = pessoal ?? [];
   const militares = useMemo(() => agruparPessoal(lista), [lista]);

   const sitCounts = { d: 0, g: 0, c: 0 } as Record<SitOption, number>;
   for (const p of lista) sitCounts[p.sit] += 1;

   // Funções presentes nos dados, não uma allowlist fixa: se "Manutenção" não
   // aparecer nesta operação, o filtro não oferece uma opção vazia.
   const funcCounts = new Map<FuncPessoal, number>();
   for (const p of lista)
      funcCounts.set(p.func, (funcCounts.get(p.func) ?? 0) + 1);
   const funcoesPresentes = Array.from(funcCounts.keys());

   const termo = busca.trim().toLowerCase();

   // Um militar aparece se QUALQUER período dele casar com busca e filtros —
   // o agrupamento existe para o segundo período (ver pessoalAgrupado.ts), e o
   // recorte tem que respeitar essa granularidade por período.
   const visiveis = militares.filter((m) =>
      m.periodos.some((p) => {
         const casaBusca =
            !termo ||
            p.user.p_g.toLowerCase().includes(termo) ||
            p.user.nome_guerra.toLowerCase().includes(termo);
         const casaSit = !sitFilter || p.sit === sitFilter;
         const casaFunc = !funcFilter || p.func === funcFilter;
         return casaBusca && casaSit && casaFunc;
      })
   );

   const diasVisiveis = visiveis.reduce((acc, m) => acc + m.diasTotal, 0);

   function limparFiltros() {
      setBusca("");
      setSitFilter(null);
      setFuncFilter(null);
   }

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
      <>
         <ListaModal
            show={show}
            onClose={onClose}
            titulo="Militares envolvidos"
            contexto={op.nome}
            ferramentas={
               <ModalTools>
                  <div className="flex w-full items-center gap-2">
                     <TextInput
                        icon={IoMdSearch}
                        sizing="sm"
                        placeholder="buscar militar…"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="max-w-xs"
                     />
                     <PermBased
                        resource="ops.operacoes.militar"
                        requiredPerm="create"
                     >
                        <Button
                           color="primary"
                           size="xs"
                           className="ml-auto"
                           onClick={openCreate}
                        >
                           <HiPlus className="mr-1 h-4 w-4" /> Associar militar
                        </Button>
                     </PermBased>
                  </div>

                  <FiltroGrupo label="Situação">
                     <Segmented<SitOption | null>
                        size="xs"
                        ariaLabel="Filtrar por situação"
                        value={sitFilter}
                        onChange={setSitFilter}
                        options={[
                           { value: null, label: "Todas", count: lista.length },
                           ...SIT_VALUES.map((s) => ({
                              value: s,
                              label: SIT_LABEL[s],
                              count: sitCounts[s],
                           })),
                        ]}
                     />
                  </FiltroGrupo>

                  <FiltroGrupo label="Função">
                     <Segmented<FuncPessoal | null>
                        size="xs"
                        ariaLabel="Filtrar por função"
                        value={funcFilter}
                        onChange={setFuncFilter}
                        options={[
                           { value: null, label: "Todas", count: lista.length },
                           ...funcoesPresentes.map((f) => ({
                              value: f,
                              label: f,
                              count: funcCounts.get(f) ?? 0,
                           })),
                        ]}
                     />
                  </FiltroGrupo>
               </ModalTools>
            }
            rodape={
               <>
                  <span>
                     Mostrando <strong>{visiveis.length}</strong> de{" "}
                     <strong>{militares.length}</strong> militares
                  </span>
                  <span>
                     Σ <strong>{diasVisiveis}</strong> dias-militar
                  </span>
               </>
            }
         >
            {isError ? (
               <div role="alert" className="space-y-3 p-6 text-center">
                  <p className="text-sm text-red-700">
                     Não foi possível carregar o efetivo.
                  </p>
                  <Button
                     color="light"
                     size="sm"
                     className="mx-auto"
                     onClick={() => refetch()}
                  >
                     Tentar novamente
                  </Button>
               </div>
            ) : isLoading ? (
               <EfetivoSkeleton />
            ) : militares.length === 0 ? (
               <div className="space-y-3 px-4 py-12 text-center">
                  <p className="text-sm text-slate-600">
                     Nenhum militar registrado nesta operação.
                  </p>
                  <PermBased
                     resource="ops.operacoes.militar"
                     requiredPerm="create"
                  >
                     <Button
                        color="primary"
                        size="sm"
                        className="mx-auto"
                        onClick={openCreate}
                     >
                        <HiPlus className="mr-1 h-4 w-4" /> Associar militar
                     </Button>
                  </PermBased>
               </div>
            ) : visiveis.length === 0 ? (
               <div className="space-y-3 px-4 py-12 text-center">
                  <p className="text-sm text-slate-600">
                     Nenhum militar neste recorte.
                  </p>
                  <Button
                     color="light"
                     size="sm"
                     className="mx-auto"
                     onClick={limparFiltros}
                  >
                     Limpar filtros
                  </Button>
               </div>
            ) : (
               <>
                  {/* --------------------------- mobile --------------------------- */}
                  <ul className="divide-y divide-slate-100 md:hidden">
                     {visiveis.map((m) => (
                        <EfetivoItemMobile
                           key={m.userId}
                           militar={m}
                           op={op}
                           onEdit={openEdit}
                           onRemove={setConfirmTarget}
                        />
                     ))}
                  </ul>

                  {/* --------------------------- desktop --------------------------- */}
                  <div className="hidden md:block">
                     <Table>
                        <TableHead className="sticky top-0 z-10">
                           <TableRow>
                              <TableHeadCell className="whitespace-nowrap">
                                 Militar
                              </TableHeadCell>
                              <TableHeadCell className="whitespace-nowrap">
                                 Função
                              </TableHeadCell>
                              <TableHeadCell className="whitespace-nowrap">
                                 Sit
                              </TableHeadCell>
                              <TableHeadCell className="w-[28%] whitespace-nowrap">
                                 Presença no período
                              </TableHeadCell>
                              <TableHeadCell className="text-right whitespace-nowrap">
                                 Dias
                              </TableHeadCell>
                              <TableHeadCell className="w-16 whitespace-nowrap">
                                 <span className="sr-only">Ações</span>
                              </TableHeadCell>
                           </TableRow>
                        </TableHead>
                        <TableBody className="divide-y">
                           {visiveis.map((m) => (
                              <EfetivoRow
                                 key={m.userId}
                                 militar={m}
                                 op={op}
                                 onEdit={openEdit}
                                 onRemove={setConfirmTarget}
                              />
                           ))}
                        </TableBody>
                     </Table>
                  </div>
               </>
            )}
         </ListaModal>

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
      </>
   );
}

/** Uma linha por militar — cada período empilha seu próprio badge e ações. */
function EfetivoRow({
   militar,
   op,
   onEdit,
   onRemove,
}: {
   militar: MilitarAgrupado;
   op: OperacaoDetail;
   onEdit: (p: OperacaoPessoalOut) => void;
   onRemove: (p: OperacaoPessoalOut) => void;
}) {
   const { user, periodos, diasTotal } = militar;
   const multiplo = periodos.length > 1;

   return (
      <TableRow className="bg-white align-top">
         <TableCell className="max-w-0">
            <span
               title={`${user.p_g} ${user.nome_guerra}`}
               className="block truncate font-semibold text-slate-800 uppercase"
            >
               {user.p_g} {user.nome_guerra}
            </span>
         </TableCell>
         <TableCell>
            <div className="flex flex-col gap-1">
               {periodos.map((p) => (
                  <span
                     key={p.id}
                     className={`inline-flex w-fit justify-center rounded px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${FUNC_STYLE[p.func].badge}`}
                  >
                     {p.func}
                  </span>
               ))}
            </div>
         </TableCell>
         <TableCell>
            <div className="flex flex-col gap-1">
               {periodos.map((p) => (
                  <span
                     key={p.id}
                     className={`inline-flex w-fit justify-center rounded px-2 py-0.5 text-xs font-semibold uppercase ring-1 ring-inset ${SIT_STYLE[p.sit].badge}`}
                  >
                     {p.sit}
                  </span>
               ))}
            </div>
         </TableCell>
         <TableCell>
            <BarraPresenca
               periodos={periodos}
               opInicio={op.data_inicio}
               opFim={op.data_fim}
            />
         </TableCell>
         <TableCell className="text-right font-mono font-bold text-slate-800 tabular-nums">
            {diasTotal}
            {multiplo && (
               <div className="text-[10px] font-normal text-slate-500">
                  {periodos.map((p) => p.dias).join(" + ")}
               </div>
            )}
         </TableCell>
         <TableCell>
            <div className="flex flex-col gap-1">
               {periodos.map((p) => (
                  <div
                     key={p.id}
                     className="flex items-center justify-end gap-2"
                  >
                     <PermBased
                        resource="ops.operacoes.militar"
                        requiredPerm="create"
                     >
                        <button
                           type="button"
                           onClick={() => onEdit(p)}
                           className="p-1 text-slate-600 pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]"
                           title="Editar"
                        >
                           <MdEdit className="h-4 w-4" />
                        </button>
                     </PermBased>
                     <PermBased
                        resource="ops.operacoes.militar"
                        requiredPerm="delete"
                     >
                        <button
                           type="button"
                           onClick={() => onRemove(p)}
                           className="p-1 text-red-700 pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]"
                           title="Remover"
                        >
                           <MdDelete className="h-4 w-4" />
                        </button>
                     </PermBased>
                  </div>
               ))}
            </div>
         </TableCell>
      </TableRow>
   );
}

/**
 * Um item por militar no mobile — mesma regra da linha de tabela: quem tem
 * dois períodos ganha um par de badges (com a janela de datas) e um bloco de
 * ações por período, não uma linha por vínculo.
 */
function EfetivoItemMobile({
   militar,
   op,
   onEdit,
   onRemove,
}: {
   militar: MilitarAgrupado;
   op: OperacaoDetail;
   onEdit: (p: OperacaoPessoalOut) => void;
   onRemove: (p: OperacaoPessoalOut) => void;
}) {
   const { user, periodos, diasTotal } = militar;
   const multiplo = periodos.length > 1;

   return (
      <li className="px-4 py-3">
         <div className="flex items-baseline justify-between gap-2">
            <span
               title={`${user.p_g} ${user.nome_guerra}`}
               className="min-w-0 truncate text-[13px] font-semibold text-slate-900 uppercase"
            >
               {user.p_g} {user.nome_guerra}
            </span>
            <span className="shrink-0 text-[13px] font-bold text-slate-900 tabular-nums">
               {diasTotal}d
            </span>
         </div>

         <div className="mt-1.5 flex flex-col gap-1.5">
            {periodos.map((p) => (
               <div
                  key={p.id}
                  className="flex items-center justify-between gap-2"
               >
                  <div className="flex min-w-0 flex-col gap-0.5">
                     {multiplo && (
                        <span className="text-[10px] text-slate-500">
                           {isoDateToShort(p.data_ingresso)}–
                           {isoDateToShort(p.data_regresso)}
                        </span>
                     )}
                     <div className="flex items-center gap-1.5">
                        <span
                           className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ring-1 ring-inset ${FUNC_STYLE[p.func].badge}`}
                        >
                           {p.func}
                        </span>
                        <span
                           className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ring-1 ring-inset ${SIT_STYLE[p.sit].badge}`}
                        >
                           {SIT_LABEL[p.sit]}
                        </span>
                     </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                     <PermBased
                        resource="ops.operacoes.militar"
                        requiredPerm="create"
                     >
                        <button
                           type="button"
                           onClick={() => onEdit(p)}
                           className="p-1 text-slate-600 pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]"
                           title="Editar"
                        >
                           <MdEdit className="h-4 w-4" />
                        </button>
                     </PermBased>
                     <PermBased
                        resource="ops.operacoes.militar"
                        requiredPerm="delete"
                     >
                        <button
                           type="button"
                           onClick={() => onRemove(p)}
                           className="p-1 text-red-700 pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]"
                           title="Remover"
                        >
                           <MdDelete className="h-4 w-4" />
                        </button>
                     </PermBased>
                  </div>
               </div>
            ))}
         </div>

         <div className="mt-1.5">
            <BarraPresenca
               periodos={periodos}
               opInicio={op.data_inicio}
               opFim={op.data_fim}
            />
         </div>
      </li>
   );
}
