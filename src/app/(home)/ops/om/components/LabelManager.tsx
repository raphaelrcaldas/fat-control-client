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
import { Etiqueta } from "../types";
import {
   createEtiqueta,
   updateEtiqueta,
   deleteEtiqueta,
} from "services/routes/om/etiquetas";

type LabelManagerProps = {
   isOpen: boolean;
   onClose: () => void;
   labels: Etiqueta[];
   onRefresh: () => void;
   onLabelDeleted?: (id: number) => void;
};

export function LabelManager({
   isOpen,
   onClose,
   labels,
   onRefresh,
   onLabelDeleted,
}: LabelManagerProps) {
   const [isLoading, setIsLoading] = useState(false);
   const [editingId, setEditingId] = useState<number | null>(null);
   const [formData, setFormData] = useState({
      nome: "",
      cor: "#ef4444",
      descricao: "",
   });

   const resetForm = () => {
      setFormData({ nome: "", cor: "#ef4444", descricao: "" });
      setEditingId(null);
   };

   const handleSave = async () => {
      if (!formData.nome || !formData.cor) return;

      setIsLoading(true);
      try {
         if (editingId) {
            await updateEtiqueta(editingId, formData);
         } else {
            await createEtiqueta(formData);
         }
         resetForm();
         onRefresh();
      } catch (error) {
         console.error("Erro ao salvar etiqueta:", error);
         alert("Erro ao salvar etiqueta");
      } finally {
         setIsLoading(false);
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

   const handleDelete = async (id: number) => {
      if (!confirm("Tem certeza que deseja excluir esta etiqueta?")) return;

      setIsLoading(true);
      try {
         await deleteEtiqueta(id);
         onLabelDeleted?.(id);
         onRefresh();
      } catch (error) {
         console.error("Erro ao excluir etiqueta:", error);
         alert("Erro ao excluir etiqueta");
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <Modal show={isOpen} onClose={onClose} size="md">
         <ModalHeader>Gerenciar Etiquetas</ModalHeader>
         <ModalBody>
            <div className="flex flex-col gap-6">
               {/* Form */}
               <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 shadow-inner">
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
                              setFormData({ ...formData, nome: e.target.value })
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
                                 className="h-10 w-full cursor-pointer rounded-lg border border-gray-300 p-0.5"
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
                                 <Spinner size="sm" />
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
                                 className="transition-hover flex items-center justify-between rounded-lg border border-gray-100 bg-white p-2.5 shadow-sm hover:border-red-100 hover:shadow-md"
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
                                    >
                                       <HiPencil className="h-4 w-4" />
                                    </button>
                                    <button
                                       onClick={() => handleDelete(label.id)}
                                       className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                       title="Excluir"
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
   );
}
