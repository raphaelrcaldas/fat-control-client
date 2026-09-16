"use client";

import {
   Button,
   Checkbox,
   Modal,
   ModalBody,
   ModalFooter,
   ModalHeader,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
   Spinner,
} from "flowbite-react";
import clsx from "clsx";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useQuadsContext } from "@/app/(home)/context/quads";
import { CrewMember } from "services/routes/trips";
import { Quad } from "services/routes/quads";
import { QuadForm } from "./QuadForm";
import { quadDisplayValue } from "../utils/quadDisplay";
import { FaRegTrashCan } from "react-icons/fa6";
import { FaEdit, FaPlus } from "react-icons/fa";
import { HiOutlineUser } from "react-icons/hi";
import { TbSquareOff } from "react-icons/tb";
import { useToast } from "@/app/context/toast";
import { PermBased, usePermBased } from "@/app/(home)/hooks/usePermBased";
import { useQuadsByTrip, useDeleteQuad } from "@/hooks/queries";

interface QuadsTripProps {
   trip: CrewMember;
   totalQuads: number;
   groupName: string;
   typeName: string;
}

interface QuadRowProps {
   quad: Quad;
   trip: CrewMember;
   selected: boolean;
   comSelecao: boolean;
   onToggleSelect: (id: number) => void;
}

/* Borda forte de propósito: a espessura e o `gray-500` compensam o monitor
   em que este sistema é operado, onde um checkbox de borda fina some. Não
   suavizar. */
const QUAD_CHECKBOX_CLASS =
   "size-[24px] cursor-pointer rounded border-2 border-gray-500 text-primary-600 ring-offset-1 checked:border-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2";

/**
 * Área de clique do checkbox: a caixa cumpre os 24px do WCAG 2.2 sozinha, e o
 * `label` em volta estende o alvo até a altura da linha DE GRAÇA — nada na
 * tela muda de tamanho; o que muda é que tocar ao lado da caixa passa a
 * marcar.
 */
const ALVO_CHECKBOX = "flex cursor-pointer items-center justify-center";

/**
 * Célula estreita, conteúdo centrado e cabeçalho grudado no topo do rolamento.
 *
 * `text-center` sobrepõe o `text-left` que a Table do Flowbite traz na raiz.
 * Centrar só é estável porque as colunas têm largura FIXA (`w-24` a data,
 * `w-12` a ação): o centro de cada uma cai no mesmo x em todas as linhas, e a
 * coluna de datas continua sendo uma pilha de dígitos alinhados entre si.
 */
const CELULA = "px-3 text-center";
const CELULA_CABECALHO =
   "sticky top-0 z-10 bg-gray-50 px-3 py-2 text-center text-xs font-semibold text-gray-700";

