"use client";

import { memo, useState } from "react";
import { Modal, ModalHeader, ModalBody, Button } from "flowbite-react";
import { HiPencil, HiTrash, HiPlus, HiExclamationCircle } from "react-icons/hi";
import type { CampoEspecial } from "services/routes/om/ordens";

interface OrdemEspeciaisDisplayProps {
   campos: CampoEspecial[];
   isEditable: boolean;
   onAddCampo: () => void;
   onEditCampo: (index: number) => void;
   onRemoveCampo: (index: number) => void;
}

export const OrdemEspeciaisDisplay = memo(function OrdemEspeciaisDisplay({
   campos,
   isEditable,
   onAddCampo,
   onEditCampo,
   onRemoveCampo,
}: OrdemEspeciaisDisplayProps) {
   const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(
      null
   );

   const handleDeleteClick = (index: number) => {
      setDeleteConfirmIndex(index);
   };

   const handleConfirmDelete = () => {
      if (deleteConfirmIndex !== null) {
         onRemoveCampo(deleteConfirmIndex);
         setDeleteConfirmIndex(null);
      }
   };

   const handleCancelDelete = () => {
      setDeleteConfirmIndex(null);
   };

   return (
      <>
         <div className="space-y-3">
            {/* Header com link adicionar */}
            <div className="flex items-center justify-between">
               <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700 uppercase">
                  <div className="h-4 w-1 rounded-full bg-purple-500"></div>
                  Ordens Especiais
                  <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                     {campos.length}
                  </span>
               </h3>
               {isEditable && (
                  <button
                     type="button"
                     onClick={onAddCampo}
                     className="group flex items-center gap-1.5 text-sm font-semibold text-purple-600 transition-all hover:text-purple-700"
                  >
                     <HiPlus className="h-4 w-4 transition-transform group-hover:scale-110" />
                     Adicionar
                  </button>
               )}
            </div>

            {/* Lista de campos em cards */}
            {campos.length === 0 ? (
               <div className="rounded-lg border border-gray-200 bg-gray-50 py-8 text-center">
                  <p className="text-sm text-gray-500">
                     Nenhuma ordem especial cadastrada
                  </p>
               </div>
            ) : (
               <div className="space-y-3">
                  {campos.map((campo, index) => (
                     <div
                        key={index}
                        className="group rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm"
                     >
                        <div className="flex items-start gap-3">
                           <div className="min-w-0 flex-1">
                              <label className="mb-1 block text-xs font-semibold tracking-wide text-purple-600 uppercase">
                                 {campo.label || "Sem nome"}
                              </label>
                              <p className="text-sm whitespace-pre-wrap text-gray-700">
                                 {campo.valor || (
                                    <span className="text-gray-400 italic">
                                       Sem valor
                                    </span>
                                 )}
                              </p>
                           </div>
                           {isEditable && (
                              <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                 <button
                                    type="button"
                                    onClick={() => onEditCampo(index)}
                                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-purple-50 hover:text-purple-600"
                                    title="Editar"
                                 >
                                    <HiPencil className="h-4 w-4" />
                                 </button>
                                 <button
                                    type="button"
                                    onClick={() => handleDeleteClick(index)}
                                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                                    title="Excluir"
                                 >
                                    <HiTrash className="h-4 w-4" />
                                 </button>
                              </div>
                           )}
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>

         {/* Modal de confirmação de exclusão */}
         <Modal
            show={deleteConfirmIndex !== null}
            size="md"
            onClose={handleCancelDelete}
            popup
         >
            <ModalHeader />
            <ModalBody>
               <div className="text-center">
                  <HiExclamationCircle className="mx-auto mb-4 h-14 w-14 text-red-400" />
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">
                     Excluir Ordem Especial
                  </h3>

                  {/* Detalhes do campo */}
                  {deleteConfirmIndex !== null &&
                     campos[deleteConfirmIndex] && (
                        <div className="mb-5 rounded-lg bg-gray-50 p-3 text-left">
                           <div className="text-sm">
                              <span className="font-semibold text-purple-700 uppercase">
                                 {campos[deleteConfirmIndex].label}
                              </span>
                              <p className="mt-1 line-clamp-2 text-gray-600">
                                 {campos[deleteConfirmIndex].valor}
                              </p>
                           </div>
                        </div>
                     )}

                  <p className="mb-5 text-sm text-gray-500">
                     Tem certeza que deseja excluir este campo?
                  </p>
                  <div className="flex justify-center gap-4">
                     <Button color="red" onClick={handleConfirmDelete}>
                        Sim, excluir
                     </Button>
                     <Button color="gray" onClick={handleCancelDelete}>
                        Cancelar
                     </Button>
                  </div>
               </div>
            </ModalBody>
         </Modal>
      </>
   );
});
