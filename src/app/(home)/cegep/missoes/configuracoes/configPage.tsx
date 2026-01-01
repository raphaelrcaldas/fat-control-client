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
   useEtiquetas,
   coresPredefinidas,
   Etiqueta,
} from "../../context/etiquetasContext";
import {
   HiX,
   HiTag,
   HiPencil,
   HiTrash,
   HiPlus,
   HiCheck,
   HiExclamation,
} from "react-icons/hi";

export function ConfigPage() {
   const { etiquetas, loading, addEtiqueta, updateEtiqueta, deleteEtiqueta } =
      useEtiquetas();

   const [editingEtiqueta, setEditingEtiqueta] = useState<Etiqueta | null>(
      null
   );
   const [novaEtiqueta, setNovaEtiqueta] = useState<Partial<Etiqueta>>({
      nome: "",
      cor: "#3B82F6",
      descricao: "",
   });
   const [showNovaEtiquetaForm, setShowNovaEtiquetaForm] = useState(false);
   const [saving, setSaving] = useState(false);
   const [etiquetaToDelete, setEtiquetaToDelete] = useState<Etiqueta | null>(
      null
   );

   const handleAddEtiqueta = async () => {
      if (!novaEtiqueta.nome) return;
      setSaving(true);
      await addEtiqueta({
         nome: novaEtiqueta.nome,
         cor: novaEtiqueta.cor || "#3B82F6",
         descricao: novaEtiqueta.descricao,
      });
      setNovaEtiqueta({ nome: "", cor: "#3B82F6", descricao: "" });
      setShowNovaEtiquetaForm(false);
      setSaving(false);
   };

   const handleUpdateEtiqueta = async (updated: Etiqueta) => {
      // Encontrar etiqueta original para comparar
      const original = etiquetas.find((e) => e.id === updated.id);
      if (!original) return;

      // Verificar se houve mudanças
      const hasChanges =
         original.nome !== updated.nome ||
         original.cor !== updated.cor ||
         (original.descricao || "") !== (updated.descricao || "");

      if (!hasChanges) {
         setEditingEtiqueta(null);
         return;
      }

      setSaving(true);
      await updateEtiqueta(updated);
      setEditingEtiqueta(null);
      setSaving(false);
   };

   const handleConfirmDelete = async () => {
      if (!etiquetaToDelete?.id) return;
      setSaving(true);
      await deleteEtiqueta(etiquetaToDelete.id);
      setEtiquetaToDelete(null);
      setSaving(false);
   };

   return (
      <div className="flex h-full flex-col">
         {/* Header */}
         <section className="mb-4 shrink-0">
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
               <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600"></div>
               </div>
            ) : (
               <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="mb-4 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <HiTag className="h-5 w-5 text-purple-600" />
                        <h6 className="text-sm font-medium text-gray-700">
                           Gerenciador de Etiquetas
                        </h6>
                        <Badge color="purple" size="sm">
                           {etiquetas.length}
                        </Badge>
                     </div>
                     <button
                        onClick={() =>
                           setShowNovaEtiquetaForm(!showNovaEtiquetaForm)
                        }
                        className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-purple-700"
                     >
                        <HiPlus className="h-3 w-3" />
                        Nova Etiqueta
                     </button>
                  </div>

                  {/* Formulário Nova Etiqueta */}
                  {showNovaEtiquetaForm && (
                     <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                           <div>
                              <Label className="mb-1.5 text-xs text-gray-600">
                                 Nome
                              </Label>
                              <TextInput
                                 type="text"
                                 value={novaEtiqueta.nome || ""}
                                 onChange={(e) =>
                                    setNovaEtiqueta({
                                       ...novaEtiqueta,
                                       nome: e.target.value,
                                    })
                                 }
                                 placeholder="Nome da etiqueta"
                                 sizing="sm"
                              />
                           </div>
                           <div>
                              <Label className="mb-1.5 text-xs text-gray-600">
                                 Descrição
                              </Label>
                              <TextInput
                                 type="text"
                                 value={novaEtiqueta.descricao || ""}
                                 onChange={(e) =>
                                    setNovaEtiqueta({
                                       ...novaEtiqueta,
                                       descricao: e.target.value,
                                    })
                                 }
                                 placeholder="Descrição opcional"
                                 sizing="sm"
                              />
                           </div>
                           <div>
                              <Label className="mb-1.5 text-xs text-gray-600">
                                 Cor
                              </Label>
                              <div className="flex flex-wrap gap-1.5">
                                 {coresPredefinidas.map((cor) => (
                                    <button
                                       key={cor}
                                       onClick={() =>
                                          setNovaEtiqueta({
                                             ...novaEtiqueta,
                                             cor,
                                          })
                                       }
                                       className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${novaEtiqueta.cor === cor ? "scale-110 border-gray-800" : "border-transparent"}`}
                                       style={{ backgroundColor: cor }}
                                    />
                                 ))}
                              </div>
                           </div>
                           <div className="flex items-end gap-2">
                              <button
                                 onClick={handleAddEtiqueta}
                                 className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-green-700"
                              >
                                 <HiCheck className="h-3 w-3" />
                                 Criar
                              </button>
                              <button
                                 onClick={() => {
                                    setShowNovaEtiquetaForm(false);
                                    setNovaEtiqueta({
                                       nome: "",
                                       cor: "#3B82F6",
                                       descricao: "",
                                    });
                                 }}
                                 className="flex items-center gap-1.5 rounded-lg bg-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-300"
                              >
                                 <HiX className="h-3 w-3" />
                                 Cancelar
                              </button>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Lista de Etiquetas */}
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                     {etiquetas.map((etiqueta) => (
                        <div
                           key={etiqueta.id}
                           className={`flex items-center justify-between rounded-lg border p-2.5 transition-all ${editingEtiqueta?.id === etiqueta.id ? "border-purple-400 bg-purple-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
                        >
                           {editingEtiqueta?.id === etiqueta.id ? (
                              <div className="flex flex-1 flex-col gap-3">
                                 <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-gray-600">
                                       Nome
                                    </label>
                                    <div className="flex items-center gap-2">
                                       <input
                                          type="text"
                                          value={editingEtiqueta.nome}
                                          onChange={(e) =>
                                             setEditingEtiqueta({
                                                ...editingEtiqueta,
                                                nome: e.target.value,
                                             })
                                          }
                                          className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
                                          placeholder="Nome"
                                       />
                                       <button
                                          onClick={() =>
                                             handleUpdateEtiqueta(
                                                editingEtiqueta
                                             )
                                          }
                                          className="rounded p-1.5 text-green-600 hover:bg-green-100"
                                          disabled={saving}
                                          title="Salvar"
                                       >
                                          <HiCheck className="h-4 w-4" />
                                       </button>
                                       <button
                                          onClick={() =>
                                             setEditingEtiqueta(null)
                                          }
                                          className="rounded p-1.5 text-gray-500 hover:bg-gray-100"
                                          title="Cancelar"
                                       >
                                          <HiX className="h-4 w-4" />
                                       </button>
                                    </div>
                                 </div>
                                 <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-gray-600">
                                       Cor
                                    </label>
                                    <div className="flex gap-1">
                                       {coresPredefinidas
                                          .slice(0, 10)
                                          .map((cor) => (
                                             <button
                                                key={cor}
                                                onClick={() =>
                                                   setEditingEtiqueta({
                                                      ...editingEtiqueta,
                                                      cor,
                                                   })
                                                }
                                                className={`h-5 w-5 rounded-full border-2 transition-all ${editingEtiqueta.cor === cor ? "scale-110 border-gray-800" : "border-transparent hover:border-gray-400"}`}
                                                style={{ backgroundColor: cor }}
                                             />
                                          ))}
                                    </div>
                                 </div>
                                 <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-gray-600">
                                       Descrição (opcional)
                                    </label>
                                    <input
                                       type="text"
                                       value={editingEtiqueta.descricao || ""}
                                       onChange={(e) =>
                                          setEditingEtiqueta({
                                             ...editingEtiqueta,
                                             descricao: e.target.value,
                                          })
                                       }
                                       className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                                       placeholder="Descrição da etiqueta"
                                    />
                                 </div>
                              </div>
                           ) : (
                              <>
                                 <div className="flex items-center gap-2">
                                    <div
                                       className="h-3 w-3 shrink-0 rounded-full"
                                       style={{ backgroundColor: etiqueta.cor }}
                                    />
                                    <div>
                                       <span className="text-sm font-medium text-gray-800">
                                          {etiqueta.nome}
                                       </span>
                                       {etiqueta.descricao && (
                                          <p className="max-w-[150px] truncate text-xs text-gray-500">
                                             {etiqueta.descricao}
                                          </p>
                                       )}
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-1">
                                    <button
                                       onClick={() =>
                                          setEditingEtiqueta(etiqueta)
                                       }
                                       className="rounded p-1.5 text-gray-500 transition-colors hover:bg-purple-100 hover:text-purple-600"
                                    >
                                       <HiPencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                       onClick={() =>
                                          setEtiquetaToDelete(etiqueta)
                                       }
                                       className="rounded p-1.5 text-gray-500 transition-colors hover:bg-red-100 hover:text-red-600"
                                       disabled={saving}
                                    >
                                       <HiTrash className="h-3.5 w-3.5" />
                                    </button>
                                 </div>
                              </>
                           )}
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
                           onClick={() => setShowNovaEtiquetaForm(true)}
                           className="mt-2 text-sm text-purple-600 hover:text-purple-700"
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
            <ModalHeader className="border-b border-red-200 bg-lienar-to-r from-red-50 to-orange-50">
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
                  <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                     <div
                        className="h-4 w-4 shrink-0 rounded-full"
                        style={{ backgroundColor: etiquetaToDelete?.cor }}
                     />
                     <span className="font-medium text-gray-800">
                        {etiquetaToDelete?.nome}
                     </span>
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
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
            <ModalFooter className="border-t border-gray-200 bg-gray-50">
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
      </div>
   );
}
