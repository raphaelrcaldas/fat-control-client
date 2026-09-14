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
import { SortableHeadCell, useSortConfig } from "@/components/ui/SortableTable";
import { ChipFuncao, ChipSituacao } from "./Chip";
import { SIT_LABEL } from "./operacaoUi";
import {
   agruparPessoal,
   compararLinhas,
   diasFora,
   type LinhaPeriodo,
   type MilitarAgrupado,
   numerarPorMilitar,
   type SortKey,
} from "./pessoalAgrupado";
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

   // Antiguidade é a ordem natural de uma relação de militares — é como a
   // escala é lida e conferida, então é o padrão aqui.
   const { sortConfig, requestSort } = useSortConfig<SortKey>({
      key: "militar",
      direction: "asc",
   });
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

   // As funções vêm dos dados, não de uma allowlist fixa: se "Manutenção" não
   // aparecer nesta operação, o filtro não oferece uma opção vazia.
   const { sitCounts, funcCounts, funcoesPresentes } = useMemo(() => {
      const sit = { d: 0, g: 0, c: 0 } as Record<SitOption, number>;
      const func = new Map<FuncPessoal, number>();
      for (const p of lista) {
         sit[p.sit] += 1;
         func.set(p.func, (func.get(p.func) ?? 0) + 1);
      }
      return {
         sitCounts: sit,
         funcCounts: func,
         funcoesPresentes: Array.from(func.keys()),
      };
   }, [lista]);

   const termo = busca.trim().toLowerCase();

   /**
    * A lista é uma linha por período, mas cada linha precisa do contexto do
    * militar: a barra desenha TODOS os períodos dele (o vão entre duas faixas
    * é o que mostra que saiu e voltou), e a ordem agrupa os vínculos da mesma
    * pessoa em sequência, para o nome repetido ler como continuação.
    *
    * Filtrar por situação recorta períodos, não pessoas: filtrando "Comiss",
    * quem esteve comissionado só na segunda fase aparece uma vez — a linha
    * daquele período —, e não some por ter outro vínculo em diária.
    */
   const visiveis = useMemo(() => {
      const passaram: {
         periodo: OperacaoPessoalOut;
         militar: MilitarAgrupado;
      }[] = [];

      for (const m of militares) {
         for (const p of m.periodos) {
            const casaBusca =
               !termo ||
               p.user.p_g.toLowerCase().includes(termo) ||
               p.user.nome_guerra.toLowerCase().includes(termo);
            const casaSit = !sitFilter || p.sit === sitFilter;
            const casaFunc = !funcFilter || p.func === funcFilter;
            if (casaBusca && casaSit && casaFunc) {
               passaram.push({ periodo: p, militar: m });
            }
         }
      }

      // A numeração é do recorte, não do grupo — ver `numerarPorMilitar`.
      const linhas = numerarPorMilitar(passaram);

      // A ordenação vive no domínio: é ela que garante que os períodos de um
      // militar nunca se intercalem (ver `compararLinhas`).
      return linhas.sort((a, b) =>
         compararLinhas(a, b, sortConfig.key, sortConfig.direction)
      );
   }, [militares, termo, sitFilter, funcFilter, sortConfig]);

   // Dias do recorte somam os períodos visíveis, não o total de cada militar:
   // com um filtro ativo, somar `diasTotal` contaria dias que estão fora dele.
   const diasVisiveis = visiveis.reduce((acc, l) => acc + l.periodo.dias, 0);
   const militaresVisiveis = new Set(visiveis.map((l) => l.militar.userId))
      .size;

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
                        className="min-w-0 flex-1"
                     />
                     <PermBased
                        resource="ops.operacoes.militar"
                        requiredPerm="create"
                     >
                        <Button
                           color="primary"
                           size="xs"
                           className="shrink-0"
                           onClick={openCreate}
                        >
                           <HiPlus className="mr-1 h-4 w-4" /> Associar militar
                        </Button>
                     </PermBased>
                  </div>

                  {/* Os dois filtros dividem uma linha: são curtos (três e três
                      opções) e, empilhados, empurravam a lista para baixo com
                      duas faixas quase vazias. */}
                  <div className="flex w-full flex-wrap items-center gap-x-5 gap-y-2">
                     <FiltroGrupo label="Situação">
                        <Segmented<SitOption | null>
                           size="xs"
                           ariaLabel="Filtrar por situação"
                           value={sitFilter}
                           onChange={setSitFilter}
                           options={[
                              {
                                 value: null,
                                 label: "Todas",
                                 count: lista.length,
                              },
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
                              {
                                 value: null,
                                 label: "Todas",
                                 count: lista.length,
                              },
                              ...funcoesPresentes.map((f) => ({
                                 value: f,
                                 label: f,
                                 count: funcCounts.get(f) ?? 0,
                              })),
                           ]}
                        />
                     </FiltroGrupo>
                  </div>
               </ModalTools>
            }
            rodape={
               <>
                  <span>
                     Mostrando <strong>{militaresVisiveis}</strong> de{" "}
                     <strong>{militares.length}</strong> militares
                     {visiveis.length !== militaresVisiveis && (
                        <>
                           {" "}
                           em <strong>{visiveis.length}</strong> períodos
                        </>
                     )}
                  </span>
                  {/* Legenda dos códigos de situação: a coluna mostra a letra
                      (D/G/C) para caber, e sem isto só decifra quem já conhece
                      a nomenclatura herdada do cegep. */}
                  <span className="hidden text-slate-500 md:inline">
                     D Diária · G Grat Rep · C Comiss
                  </span>
                  <span>
                     Σ <strong>{diasVisiveis}</strong> dias-militar
                  </span>
               </>
            }
         >
            {/* Só este modal tem ramo de erro, e é proposital: é o único que
                busca os próprios dados (`usePessoal`) — os irmãos recebem a
                lista pronta por prop e falham junto com o dossiê. Não o
                remova para "harmonizar" os quatro. */}
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
               <div className="flex min-h-70 flex-col items-center justify-center gap-2 px-4 text-center">
                  <p className="text-sm font-semibold text-slate-600">
                     Nenhum militar registrado
                  </p>
                  <p className="text-xs text-slate-500">
                     Associe os militares que participaram para acompanhar o
                     efetivo e os períodos de cada um.
                  </p>
                  <PermBased
                     resource="ops.operacoes.militar"
                     requiredPerm="create"
                  >
                     <Button color="primary" size="xs" onClick={openCreate}>
                        <HiPlus className="mr-1 h-4 w-4" /> Associar militar
                     </Button>
                  </PermBased>
               </div>
            ) : visiveis.length === 0 ? (
               <div className="flex min-h-70 flex-col items-center justify-center gap-2 px-4 text-center">
                  <p className="text-sm font-semibold text-slate-600">
                     Nenhum militar neste recorte
                  </p>
                  <p className="text-xs text-slate-500">
                     {militares.length}{" "}
                     {militares.length === 1
                        ? "militar ficou fora"
                        : "militares ficaram fora"}{" "}
                     do recorte atual.
                  </p>
                  <Button color="light" size="xs" onClick={limparFiltros}>
                     Limpar filtros
                  </Button>
               </div>
            ) : (
               <>
                  {/* --------------------------- mobile --------------------------- */}
                  <ul className="divide-y divide-slate-100 md:hidden">
                     {visiveis.map((l) => (
                        <EfetivoItemMobile
                           key={l.periodo.id}
                           linha={l}
                           op={op}
                           removendo={removingId === l.periodo.id}
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
                              <SortableHeadCell
                                 label="Militar"
                                 sortKey="militar"
                                 sortConfig={sortConfig}
                                 onSort={requestSort}
                                 align="left"
                                 headerClass="w-[24%] whitespace-nowrap bg-slate-50 hover:bg-slate-100"
                              />
                              <SortableHeadCell
                                 label="Período"
                                 sortKey="periodo"
                                 sortConfig={sortConfig}
                                 onSort={requestSort}
                                 headerClass="w-px whitespace-nowrap bg-slate-50 hover:bg-slate-100"
                              />
                              <SortableHeadCell
                                 label="Função"
                                 sortKey="func"
                                 sortConfig={sortConfig}
                                 onSort={requestSort}
                                 headerClass="w-px whitespace-nowrap bg-slate-50 hover:bg-slate-100"
                              />
                              <SortableHeadCell
                                 label="Sit"
                                 sortKey="sit"
                                 sortConfig={sortConfig}
                                 onSort={requestSort}
                                 headerClass="w-px whitespace-nowrap bg-slate-50 hover:bg-slate-100"
                              />
                              {/* A barra não ordena: é desenho da mesma
                                  informação que "Período" já ordena. */}
                              <TableHeadCell className="whitespace-nowrap">
                                 Presença na operação
                              </TableHeadCell>
                              <SortableHeadCell
                                 label="Dias"
                                 sortKey="dias"
                                 sortConfig={sortConfig}
                                 onSort={requestSort}
                                 align="right"
                                 headerClass="w-px whitespace-nowrap bg-slate-50 hover:bg-slate-100"
                              />
                              <TableHeadCell className="w-px whitespace-nowrap">
                                 <span className="sr-only">Ações</span>
                              </TableHeadCell>
                           </TableRow>
                        </TableHead>
                        <TableBody className="divide-y">
                           {visiveis.map((l) => (
                              <EfetivoRow
                                 key={l.periodo.id}
                                 linha={l}
                                 op={op}
                                 removendo={removingId === l.periodo.id}
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

/**
 * Uma linha por período.
 *
 * Quando o militar tem mais de um, as linhas dele vêm em sequência e só a
 * primeira repete o nome e desenha a barra: a barra é da pessoa (mostra os dois
 * períodos e o vão entre eles), não do vínculo, e redesenhá-la idêntica na
 * linha seguinte sugeriria dois militares homônimos.
 */
function EfetivoRow({
   linha,
   op,
   removendo,
   onEdit,
   onRemove,
}: {
   linha: LinhaPeriodo;
   op: OperacaoDetail;
   /** Este período está sendo removido — o ícone vira spinner. */
   removendo: boolean;
   onEdit: (p: OperacaoPessoalOut) => void;
   onRemove: (p: OperacaoPessoalOut) => void;
}) {
   const { periodo: p, militar, ordem, total } = linha;
   const { user, periodos, diasTotal } = militar;
   const multiplo = total > 1;
   const primeira = ordem === 1;
   const vaos = multiplo ? diasFora(periodos) : [];
   const fora = vaos.reduce((a, b) => a + b, 0);

   return (
      <TableRow
         className={`bg-white ${
            // Períodos do mesmo militar formam um bloco: só a última linha dele
            // fecha com a divisória, para as duas lerem como uma coisa só.
            multiplo && ordem < total ? "[&>td]:border-b-0" : ""
         }`}
      >
         <TableCell className="max-w-0">
            {primeira ? (
               <span
                  title={`${user.p_g} ${user.nome_guerra}`}
                  className="block truncate font-semibold text-slate-800 uppercase"
               >
                  {user.p_g} {user.nome_guerra}
               </span>
            ) : (
               // A continuação não repete o nome, mas precisa dizer de quem é
               // para quem usa leitor de tela e não vê o alinhamento.
               <span className="sr-only">
                  {user.p_g} {user.nome_guerra}, período {ordem} de {total}
               </span>
            )}
            {multiplo && primeira && (
               <span className="mt-0.5 block text-[10px] font-medium text-amber-700">
                  {total} períodos
                  {fora > 0 && ` · ${fora} ${fora === 1 ? "dia" : "dias"} fora`}
               </span>
            )}
         </TableCell>

         <TableCell className="w-px font-mono text-xs whitespace-nowrap text-slate-600 tabular-nums">
            {isoDateToShort(p.data_ingresso)}
            <span aria-hidden className="mx-1 text-slate-400">
               →
            </span>
            {isoDateToShort(p.data_regresso)}
         </TableCell>

         {/* Sem largura própria a célula colapsa no conteúdo (`w-px`) e o
             `min-w` do chip não vence — os chips voltariam a ter tamanhos
             diferentes conforme o texto da função. */}
         <TableCell className="w-[7.5rem]">
            <ChipFuncao func={p.func} />
         </TableCell>

         <TableCell className="w-px text-center">
            <ChipSituacao sit={p.sit} abreviado />
         </TableCell>

         <TableCell>
            {primeira && (
               <BarraPresenca
                  periodos={periodos}
                  opInicio={op.data_inicio}
                  opFim={op.data_fim}
               />
            )}
         </TableCell>

         <TableCell className="w-px text-right font-mono font-bold whitespace-nowrap text-slate-800 tabular-nums">
            {p.dias}
            {multiplo && primeira && (
               <div className="text-[10px] font-normal text-slate-500">
                  {diasTotal} no total
               </div>
            )}
         </TableCell>

         <TableCell className="w-px">
            <div className="flex items-center justify-end gap-2">
               <PermBased
                  resource="ops.operacoes.militar"
                  requiredPerm="create"
               >
                  <button
                     type="button"
                     onClick={() => onEdit(p)}
                     className="p-1 text-slate-600 pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]"
                     title={`Editar período ${isoDateToShort(p.data_ingresso)}–${isoDateToShort(p.data_regresso)}`}
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
                     disabled={removendo}
                     className="p-1 text-red-700 pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]"
                     title={`Remover período ${isoDateToShort(p.data_ingresso)}–${isoDateToShort(p.data_regresso)}`}
                  >
                     {removendo ? (
                        <Spinner size="sm" color="primary" />
                     ) : (
                        <MdDelete className="h-4 w-4" />
                     )}
                  </button>
               </PermBased>
            </div>
         </TableCell>
      </TableRow>
   );
}

/**
 * Um item por período no mobile, espelhando a tabela.
 *
 * Só o primeiro período de um militar traz o nome e a barra; os seguintes
 * entram recuados, como continuação da mesma pessoa. No mobile a situação cabe
 * por extenso, então aqui não há o código de uma letra que o rodapé do desktop
 * precisa legendar.
 */
function EfetivoItemMobile({
   linha,
   op,
   removendo,
   onEdit,
   onRemove,
}: {
   linha: LinhaPeriodo;
   op: OperacaoDetail;
   /** Este período está sendo removido — o ícone vira spinner. */
   removendo: boolean;
   onEdit: (p: OperacaoPessoalOut) => void;
   onRemove: (p: OperacaoPessoalOut) => void;
}) {
   const { periodo: p, militar, ordem, total } = linha;
   const { user, periodos, diasTotal } = militar;
   const multiplo = total > 1;
   const primeira = ordem === 1;
   const fora = multiplo ? diasFora(periodos).reduce((a, b) => a + b, 0) : 0;

   return (
      <li
         className={`px-4 py-3 ${!primeira ? "border-l-2 border-l-slate-200 pl-5" : ""}`}
      >
         {primeira ? (
            <div className="flex items-baseline justify-between gap-2">
               <span
                  title={`${user.p_g} ${user.nome_guerra}`}
                  className="min-w-0 truncate text-[13px] font-semibold text-slate-900 uppercase"
               >
                  {user.p_g} {user.nome_guerra}
               </span>
               <span className="shrink-0 text-[13px] font-bold text-slate-900 tabular-nums">
                  {multiplo ? `${diasTotal}d` : `${p.dias}d`}
               </span>
            </div>
         ) : (
            <span className="sr-only">
               {user.p_g} {user.nome_guerra}, período {ordem} de {total}
            </span>
         )}

         {multiplo && primeira && (
            <p className="mt-0.5 text-[10px] font-medium text-amber-700">
               {total} períodos
               {fora > 0 && ` · ${fora} ${fora === 1 ? "dia" : "dias"} fora`}
            </p>
         )}

         <div className="mt-1.5 flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-col gap-0.5">
               <span className="font-mono text-[10px] text-slate-500 tabular-nums">
                  {isoDateToShort(p.data_ingresso)}–
                  {isoDateToShort(p.data_regresso)}
                  {multiplo && (
                     <span className="ml-1 font-sans font-medium text-slate-600">
                        {p.dias}d
                     </span>
                  )}
               </span>
               <div className="flex items-center gap-1.5">
                  <ChipFuncao func={p.func} />
                  <ChipSituacao sit={p.sit} />
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
                     title="Editar período"
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
                     disabled={removendo}
                     className="p-1 text-red-700 pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]"
                     title="Remover período"
                  >
                     {removendo ? (
                        <Spinner size="sm" color="primary" />
                     ) : (
                        <MdDelete className="h-4 w-4" />
                     )}
                  </button>
               </PermBased>
            </div>
         </div>

         {primeira && (
            <div className="mt-1.5">
               <BarraPresenca
                  periodos={periodos}
                  opInicio={op.data_inicio}
                  opFim={op.data_fim}
               />
            </div>
         )}
      </li>
   );
}