export function QuadsTrip({
   trip,
   totalQuads,
   groupName,
   typeName,
}: QuadsTripProps) {
   const [openModal, setOpenModal] = useState(false);
   const [showForm, setShowForm] = useState(false);
   const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
   const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);
   const [batchDeleting, setBatchDeleting] = useState(false);
   const { quadType } = useQuadsContext();
   const { push } = useToast();
   const { hasPerm } = usePermBased();

   // A seleção existe para UMA coisa: apagar em lote. Sem a permissão de
   // apagar, a coluna de checkbox era um controle que não levava a lugar
   // nenhum — e ainda assim era a PRIMEIRA coluna de toda linha, empurrando
   // a data (o dado) para o meio da tabela.
   const comSelecao = hasPerm("ops.quadrinhos", "delete");

   // React Query hooks
   const {
      data: quads = [],
      isLoading: loading,
      isError,
      refetch,
   } = useQuadsByTrip(trip.id, quadType, openModal);

   const deleteQuadMutation = useDeleteQuad();

   const userName = useMemo(
      () => `${trip.user.posto.short} ${trip.user.nome_guerra}`,
      [trip.user.posto.short, trip.user.nome_guerra]
   );

   const handleToggleSelect = useCallback((id: number) => {
      setSelectedIds((prev) => {
         const next = new Set(prev);
         if (next.has(id)) {
            next.delete(id);
         } else {
            next.add(id);
         }
         return next;
      });
   }, []);

   const handleSelectAll = useCallback(() => {
      const allIds = quads
         .map((q) => q.id)
         .filter((id): id is number => id !== undefined);
      setSelectedIds(new Set(allIds));
   }, [quads]);

   const handleClearSelection = useCallback(() => {
      setSelectedIds(new Set());
   }, []);

   const selectAllRef = useRef<HTMLInputElement>(null);

   useEffect(() => {
      if (selectAllRef.current) {
         selectAllRef.current.indeterminate =
            selectedIds.size > 0 && selectedIds.size < quads.length;
      }
   }, [selectedIds.size, quads.length]);

   const handleBatchDelete = useCallback(async () => {
      setShowBatchDeleteConfirm(false);
      setBatchDeleting(true);
      try {
         const ids = Array.from(selectedIds);
         const result = await deleteQuadMutation.mutateAsync(ids);
         if (result.ok) {
            push({
               message:
                  result.message ||
                  `${ids.length} quadrinho(s) deletado(s) com sucesso!`,
               type: "success",
            });
            setSelectedIds(new Set());
         } else {
            push({
               message: result.message || "Erro ao deletar quadrinhos",
               type: "error",
            });
         }
      } catch (err) {
         console.error(err);
         push({
            message: (err as Error).message || "Erro ao deletar quadrinhos",
            type: "error",
         });
      } finally {
         setBatchDeleting(false);
      }
   }, [selectedIds, deleteQuadMutation, push]);

   const handleCloseModal = useCallback(() => {
      setOpenModal(false);
      setShowForm(false);
      setSelectedIds(new Set());
   }, []);

   // Ao fechar o form aninhado, devolver o foco ao botão que o abriu — sem
   // isso o Flowbite restaura o foco no trigger da página atrás do modal.
   const addQuadBtnRef = useRef<HTMLButtonElement>(null);
   const handleFormShow = useCallback((v: boolean) => {
      setShowForm(v);
      if (!v) {
         requestAnimationFrame(() => addQuadBtnRef.current?.focus());
      }
   }, []);

   const nSelecionados = selectedIds.size;
   const todosSelecionados = quads.length > 0 && nSelecionados === quads.length;

   return (
      <>
         {/* A contagem ficava num selo de 24px pendurado na quina
             (`absolute -top-2 -right-2`), com `border-2 border-white` cravada
             para se destacar do fundo. Três problemas num elemento só: um selo
             CHEIO da cor da marca anunciava *ausência* ("0") na maioria das
             linhas, competindo por atenção com os próprios quadrinhos; a borda
             branca era cor cravada; e ele transbordava o botão para dentro de
             um contêiner com `overflow-y-auto`, que o cortava na primeira
             linha da grade.

             Dentro do botão, o número deixa zero recuar (só o dígito, em tom
             apagado) e dá preenchimento a quem tem muitos — que é a leitura
             que importa: contar 22 quadrados na tela é impossível. */}
         <Button
            color="light"
            onClick={() => setOpenModal(true)}
            /* Largura DETERMINÍSTICA, e conteúdo ancorado nas duas pontas.
               Com `px-0` e conteúdo centralizado, o botão media 56px mas o
               conteúdo variava de 44,2px (um dígito) a 57px (três) — três
               dígitos espremiam, e o trigrama escorregava ~6px de uma linha
               para a outra, justo na coluna que o olho usa como régua ao
               descer a grade. Os 4,5rem comportam trigrama e contagem de três
               dígitos com folga; `justify-between` prende um em cada ponta,
               então "CLD 0" e "BRG 43" começam e terminam no mesmo x. */
            className="flex w-18 items-center justify-between gap-1 rounded px-1 text-sm font-medium uppercase transition-colors hover:bg-gray-100"
            size="sm"
            aria-label={`${trip.trig}: ${totalQuads} ${totalQuads === 1 ? "quadrinho" : "quadrinhos"} — ver lista de ${userName}`}
         >
            {/* `flex-1 text-center`: o trigrama se centra no espaço que sobra
                depois do chip, em vez de ficar colado na borda esquerda. Como
                o chip tem largura própria (piso de `min-w-4`), esse espaço é o
                mesmo em todas as linhas — e o trigrama cai no mesmo x de cima
                a baixo da grade. */}
            <span className="flex-1 text-center">{trip.trig}</span>
            <span
               aria-hidden
               className={clsx(
                  /* `shrink-0`: numa contagem de três dígitos — que na prática
                     não ocorre, o maior registro é 43 — quem cede espaço é o
                     trigrama, que tem `flex-1`. Sem isso o flex encolheria o
                     número e cortaria o dígito, que é o dado. */
                  "min-w-5 shrink-0 rounded px-1 py-0.5 text-center font-mono text-[11px] font-bold",
                  totalQuads > 0
                     ? "bg-slate-200 text-slate-800"
                     : "text-slate-500"
               )}
            >
               {totalQuads}
            </span>
         </Button>

         <Modal
            show={openModal}
            size="lg"
            onClose={handleCloseModal}
            popup
            dismissible
         >
            {/* Cabeçalho no formato do modal de indisponibilidades: quem, e
                logo abaixo o contexto em linha fina.

                Antes eram TRÊS blocos empilhados — um título genérico
                "Quadrinhos" com caixa de ícone (a página inteira já se chama
                Quadrinhos), um cartão rosa centralizado só com o nome e outro
                cartão só com grupo/tipo. Somados ao espaço reservado da barra
                de seleção, empurravam a primeira data para 246px abaixo da
                borda do modal: 40% da altura antes do primeiro dado. O nome do
                tripulante é o título — é ele que o leitor de tela deve
                anunciar.

                `as="div"` porque o conteúdo é um `h3` mais uma linha de
                contexto, e o Flowbite renderiza os filhos DENTRO do elemento
                de título (`h3` por padrão) — sem isso, `h3` dentro de `h3`. */}
            <ModalHeader
               as="div"
               className="border-b border-slate-200 px-4 pt-4 pb-3"
            >
               <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 uppercase">
                  <HiOutlineUser
                     aria-hidden
                     className="size-4 shrink-0 text-slate-400"
                  />
                  {userName}
               </h3>
               <p className="mt-0.5 text-xs text-gray-500 uppercase">
                  {groupName.toLowerCase().includes("internacional") && (
                     <span aria-hidden>🌍 </span>
                  )}
                  {groupName} ·{" "}
                  <strong className="font-semibold text-gray-700">
                     {typeName}
                  </strong>
               </p>
            </ModalHeader>

            <ModalBody className="p-4">
               {/* `max-h-[55vh]`, e não `h-96`: a altura era FIXA, então dois
                   quadrinhos reservavam os mesmos 336px que quinze — o resto
                   virava vazio dentro de uma moldura. Agora a caixa tem a
                   altura da lista e só para de crescer quando ia passar da
                   tela. */}
               <div className="max-h-[55vh] overflow-y-auto rounded border border-slate-200 bg-white shadow-sm">
                  {loading ? (
                     <LoadingState comSelecao={comSelecao} />
                  ) : isError ? (
                     <ErrorState onRetry={() => refetch()} />
                  ) : quads.length > 0 ? (
                     <Table>
                        <TableHead>
                           <TableRow>
                              {comSelecao && (
                                 <TableHeadCell className={CELULA_CABECALHO}>
                                    <label className={ALVO_CHECKBOX}>
                                       <Checkbox
                                          ref={selectAllRef}
                                          color="primary"
                                          checked={todosSelecionados}
                                          onChange={
                                             todosSelecionados
                                                ? handleClearSelection
                                                : handleSelectAll
                                          }
                                          aria-label={
                                             todosSelecionados
                                                ? "Desmarcar todos os quadrinhos"
                                                : "Selecionar todos os quadrinhos"
                                          }
                                          className={QUAD_CHECKBOX_CLASS}
                                       />
                                    </label>
                                 </TableHeadCell>
                              )}
                              <TableHeadCell
                                 className={clsx(CELULA_CABECALHO, "w-24")}
                              >
                                 Data
                              </TableHeadCell>
                              <TableHeadCell className={CELULA_CABECALHO}>
                                 Observações
                              </TableHeadCell>
                              <TableHeadCell
                                 className={clsx(CELULA_CABECALHO, "w-12")}
                              >
                                 <span className="sr-only">Ações</span>
                              </TableHeadCell>
                           </TableRow>
                        </TableHead>
                        <TableBody>
                           {quads.map((quad) => (
                              <QuadRow
                                 key={quad.id ?? quad.value}
                                 quad={quad}
                                 trip={trip}
                                 comSelecao={comSelecao}
                                 selected={
                                    quad.id !== undefined &&
                                    selectedIds.has(quad.id)
                                 }
                                 onToggleSelect={handleToggleSelect}
                              />
                           ))}
                        </TableBody>
                     </Table>
                  ) : (
                     <EmptyState />
                  )}
               </div>

               <QuadForm trip={trip} show={showForm} setShow={handleFormShow} />
            </ModalBody>

            {/* A contagem de selecionados morava num painel próprio acima da
                lista, com `invisible opacity-0` quando não havia seleção — ou
                seja, 40px de nada reservados o tempo todo, no modal que já
                estava alto demais. Ela cabe aqui: "Deletar (3)" já diz quantos
                são, e o "Limpar seleção" entra na mesma fileira, ao lado da
                seleção que desfaz. */}
            {/* `flex-wrap` + `shrink-0` nos filhos: a 360px os três controles
                somam mais que a largura do modal, e sem isso o flex encolhia
                cada botão até o rótulo quebrar em duas linhas dentro dele
                ("Adicionar / Quadrinho"). Melhor descer um botão de linha do
                que espremer os três. */}
            <ModalFooter className="flex-wrap justify-center gap-2 border-slate-200 p-4">
               {nSelecionados > 0 && (
                  <button
                     type="button"
                     onClick={handleClearSelection}
                     className="shrink-0 cursor-pointer rounded px-2 py-1 text-xs font-medium whitespace-nowrap text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  >
                     Limpar seleção
                  </button>
               )}
               <PermBased resource={"ops.quadrinhos"} requiredPerm={"delete"}>
                  {nSelecionados > 0 && (
                     <Button
                        color="gray"
                        size="sm"
                        disabled={batchDeleting}
                        onClick={() => setShowBatchDeleteConfirm(true)}
                        className="shrink-0 whitespace-nowrap"
                     >
                        {batchDeleting ? (
                           <Spinner
                              size="sm"
                              color="primary"
                              className="mr-2"
                           />
                        ) : (
                           <FaRegTrashCan className="mr-2 h-4 w-4" />
                        )}
                        Deletar ({nSelecionados})
                     </Button>
                  )}
               </PermBased>
               <PermBased resource={"ops.quadrinhos"} requiredPerm={"create"}>
                  <Button
                     ref={addQuadBtnRef}
                     color="primary"
                     size="sm"
                     onClick={() => setShowForm(true)}
                     className="shrink-0 whitespace-nowrap"
                  >
                     <FaPlus className="mr-2 h-4 w-4" />
                     Adicionar Quadrinho
                  </Button>
               </PermBased>
            </ModalFooter>
         </Modal>

         <ConfirmDeleteModal
            show={showBatchDeleteConfirm}
            onConfirm={handleBatchDelete}
            onCancel={() => setShowBatchDeleteConfirm(false)}
            count={nSelecionados}
         />
      </>
   );
}

