"use client";

import { useState } from "react";
import { Label, TextInput, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Button } from "flowbite-react";
import { useEtiquetas, coresPredefinidas, Etiqueta } from "../../context/etiquetasContext";
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
   const {
      etiquetas,
      loading,
      addEtiqueta,
      updateEtiqueta,
      deleteEtiqueta,
   } = useEtiquetas();

   const [editingEtiqueta, setEditingEtiqueta] = useState<Etiqueta | null>(null);
   const [novaEtiqueta, setNovaEtiqueta] = useState<Partial<Etiqueta>>({ nome: "", cor: "#3B82F6", descricao: "" });
   const [showNovaEtiquetaForm, setShowNovaEtiquetaForm] = useState(false);
   const [saving, setSaving] = useState(false);
   const [etiquetaToDelete, setEtiquetaToDelete] = useState<Etiqueta | null>(null);

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
      const original = etiquetas.find(e => e.id === updated.id);
      if (!original) return;
      
      // Verificar se houve mudanças
      const hasChanges = 
         original.nome !== updated.nome ||
         original.cor !== updated.cor ||
         (original.descricao || '') !== (updated.descricao || '');
      
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
      <div className='h-full flex flex-col'>
         {/* Header */}
         <section className='flex-shrink-0 mb-4'>
            <div className='flex items-center justify-between'>
               <div>
                  <h5 className='font-semibold text-xl text-gray-800'>Configurações</h5>
                  <p className='text-sm text-gray-500'>Gerencie etiquetas e outras configurações do módulo de missões</p>
               </div>
            </div>
         </section>

         {/* Seção de Etiquetas */}
         <section className='flex-1'>
            {loading ? (
               <div className='flex items-center justify-center py-12'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600'></div>
               </div>
            ) : (
            <div className='bg-white border border-gray-200 rounded-lg p-4'>
               <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center gap-2'>
                     <HiTag className='text-purple-600 w-5 h-5' />
                     <h6 className='text-sm font-medium text-gray-700'>
                        Gerenciador de Etiquetas
                     </h6>
                     <Badge color='purple' size='sm'>{etiquetas.length}</Badge>
                  </div>
                  <button
                     onClick={() => setShowNovaEtiquetaForm(!showNovaEtiquetaForm)}
                     className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors'
                  >
                     <HiPlus className='w-3 h-3' />
                     Nova Etiqueta
                  </button>
               </div>

               {/* Formulário Nova Etiqueta */}
               {showNovaEtiquetaForm && (
                  <div className='mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200'>
                     <div className='grid grid-cols-1 sm:grid-cols-4 gap-3'>
                        <div>
                           <Label className='mb-1.5 text-xs text-gray-600'>Nome</Label>
                           <TextInput
                              type='text'
                              value={novaEtiqueta.nome || ""}
                              onChange={(e) => setNovaEtiqueta({...novaEtiqueta, nome: e.target.value})}
                              placeholder='Nome da etiqueta'
                              sizing='sm'
                           />
                        </div>
                        <div>
                           <Label className='mb-1.5 text-xs text-gray-600'>Descrição</Label>
                           <TextInput
                              type='text'
                              value={novaEtiqueta.descricao || ""}
                              onChange={(e) => setNovaEtiqueta({...novaEtiqueta, descricao: e.target.value})}
                              placeholder='Descrição opcional'
                              sizing='sm'
                           />
                        </div>
                        <div>
                           <Label className='mb-1.5 text-xs text-gray-600'>Cor</Label>
                           <div className='flex flex-wrap gap-1.5'>
                              {coresPredefinidas.map(cor => (
                                 <button
                                    key={cor}
                                    onClick={() => setNovaEtiqueta({...novaEtiqueta, cor})}
                                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${novaEtiqueta.cor === cor ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: cor }}
                                 />
                              ))}
                           </div>
                        </div>
                        <div className='flex items-end gap-2'>
                           <button
                              onClick={handleAddEtiqueta}
                              className='flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors'
                           >
                              <HiCheck className='w-3 h-3' />
                              Criar
                           </button>
                           <button
                              onClick={() => {
                                 setShowNovaEtiquetaForm(false);
                                 setNovaEtiqueta({ nome: "", cor: "#3B82F6", descricao: "" });
                              }}
                              className='flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors'
                           >
                              <HiX className='w-3 h-3' />
                              Cancelar
                           </button>
                        </div>
                     </div>
                  </div>
               )}

               {/* Lista de Etiquetas */}
               <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2'>
                  {etiquetas.map(etiqueta => (
                     <div
                        key={etiqueta.id}
                        className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${editingEtiqueta?.id === etiqueta.id ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                     >
                        {editingEtiqueta?.id === etiqueta.id ? (
                           <div className='flex-1 flex flex-col gap-3'>
                              <div className='flex flex-col gap-1'>
                                 <label className='text-xs font-medium text-gray-600'>Nome</label>
                                 <div className='flex items-center gap-2'>
                                    <input
                                       type='text'
                                       value={editingEtiqueta.nome}
                                       onChange={(e) => setEditingEtiqueta({...editingEtiqueta, nome: e.target.value})}
                                       className='flex-1 px-2 py-1 text-sm border border-gray-300 rounded'
                                       placeholder='Nome'
                                    />
                                    <button
                                       onClick={() => handleUpdateEtiqueta(editingEtiqueta)}
                                       className='p-1.5 text-green-600 hover:bg-green-100 rounded'
                                       disabled={saving}
                                       title='Salvar'
                                    >
                                       <HiCheck className='w-4 h-4' />
                                    </button>
                                    <button
                                       onClick={() => setEditingEtiqueta(null)}
                                       className='p-1.5 text-gray-500 hover:bg-gray-100 rounded'
                                       title='Cancelar'
                                    >
                                       <HiX className='w-4 h-4' />
                                    </button>
                                 </div>
                              </div>
                              <div className='flex flex-col gap-1'>
                                 <label className='text-xs font-medium text-gray-600'>Cor</label>
                                 <div className='flex gap-1'>
                                    {coresPredefinidas.slice(0, 10).map(cor => (
                                       <button
                                          key={cor}
                                          onClick={() => setEditingEtiqueta({...editingEtiqueta, cor})}
                                          className={`w-5 h-5 rounded-full border-2 transition-all ${editingEtiqueta.cor === cor ? 'border-gray-800 scale-110' : 'border-transparent hover:border-gray-400'}`}
                                          style={{ backgroundColor: cor }}
                                       />
                                    ))}
                                 </div>
                              </div>
                              <div className='flex flex-col gap-1'>
                                 <label className='text-xs font-medium text-gray-600'>Descrição (opcional)</label>
                                 <input
                                    type='text'
                                    value={editingEtiqueta.descricao || ''}
                                    onChange={(e) => setEditingEtiqueta({...editingEtiqueta, descricao: e.target.value})}
                                    className='w-full px-2 py-1 text-sm border border-gray-300 rounded'
                                    placeholder='Descrição da etiqueta'
                                 />
                              </div>
                           </div>
                        ) : (
                           <>
                              <div className='flex items-center gap-2'>
                                 <div
                                    className='w-3 h-3 rounded-full flex-shrink-0'
                                    style={{ backgroundColor: etiqueta.cor }}
                                 />
                                 <div>
                                    <span className='text-sm font-medium text-gray-800'>{etiqueta.nome}</span>
                                    {etiqueta.descricao && (
                                       <p className='text-xs text-gray-500 truncate max-w-[150px]'>{etiqueta.descricao}</p>
                                    )}
                                 </div>
                              </div>
                              <div className='flex items-center gap-1'>
                                 <button
                                    onClick={() => setEditingEtiqueta(etiqueta)}
                                    className='p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-100 rounded transition-colors'
                                 >
                                    <HiPencil className='w-3.5 h-3.5' />
                                 </button>
                                 <button
                                     onClick={() => setEtiquetaToDelete(etiqueta)}
                                     className='p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded transition-colors'
                                     disabled={saving}
                                 >
                                    <HiTrash className='w-3.5 h-3.5' />
                                 </button>
                              </div>
                           </>
                        )}
                     </div>
                  ))}
               </div>

               {etiquetas.length === 0 && (
                  <div className='text-center py-8'>
                     <HiTag className='w-12 h-12 text-gray-300 mx-auto mb-3' />
                     <p className='text-sm text-gray-500'>Nenhuma etiqueta criada</p>
                     <button
                        onClick={() => setShowNovaEtiquetaForm(true)}
                        className='mt-2 text-sm text-purple-600 hover:text-purple-700'
                     >
                        Criar primeira etiqueta
                     </button>
                  </div>
                )}
             </div>
            )}
         </section>

         {/* Modal de Confirmação de Exclusão */}
         <Modal show={!!etiquetaToDelete} onClose={() => setEtiquetaToDelete(null)} size='md'>
            <ModalHeader className='border-b border-red-200 bg-gradient-to-r from-red-50 to-orange-50'>
               <div className='flex items-center gap-3'>
                  <div className='flex items-center justify-center w-10 h-10 rounded-full bg-red-100 border-2 border-red-300'>
                     <HiExclamation className='text-red-600 text-xl' />
                  </div>
                  <div>
                     <h3 className='text-lg font-bold text-red-900'>Excluir Etiqueta</h3>
                     <p className='text-sm text-red-700'>Esta ação não pode ser desfeita</p>
                  </div>
               </div>
            </ModalHeader>
            <ModalBody className='py-6'>
               <div className='space-y-4'>
                  <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                     <div
                        className='w-4 h-4 rounded-full flex-shrink-0'
                        style={{ backgroundColor: etiquetaToDelete?.cor }}
                     />
                     <span className='font-medium text-gray-800'>{etiquetaToDelete?.nome}</span>
                  </div>
                  <div className='p-3 bg-amber-50 border border-amber-200 rounded-lg'>
                     <p className='text-sm text-amber-800'>
                        <strong>Atenção:</strong> Esta etiqueta será removida de todas as missões onde foi atribuída.
                     </p>
                  </div>
                  <p className='text-sm text-gray-600'>
                     Tem certeza que deseja excluir esta etiqueta?
                  </p>
               </div>
            </ModalBody>
            <ModalFooter className='border-t border-gray-200 bg-gray-50'>
               <div className='flex gap-3 w-full justify-end'>
                  <Button
                     color='gray'
                     onClick={() => setEtiquetaToDelete(null)}
                     disabled={saving}
                  >
                     Cancelar
                  </Button>
                  <Button
                     color='red'
                     onClick={handleConfirmDelete}
                     disabled={saving}
                  >
                     {saving ? 'Excluindo...' : 'Excluir Etiqueta'}
                  </Button>
               </div>
            </ModalFooter>
         </Modal>
      </div>
   );
}
