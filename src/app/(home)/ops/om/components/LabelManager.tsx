"use client";

import { useState } from "react";
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
import { HiPlus, HiTrash, HiPencil, HiCheck, HiX } from "react-icons/hi";
import { ConfirmModal } from "@/components/ConfirmModal";
import type { Etiqueta } from "services/routes/om/ordens";
import {
   useCreateEtiqueta,
   useUpdateEtiqueta,
   useDeleteEtiquetaOrdem,
} from "@/hooks/queries";
import { useToast } from "@/app/context/toast";

type LabelManagerProps = {
   isOpen: boolean;
   onClose: () => void;
   labels: Etiqueta[];
   onLabelDeleted?: (id: number) => void;
};

export function LabelManager({
   isOpen,
   onClose,
   labels,
   onLabelDeleted,
}: LabelManagerProps) {
   const { push: pushToast } = useToast();
   const [editingId, setEditingId] = useState<number | null>(null);
   const [deletingId, setDeletingId] = useState<number | null>(null);
   const [formData, setFormData] = useState({
      nome: "",
      cor: "#ef4444",
      descricao: "",
   });

   // Mutations TanStack: invalidam a lista de etiquetas automaticamente
   // (o antigo callback onRefresh ficou desnecessário)
   const createMutation = useCreateEtiqueta();
   const updateMutation = useUpdateEtiqueta();
   const deleteMutation = useDeleteEtiquetaOrdem();

   const isLoading =
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending;

   const resetForm = () => {
      setFormData({ nome: "", cor: "#ef4444", descricao: "" });
      setEditingId(null);
   };

   const handleSave = async () => {
      if (!formData.nome || !formData.cor) return;

      try {
         if (editingId) {
            await updateMutation.mutateAsync({
               id: editingId,
               data: formData,
            });
         } else {
            await createMutation.mutateAsync(formData);
         }
         resetForm();
         pushToast({
            type: "success",
            title: "Sucesso",
            message: editingId
               ? "Etiqueta atualizada com sucesso"
               : "Etiqueta criada com sucesso",
         });
      } catch (error) {
         console.error("Erro ao salvar etiqueta:", error);
         pushToast({
            type: "error",
            title: "Erro",
            message: "Erro ao salvar etiqueta. Tente novamente.",
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

   const handleDeleteClick = (id: number) => {
      setDeletingId(id);
   };

   const handleConfirmDelete = async () => {
      if (!deletingId) return;

      try {
         await deleteMutation.mutateAsync(deletingId);
         onLabelDeleted?.(deletingId);
         pushToast({
            type: "success",
            title: "Sucesso",
            message: "Etiqueta excluída com sucesso",
         });
      } catch (error) {
         console.error("Erro ao excluir etiqueta:", error);
         pushToast({
            type: "error",
            title: "Erro",
            message: "Erro ao excluir etiqueta. Tente novamente.",
         });
      } finally {
         setDeletingId(null);
      }
   };

   const handleCancelDelete = () => {
      setDeletingId(null);
   };

   return (
      <>
         <Modal show={isOpen} onClose={onClose} size="md">
            <ModalHeader>Gerenciar Etiquetas</ModalHeader>
            <ModalBody>
               <div className="flex flex-col gap-6">
                  {/* Form */}
                  <div className="rounded border border-gray-100 bg-gray-50 p-4 shadow-inner">
                     <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-700">
                           {editingId ? "Editar Etiqueta" : "Nova Etiqueta"}
                        </h3>
                        {/* Preview */}
                        <span
                           className="inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-bold tracking-tight uppercase shadow-sm transition-all"
                           style={{
                              backgroundColor: `${formData.cor}20`,
                              color: formData.cor,
                              borderColor: formData.cor,
                           }}
                        >
                           {formData.nome || "Preview"}
                        </span>
                     </div>
                     <div className="space-y-4">
                        <div>
                           <Label htmlFor="nome">Nome</Label>
                           <TextInput
                              id="nome"
                              placeholder="Ex: Local, Nacional, REVO..."
                              value={formData.nome}
                              onChange={(e) =>
                                 setFormData({
                                    ...formData,
                                    nome: e.target.value,
                                 })
                              }
                              required
                           />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <Label htmlFor="cor">Cor</Label>
                              <div className="flex items-center gap-2">
                                 <input
                                    type="color"
                                    id="cor"
                                    value={formData.cor}
                                    onChange={(e) =>
                                       setFormData({
                                          ...formData,
                                          cor: e.target.value,
                                       })
                                    }
                                    className="h-10 w-full cursor-pointer rounded border border-gray-300 p-0.5"
                                 />
                              </div>
                           </div>
                           <div className="flex min-w-0 items-end gap-2">
                              <Button
                                 onClick={handleSave}
                                 color={"light"}
                                 size="sm"
                                 className="grow"
                                 disabled={isLoading || !formData.nome}
                              >
                                 {isLoading ? (
                                    <Spinner size="sm" color="failure" />
                                 ) : editingId ? (
                                    <HiCheck className="h-4 w-4" />
                                 ) : (
                                    <HiPlus className="mr-1 h-4 w-4" />
                                 )}
                                 {editingId ? "Salvar" : "Adicionar"}
                              </Button>
                              {editingId && (
                                 <Button
                                    onClick={resetForm}
                                    color="gray"
                                    size="sm"
                                    disabled={isLoading}
                                 >
                                    <HiX className="h-4 w-4" />
                                 </Button>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* List */}
                  <div className="flex flex-col gap-2">
                     <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                        Etiquetas Existentes ({labels.length})
                     </h3>
                     <div className="max-h-60 overflow-y-auto pr-1">
                        {labels.length === 0 ? (
                           <p className="py-4 text-center text-sm text-gray-400 italic">
                              Nenhuma etiqueta cadastrada
                           </p>
                        ) : (
                           <div className="flex flex-col gap-2">
                              {labels.map((label) => (
                                 <div
                                    key={label.id}
                                    className="transition-hover flex items-center justify-between rounded border border-gray-100 bg-white p-2.5 shadow-sm hover:border-red-100 hover:shadow-md"
                                 >
                                    <div className="flex items-center gap-3">
                                       <div
                                          className="h-4 w-4 rounded-full border border-gray-200"
                                          style={{ backgroundColor: label.cor }}
                                       />
                                       <span className="text-sm font-medium text-gray-700">
                                          {label.nome}
                                       </span>
                                    </div>
                                    <div className="flex gap-1">
                                       <button
                                          onClick={() => handleEdit(label)}
                                          className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600"
                                          title="Editar"
                                          aria-label={`Editar etiqueta ${label.nome}`}
                                       >
                                          <HiPencil className="h-4 w-4" />
                                       </button>
                                       <button
                                          onClick={() =>
                                             handleDeleteClick(label.id)
                                          }
                                          className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                          title="Excluir"
                                          aria-label={`Excluir etiqueta ${label.nome}`}
                                       >
                                          <HiTrash className="h-4 w-4" />
                                       </button>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </ModalBody>
            <ModalFooter>
               <Button color="gray" onClick={onClose} className="w-full">
                  Fechar
               </Button>
            </ModalFooter>
         </Modal>

         {/* Modal de Confirmação de Exclusão */}
         <ConfirmModal
            show={deletingId !== null}
            onClose={handleCancelDelete}
            onConfirm={handleConfirmDelete}
            title="Excluir Etiqueta"
            confirmLabel="Sim, excluir"
            iconColor="text-red-400"
            isLoading={isLoading}
            message={
               <p className="text-sm text-gray-500">
                  Tem certeza que deseja excluir esta etiqueta? Ela será
                  removida de todas as Ordens de Missão que a utilizam.
               </p>
            }
         />
      </>
   );
}