function QuadRow({
   quad,
   trip,
   selected,
   comSelecao,
   onToggleSelect,
}: QuadRowProps) {
   const [showForm, setShowForm] = useState(false);

   const displayValue = quadDisplayValue(quad);
   const canEdit = Boolean(quad.value);

   // Mesmo motivo do handleFormShow: foco de volta ao botão que abriu o form.
   const editBtnRef = useRef<HTMLButtonElement>(null);
   const handleFormShow = useCallback((v: boolean) => {
      setShowForm(v);
      if (!v) {
         requestAnimationFrame(() => editBtnRef.current?.focus());
      }
   }, []);

   return (
      <>
         <TableRow className="transition-colors hover:bg-gray-50">
            {comSelecao && (
               <TableCell className={CELULA}>
                  <label className={ALVO_CHECKBOX}>
                     <Checkbox
                        checked={selected}
                        onChange={() =>
                           quad.id !== undefined && onToggleSelect(quad.id)
                        }
                        aria-label={`Selecionar quadrinho ${displayValue}`}
                        className={QUAD_CHECKBOX_CLASS}
                     />
                  </label>
               </TableCell>
            )}
            {/* Fonte tabular: numa coluna de largura fixa, dígito embaixo de
                dígito, o olho compara períodos sem reler. */}
            <TableCell
               className={clsx(
                  CELULA,
                  "font-mono font-semibold tracking-tight whitespace-nowrap text-gray-900 tabular-nums"
               )}
            >
               {quad.value ? (
                  displayValue
               ) : (
                  <span className="font-sans text-gray-500">LASTRO</span>
               )}
            </TableCell>
            {/* A observação é escrita no formulário desta mesma tela e nunca
                era mostrada de volta: quem anotava o motivo de um quadrinho
                só reencontrava a anotação abrindo o form de edição. */}
            <TableCell className={clsx(CELULA, "text-gray-700")}>
               {quad.description || (
                  <span className="text-gray-400">
                     <span aria-hidden>—</span>
                     <span className="sr-only">Sem observações</span>
                  </span>
               )}
            </TableCell>
            <TableCell className={CELULA}>
               <PermBased resource={"ops.quadrinhos"} requiredPerm={"update"}>
                  {canEdit && (
                     <button
                        ref={editBtnRef}
                        onClick={() => setShowForm(true)}
                        className="inline-flex cursor-pointer items-center justify-center rounded p-2 text-blue-500 transition-all duration-200 hover:bg-blue-500 hover:text-white active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100"
                        aria-label={`Editar quadrinho ${displayValue}`}
                     >
                        <FaEdit className="size-5" />
                     </button>
                  )}
               </PermBased>
            </TableCell>
         </TableRow>

         {canEdit && (
            <QuadForm
               show={showForm}
               setShow={handleFormShow}
               trip={trip}
               quad={quad}
            />
         )}
      </>
   );
}

