"use client";

import { useEffect, useRef, useState } from "react";
import {
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Button,
   TextInput,
   Label,
   Spinner,
} from "flowbite-react";
import { HiPlus, HiTrash, HiPencil, HiCheck } from "react-icons/hi";
import clsx from "clsx";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import type { Etiqueta } from "services/routes/om/ordens";
import {
   useCreateEtiqueta,
   useUpdateEtiqueta,
   useDeleteEtiquetaOrdem,
} from "@/hooks/queries";
import { useToast } from "@/app/context/toast";
import { usePermBased } from "@/app/(home)/hooks/usePermBased";
import { EtiquetaChip } from "./EtiquetaChip";

type LabelManagerProps = {
   isOpen: boolean;
   onClose: () => void;
   labels: Etiqueta[];
   /** Estado da consulta do catálogo: sem ele, "0 etiquetas" é mentira. */
   labelsLoading?: boolean;
   labelsError?: boolean;
   onRetry?: () => void;
   onLabelDeleted?: (id: number) => void;
};

const COR_PADRAO = "#ef4444";
const FORM_VAZIO = { nome: "", cor: COR_PADRAO, descricao: "" };

// Mesmo recurso do backend (`routers/ops/om_etiquetas.py`): quem edita a OM
// administra as etiquetas dela, cada ação com a sua permissão
const RECURSO = "ops.ordem_missao";

