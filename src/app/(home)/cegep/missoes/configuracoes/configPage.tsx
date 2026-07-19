"use client";

import { useState } from "react";
import {
   Label,
   TextInput,
   Badge,
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Button,
} from "flowbite-react";
import {
   useEtiquetasMissoes,
   useCreateUpdateEtiqueta,
   useDeleteEtiqueta,
} from "@/hooks/queries/useEtiquetasMissoes";
import { Etiqueta, coresPredefinidas } from "services/routes/cegep/missoes";
import { useToast } from "@/app/context/toast";
import {
   HiX,
   HiTag,
   HiPencil,
   HiTrash,
   HiPlus,
   HiCheck,
   HiExclamation,
} from "react-icons/hi";
import { ConfiguracoesSkeleton } from "./ConfiguracoesSkeleton";

export function ConfigPage() {
   // React Query hooks
   const { data: etiquetas = [], isLoading: loading } = useEtiquetasMissoes();
   const createUpdateMutation = useCreateUpdateEtiqueta();
   const deleteMutation = useDeleteEtiqueta();
   const { push } = useToast();

   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isEditing, setIsEditing] = useState(false);
   const [formData, setFormData] = useState<Partial<Etiqueta>>({
      nome: "",
      cor: "#3B82F6",
      descricao: "",
   });

   const [etiquetaToDelete, setEtiquetaToDelete] = useState<Etiqueta | null>(
      null
   );

   // Combined saving state from mutations
   const saving = createUpdateMutation.isPending || deleteMutation.isPending;

   const openCreateModal = () => {
      setFormData({ nome: "", cor: "#3B82F6", descricao: "" });
      setIsEditing(false);
      setIsModalOpen(true);
   };

   const openEditModal = (etiqueta: Etiqueta) => {
      setFormData(etiqueta);
      setIsEditing(true);
      setIsModalOpen(true);
   };

   const handleSaveEtiqueta = () => {
      if (!formData.nome) return;

      const onError = (err: unknown) => {
         push({
            message:
               err instanceof Error ? err.message : "Erro ao salvar etiqueta",
            type: "error",
         });
      };

      if (isEditing && formData.id) {
         createUpdateMutation.mutate(formData as Etiqueta, {
            onSuccess: () => {
               setIsModalOpen(false);
            },
            onError,
         });
      } else {
         createUpdateMutation.mutate(
            {
               nome: formData.nome,
               cor: formData.cor || "#3B82F6",
               descricao: formData.descricao,
            },
            {
               onSuccess: () => {
                  setIsModalOpen(false);
               },
               onError,
            }
         );
      }
   };

   const handleConfirmDelete = () => {
      if (!etiquetaToDelete?.id) return;

      deleteMutation.mutate(etiquetaToDelete.id, {
         onSuccess: () => {
            setEtiquetaToDelete(null);
         },
         onError: (err) => {
            push({
               message:
                  err instanceof Error
                     ? err.message
                     : "Erro ao excluir etiqueta",
               type: "error",
            });
         },
      });
   };

   return (
      <div className="flex h-full flex-col gap-4">
         {/* Header */}
         <section className="shrink-0">
            <div className="flex items-center justify-between">
               <div>
                  <h5 className="text-xl font-semibold text-gray-800">
                     Configurações
                  </h5>
                  <p className="text-sm text-gray-500">
                     Gerencie etiquetas e outras configurações do módulo de
                     missões
                  </p>
               </div>
            </div>
         </section>

         {/* Seção de Etiquetas */}
         <section className="flex-1">
            {loading ? (
               <ConfiguracoesSkeleton />
            ) : (
               <div className="rounded border border-slate-200 bg-white p-4">
                  <div className="mb-4 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <HiTag className="text-primary-600 h-5 w-5" />
                        <h6 className="text-sm font-medium text-gray-700">
                           Gerenciador de Etiquetas
                        </h6>
                        <Badge color="primary" size="sm">
                           {etiquetas.length}
                        </Badge>
                     </div>
                     <Button
                        color="primary"
                        size="xs"
                        onClick={openCreateModal}
                     >
                        <HiPlus className="mr-1.5 h-3 w-3" />
                        Nova Etiqueta
                     </Button>
                  </div>

                  {/* Lista de Etiquetas */}
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                     {etiquetas.map((etiqueta, index) => (
                        <div
                           key={etiqueta.id ?? `etiqueta-${index}`}
                           className="flex items-center justify-between rounded border border-slate-200 bg-white p-2.5 transition-all hover:border-slate-200"
                        >
                           <div className="flex items-center gap-3">
                              <span
                                 className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white"
                                 style={{ backgroundColor: etiqueta.cor }}
                              >
                                 <HiTag className="h-3 w-3" />
                                 {etiqueta.nome}
                              </span>
                              {etiqueta.descricao && (
                                 <p
                                    className="max-w-37.5 truncate text-xs text-gray-500"
                                    title={etiqueta.descricao}
                                 >
                                    {etiqueta.descricao}
                                 </p>
                              )}
                           </div>
                           <div className="flex items-center gap-1">
                              <button
                                 onClick={() => openEditModal(etiqueta)}
                                 className="hover:bg-primary-100 hover:text-primary-700 flex items-center justify-center rounded p-1.5 text-gray-500 transition-colors pointer-coarse:size-11"
                                 title="Editar etiqueta"
                                 aria-label={`Editar etiqueta ${etiqueta.nome}`}
                              >
                                 <HiPencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                 onClick={() => setEtiquetaToDelete(etiqueta)}
                                 className="flex items-center justify-center rounded p-1.5 text-gray-500 transition-colors hover:bg-red-100 hover:text-red-600 pointer-coarse:size-11"
                                 disabled={saving}
                                 title="Excluir etiqueta"
                                 aria-label={`Excluir etiqueta ${etiqueta.nome}`}
                              >
                                 <HiTrash className="h-3.5 w-3.5" />
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>

                  {etiquetas.length === 0 && (
                     <div className="py-8 text-center">
                        <HiTag className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                        <p className="text-sm text-gray-500">
                           Nenhuma etiqueta criada
                        </p>
                        <button
                           onClick={openCreateModal}
                           className="text-primary-700 hover:text-primary-800 mt-2 text-sm font-medium"
                        >
                           Criar primeira etiqueta
                        </button>
                     </div>
                  )}
               </div>
            )}
         </section>

         {/* Modal de Confirmação de Exclusão */}
         <Modal
            show={!!etiquetaToDelete}
            onClose={() => setEtiquetaToDelete(null)}
            size="md"
         >
            <ModalHeader className="border-b border-red-200 bg-linear-to-r from-red-50 to-orange-50">
               <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-red-300 bg-red-100">
                     <HiExclamation className="text-xl text-red-600" />
                  </div>
                  <div>
                     <h3 className="text-lg font-bold text-red-900">
                        Excluir Etiqueta
                     </h3>
                     <p className="text-sm text-red-700">
                        Esta ação não pode ser desfeita
                     </p>
                  </div>
               </div>
            </ModalHeader>
            <ModalBody className="py-6">
               <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded bg-gray-50 p-3">
                     <div
                        className="h-4 w-4 shrink-0 rounded-full"
                        style={{ backgroundColor: etiquetaToDelete?.cor }}
                     />
                     <span className="font-medium text-gray-800">
                        {etiquetaToDelete?.nome}
                     </span>
                  </div>
                  <div className="rounded border border-amber-200 bg-amber-50 p-3">
                     <p className="text-sm text-amber-800">
                        <strong>Atenção:</strong> Esta etiqueta será removida de
                        todas as missões onde foi atribuída.
                     </p>
                  </div>
                  <p className="text-sm text-gray-600">
                     Tem certeza que deseja excluir esta etiqueta?
                  </p>
               </div>
            </ModalBody>
            <ModalFooter className="border-t border-slate-200 bg-gray-50">
               <div className="flex w-full justify-end gap-3">
                  <Button
                     color="gray"
                     onClick={() => setEtiquetaToDelete(null)}
                     disabled={saving}
                  >
                     Cancelar
                  </Button>
                  <Button
                     color="red"
                     onClick={handleConfirmDelete}
                     disabled={saving}
                  >
                     {saving ? "Excluindo..." : "Excluir Etiqueta"}
                  </Button>
               </div>
            </ModalFooter>
         </Modal>

         {/* Modal de Criação / Edição */}
         <Modal
            show={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            size="md"
         >
            <ModalHeader>
               {isEditing ? "Editar Etiqueta" : "Nova Etiqueta"}
            </ModalHeader>
            <ModalBody>
               <div className="space-y-4">
                  {/* Preview Area */}
                  <div className="flex flex-col items-center rounded border border-slate-200 bg-gray-50 py-4">
                     <span className="mb-2 text-xs font-medium text-gray-500">
                        PREVIEW
                     </span>
                     <span
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors"
                        style={{ backgroundColor: formData.cor || "#3B82F6" }}
                     >
                        <HiTag className="h-4 w-4" />
                        {formData.nome || "Nome da etiqueta"}
                     </span>
                  </div>

                  <div>
                     <Label
                        htmlFor="etiqueta-nome"
                        className="mb-1.5 flex text-sm font-medium text-gray-700"
                     >
                        Nome <span className="ml-1 text-red-500">*</span>
                     </Label>
                     <TextInput
                        id="etiqueta-nome"
                        type="text"
                        value={formData.nome || ""}
                        onChange={(e) =>
                           setFormData({ ...formData, nome: e.target.value })
                        }
                        placeholder="Ex: Urgente, Suprimento..."
                        autoFocus
                     />
                  </div>

                  <div>
                     <Label
                        htmlFor="etiqueta-descricao"
                        className="mb-1.5 flex text-sm font-medium text-gray-700"
                     >
                        Descrição
                     </Label>
                     <TextInput
                        id="etiqueta-descricao"
                        type="text"
                        value={formData.descricao || ""}
                        onChange={(e) =>
                           setFormData({
                              ...formData,
                              descricao: e.target.value,
                           })
                        }
                        placeholder="Em poucas palavras..."
                     />
                  </div>

                  <div>
                     <Label className="mb-1.5 flex text-sm font-medium text-gray-700">
                        Cor
                     </Label>
                     <div className="flex flex-wrap gap-2 rounded border border-slate-200 bg-gray-50 p-3">
                        {coresPredefinidas.map((cor) => {
                           const isSelected = formData.cor === cor;
                           return (
                              <button
                                 key={cor}
                                 onClick={() =>
                                    setFormData({ ...formData, cor })
                                 }
                                 className={`group relative flex h-8 w-8 items-center justify-center rounded-full transition-all ${isSelected ? "ring-primary-500 ring-2 ring-offset-2" : "hover:scale-110"}`}
                                 style={{ backgroundColor: cor }}
                                 title={cor}
                                 aria-label={`Selecionar cor ${cor}`}
                                 aria-pressed={isSelected}
                              >
                                 {isSelected && (
                                    <HiCheck className="h-5 w-5 text-white drop-shadow-sm" />
                                 )}
                              </button>
                           );
                        })}
                     </div>
                  </div>
               </div>
            </ModalBody>
            <ModalFooter className="flex justify-end gap-2 bg-gray-50">
               <Button
                  color="gray"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
               >
                  Cancelar
               </Button>
               <Button
                  color="primary"
                  onClick={handleSaveEtiqueta}
                  disabled={saving || !formData.nome}
               >
                  {saving
                     ? "Salvando..."
                     : isEditing
                       ? "Salvar"
                       : "Criar Etiqueta"}
               </Button>
            </ModalFooter>
         </Modal>
      </div>
   );
}