/** Espelha a tabela real — mesmas colunas, mesma altura de linha. */
function LoadingState({ comSelecao }: { comSelecao: boolean }) {
   return (
      <div className="divide-y divide-slate-200">
         <div className="flex items-center gap-3 bg-gray-50 px-3 py-2">
            {comSelecao && (
               <div className="size-[24px] shrink-0 animate-pulse rounded bg-slate-200" />
            )}
            <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
         </div>

         {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2">
               {comSelecao && (
                  <div className="size-[24px] shrink-0 animate-pulse rounded bg-slate-200" />
               )}
               <div className="h-4 w-16 shrink-0 animate-pulse rounded bg-slate-200" />
               <div className="h-4 flex-1 animate-pulse rounded bg-slate-100" />
               <div className="size-8 shrink-0 animate-pulse rounded bg-slate-100" />
            </div>
         ))}
      </div>
   );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
   return (
      <div className="flex flex-col items-center justify-center gap-2 px-4 py-10">
         <p className="text-sm font-semibold text-gray-700">
            Erro ao carregar os quadrinhos
         </p>
         <p className="text-center text-sm text-gray-500">
            Não foi possível buscar os dados deste tripulante.
         </p>
         <Button color="light" size="sm" className="mt-1" onClick={onRetry}>
            Tentar novamente
         </Button>
      </div>
   );
}