export function LabelManager({
   isOpen,
   onClose,
   labels,
   labelsLoading = false,
   labelsError = false,
   onRetry,
   onLabelDeleted,
}: LabelManagerProps) {
   const { push: pushToast } = useToast();
   const { hasPerm } = usePermBased();
   const podeCriar = hasPerm(RECURSO, "create");
   const podeEditar = hasPerm(RECURSO, "update");
   const podeExcluir = hasPerm(RECURSO, "delete");

   const [editingId, setEditingId] = useState<number | null>(null);
   const [deleting, setDeleting] = useState<Etiqueta | null>(null);
   const [formData, setFormData] = useState(FORM_VAZIO);
   const formRef = useRef<HTMLFormElement>(null);
   const nomeRef = useRef<HTMLInputElement>(null);

   // Mutations TanStack: invalidam a lista de etiquetas automaticamente
   const createMutation = useCreateEtiqueta();
   const updateMutation = useUpdateEtiqueta();
   const deleteMutation = useDeleteEtiquetaOrdem();

   const isSaving = createMutation.isPending || updateMutation.isPending;
   const isLoading = isSaving || deleteMutation.isPending;

   const editing = labels.find((l) => l.id === editingId) ?? null;
   const nome = formData.nome.trim();
   // O backend não recusa nome repetido; duas etiquetas iguais seriam
   // indistinguíveis no filtro e no documento
   const nomeDuplicado = labels.some(
      (l) =>
         l.id !== editingId &&
         l.nome.trim().toLowerCase() === nome.toLowerCase()
   );
   const podeSalvar = !!nome && !nomeDuplicado && !isLoading;
   const mostraForm = editing ? podeEditar : podeCriar;

   const resetForm = () => {
      setFormData(FORM_VAZIO);
      setEditingId(null);
   };

   const handleClose = () => {
      resetForm();
      onClose();
   };

   const handleSave = async () => {
      if (!podeSalvar) return;
      const data = {
         nome,
         cor: formData.cor,
         // Opcional em branco viaja como null, nunca ""
         descricao: formData.descricao.trim() || null,
      };

      try {
         if (editingId) {
            await updateMutation.mutateAsync({ id: editingId, data });
         } else {
            await createMutation.mutateAsync(data);
         }
         pushToast({
            type: "success",
            title: "Sucesso",
            message: editingId ? "Etiqueta atualizada" : "Etiqueta criada",
         });
         resetForm();
      } catch (error) {
         console.error("Erro ao salvar etiqueta:", error);
         pushToast({
            type: "error",
            title: "Erro",
            message:
               error instanceof Error
                  ? error.message
                  : "Erro ao salvar etiqueta. Tente novamente.",
         });
      }
   };

   const handleEdit = (label: Etiqueta) => {
      setEditingId(label.id);
      setFormData({
         nome: label.nome,
         cor: label.cor,
         descricao: label.descricao || "",
      });
   };

   // O formulário fica no topo e a etiqueta pode estar no fim da lista:
   // sem trazê-lo para a tela, a pessoa não percebe que entrou em edição.
   // Em efeito, e não no `handleEdit`: sem permissão de criar, o <form> só
   // monta depois do `setEditingId`, e ali os refs ainda seriam null
   useEffect(() => {
      if (editingId === null) return;
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      nomeRef.current?.focus({ preventScroll: true });
   }, [editingId]);

   const handleConfirmDelete = async () => {
      if (!deleting) return;
      const id = deleting.id;

      try {
         await deleteMutation.mutateAsync(id);
         onLabelDeleted?.(id);
         // Etiqueta excluída era a que estava em edição: o form ficaria
         // editando um id que não existe mais e salvar daria erro
         if (id === editingId) resetForm();
         pushToast({
            type: "success",
            title: "Sucesso",
            message: "Etiqueta excluída",
         });
      } catch (error) {
         console.error("Erro ao excluir etiqueta:", error);
         pushToast({
            type: "error",
            title: "Erro",
            message: "Erro ao excluir etiqueta. Tente novamente.",
         });
      } finally {
         setDeleting(null);
      }
   };

   return (
      <>
         <Modal
            show={isOpen}
            onClose={handleClose}
            size="lg"
            dismissible={!isLoading}
         >
            <ModalHeader>Gerenciar etiquetas</ModalHeader>
            {/* Uma rolagem só — a do próprio ModalBody. A lista tinha altura
                travada e rolagem própria, mostrando 4 etiquetas por vez */}
            <ModalBody>
               <div className="space-y-4">
                  {mostraForm && (
                     <form
                        ref={formRef}
                        className="space-y-3 rounded border border-slate-200 bg-slate-50 p-4"
                        onSubmit={(e) => {
                           e.preventDefault();
                           handleSave();
                        }}
                     >
                        <div className="flex items-center justify-between gap-3">
                           <h3 className="min-w-0 truncate text-sm font-semibold text-slate-700">
                              {editing
                                 ? `Editando: ${editing.nome}`
                                 : "Nova etiqueta"}
                           </h3>
                           {/* Prévia fiel: o mesmo chip das telas */}
                           <EtiquetaChip
                              etiqueta={{
                                 nome: nome || "Prévia",
                                 cor: formData.cor,
                              }}
                              className="shrink-0"
                           />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                           <div>
                              <Label htmlFor="etiqueta-nome">Nome</Label>
                              <TextInput
                                 id="etiqueta-nome"
                                 ref={nomeRef}
                                 placeholder="LOCAL, NACIONAL, REVO…"
                                 value={formData.nome}
                                 maxLength={100}
                                 color={nomeDuplicado ? "failure" : "gray"}
                                 onChange={(e) =>
                                    setFormData({
                                       ...formData,
                                       nome: e.target.value.toUpperCase(),
                                    })
                                 }
                              />
                              {nomeDuplicado && (
                                 <p className="mt-1 text-sm text-red-600">
                                    Já existe uma etiqueta com esse nome.
                                 </p>
                              )}
                           </div>
                           <div>
                              <Label htmlFor="etiqueta-cor">Cor</Label>
                              {/* Cor livre, como antes (decisão do usuário):
                                  o nome sai sempre escuro no chip, então a
                                  cor não compromete a leitura. Caixa com o
                                  mesmo p-2.5 + borda do TextInput ao lado,
                                  para as duas alturas baterem; o seletor
                                  tem 24px (régua de alvo) e o -my devolve a
                                  sobra ao padding, sem engordar a caixa */}
                              <label className="focus-within:ring-primary-500 flex cursor-pointer items-center gap-2 rounded border border-gray-300 bg-white p-2.5 focus-within:ring-1">
                                 <input
                                    type="color"
                                    id="etiqueta-cor"
                                    value={formData.cor}
                                    onChange={(e) =>
                                       setFormData({
                                          ...formData,
                                          cor: e.target.value,
                                       })
                                    }
                                    className="-my-[3.25px] size-[24px] cursor-pointer rounded border-0 bg-transparent p-0"
                                 />
                                 <span className="font-mono text-xs text-slate-600 uppercase">
                                    {formData.cor}
                                 </span>
                              </label>
                           </div>
                        </div>

                        <div>
                           <Label htmlFor="etiqueta-descricao">
                              Descrição{" "}
                              <span className="font-normal text-slate-500">
                                 (opcional)
                              </span>
                           </Label>
                           <TextInput
                              id="etiqueta-descricao"
                              placeholder="Aparece ao passar o mouse na etiqueta"
                              value={formData.descricao}
                              maxLength={255}
                              onChange={(e) =>
                                 setFormData({
                                    ...formData,
                                    descricao: e.target.value,
                                 })
                              }
                           />
                        </div>

                        <div className="flex justify-end gap-2">
                           {editing && (
                              <Button
                                 color="light"
                                 size="sm"
                                 onClick={resetForm}
                                 disabled={isSaving}
                              >
                                 Cancelar edição
                              </Button>
                           )}
                           <Button
                              type="submit"
                              color="primary"
                              size="sm"
                              disabled={!podeSalvar}
                              aria-busy={isSaving}
                           >
                              {isSaving ? (
                                 <Spinner
                                    size="sm"
                                    color="white"
                                    className="mr-2"
                                 />
                              ) : editing ? (
                                 <HiCheck className="mr-1.5 h-4 w-4" />
                              ) : (
                                 <HiPlus className="mr-1.5 h-4 w-4" />
                              )}
                              {isSaving
                                 ? "Salvando…"
                                 : editing
                                   ? "Salvar"
                                   : "Adicionar"}
                           </Button>
                        </div>
                     </form>
                  )}

                  <div className="space-y-2">
                     <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                        {labelsLoading || (labelsError && labels.length === 0)
                           ? "Etiquetas"
                           : `${labels.length} ${
                                labels.length === 1 ? "etiqueta" : "etiquetas"
                             }`}
                     </h3>
                     {labelsLoading ? (
                        <div role="status">
                           <span className="sr-only">
                              Carregando etiquetas…
                           </span>
                           <ul
                              aria-hidden
                              className="animate-pulse divide-y divide-slate-200 rounded border border-slate-200 bg-white"
                           >
                              {[0, 1, 2].map((i) => (
                                 <li
                                    key={i}
                                    className="flex items-center gap-3 px-3 py-2"
                                 >
                                    <div className="size-3 shrink-0 rounded-full bg-slate-200" />
                                    <div className="h-[36px] flex-1 space-y-1.5 py-0.5">
                                       <div className="h-3.5 w-32 rounded bg-slate-200" />
                                       <div className="h-3 w-48 rounded bg-slate-100" />
                                    </div>
                                 </li>
                              ))}
                           </ul>
                        </div>
                     ) : labelsError && labels.length === 0 ? (
                        <div
                           role="alert"
                           className="flex flex-wrap items-center gap-3 py-4 text-sm text-red-700"
                        >
                           Não foi possível carregar as etiquetas.
                           {onRetry && (
                              <Button size="xs" color="light" onClick={onRetry}>
                                 Tentar novamente
                              </Button>
                           )}
                        </div>
                     ) : labels.length === 0 ? (
                        <p className="py-4 text-center text-sm text-slate-500">
                           Nenhuma etiqueta cadastrada.
                        </p>
                     ) : (
                        // Lista densa: linhas com divisória, não cartões
                        <ul className="divide-y divide-slate-200 rounded border border-slate-200 bg-white">
                           {labels.map((label) => {
                              const isEditing = label.id === editingId;
                              return (
                                 <li
                                    key={label.id}
                                    className={clsx(
                                       "flex items-center gap-3 px-3 py-2",
                                       isEditing && "bg-primary-50"
                                    )}
                                 >
                                    <span
                                       aria-hidden
                                       className="size-3 shrink-0 rounded-full"
                                       style={{ backgroundColor: label.cor }}
                                    />
                                    <div className="min-w-0 flex-1">
                                       <p className="truncate text-sm font-medium text-slate-800">
                                          {label.nome}
                                       </p>
                                       {label.descricao && (
                                          <p
                                             className="truncate text-xs text-slate-500"
                                             title={label.descricao}
                                          >
                                             {label.descricao}
                                          </p>
                                       )}
                                    </div>
                                    {podeEditar && (
                                       <button
                                          type="button"
                                          onClick={() => handleEdit(label)}
                                          disabled={isEditing}
                                          className="hover:text-primary-600 grid size-[28px] place-items-center rounded text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent"
                                          title="Editar"
                                          aria-label={`Editar etiqueta ${label.nome}`}
                                       >
                                          <HiPencil className="h-4 w-4" />
                                       </button>
                                    )}
                                    {podeExcluir && (
                                       <button
                                          type="button"
                                          onClick={() => setDeleting(label)}
                                          className="grid size-[28px] place-items-center rounded text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                                          title="Excluir"
                                          aria-label={`Excluir etiqueta ${label.nome}`}
                                       >
                                          <HiTrash className="h-4 w-4" />
                                       </button>
                                    )}
                                 </li>
                              );
                           })}
                        </ul>
                     )}
                  </div>
               </div>
            </ModalBody>
            <ModalFooter className="justify-end">
               <Button color="light" onClick={handleClose}>
                  Fechar
               </Button>
            </ModalFooter>
         </Modal>

         <ConfirmModal
            show={deleting !== null}
            onClose={() => setDeleting(null)}
            onConfirm={handleConfirmDelete}
            title="Excluir etiqueta"
            confirmButtonText="Sim, excluir"
            iconColor="text-red-400"
            isLoading={deleteMutation.isPending}
            description={
               <>
                  {deleting && (
                     <span className="mb-3 flex justify-center">
                        <EtiquetaChip etiqueta={deleting} />
                     </span>
                  )}
                  Ela será removida de todas as Ordens de Missão que a usam.
               </>
            }
         />
      </>
   );
}