/* Vazio em uma linha, e não um círculo de 80px com ícone dentro mais título
   mais parágrafo: a caixa existe para mostrar uma lista, e "não há lista" não
   merece mais espaço do que a lista teria. */
function EmptyState() {
   return (
      <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-gray-500">
         <TbSquareOff aria-hidden className="size-5 shrink-0" />
         Nenhum quadrinho registrado
      </div>
   );
}

function ConfirmDeleteModal({
   show,
   onConfirm,
   onCancel,
   count,
}: {
   show: boolean;
   onConfirm: () => void;
   onCancel: () => void;
   count?: number;
}) {
   const isBatch = count !== undefined && count > 1;
   const message = isBatch
      ? `Tem certeza que deseja deletar ${count} quadrinhos selecionados?`
      : "Tem certeza que deseja deletar este quadrinho?";

   return (
      <Modal show={show} size="sm" onClose={onCancel} popup>
         <ModalHeader />
         <ModalBody>
            <div className="text-center">
               <FaRegTrashCan className="mx-auto mb-4 h-14 w-14 text-red-500" />
               <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                  {message}
               </h3>
               <div className="flex justify-center gap-4">
                  <Button color="red" onClick={onConfirm}>
                     Sim, deletar
                  </Button>
                  <Button color="gray" onClick={onCancel}>
                     Cancelar
                  </Button>
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}
