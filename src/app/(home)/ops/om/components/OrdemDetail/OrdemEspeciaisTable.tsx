"use client";

import { memo, useState, useRef, useCallback } from "react";
import { Modal, ModalHeader, ModalBody, Button } from "flowbite-react";
import { HiPencil, HiTrash, HiPlus, HiExclamationCircle } from "react-icons/hi";
import clsx from "clsx";
import type { CampoEspecial } from "services/routes/om/ordens";

interface OrdemEspeciaisDisplayProps {
   campos: CampoEspecial[];
   isEditable: boolean;
   onAddCampo: () => void;
   onEditCampo: (index: number) => void;
   onRemoveCampo: (index: number) => void;
   onReorder: (campos: CampoEspecial[]) => void;
}

// Ícone de grip (arrastar) — 6 pontos em grade 2x3
function GripIcon({ className }: { className?: string }) {
   return (
      <svg
         className={className}
         viewBox="0 0 10 16"
         fill="currentColor"
         aria-hidden="true"
      >
         <circle cx="3" cy="2" r="1.5" />
         <circle cx="7" cy="2" r="1.5" />
         <circle cx="3" cy="8" r="1.5" />
         <circle cx="7" cy="8" r="1.5" />
         <circle cx="3" cy="14" r="1.5" />
         <circle cx="7" cy="14" r="1.5" />
      </svg>
   );
}

export const OrdemEspeciaisDisplay = memo(function OrdemEspeciaisDisplay({
   campos,
   isEditable,
   onAddCampo,
   onEditCampo,
   onRemoveCampo,
   onReorder,
}: OrdemEspeciaisDisplayProps) {
   const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(
      null
   );

   // Drag and drop state
   const dragIndexRef = useRef<number | null>(null);
   const [dragIndex, setDragIndex] = useState<number | null>(null);
   const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

   const handleDragStart = useCallback(
      (e: React.DragEvent<HTMLDivElement>, index: number) => {
         dragIndexRef.current = index;
         setDragIndex(index);
         e.dataTransfer.effectAllowed = "move";
         e.dataTransfer.setData("text/plain", String(index));
      },
      []
   );

   const handleDragOver = useCallback(
      (e: React.DragEvent<HTMLDivElement>, index: number) => {
         e.preventDefault();
         e.dataTransfer.dropEffect = "move";
         setDragOverIndex(index);
      },
      []
   );

   const handleDragLeave = useCallback(() => {
      setDragOverIndex(null);
   }, []);

   const handleDrop = useCallback(
      (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
         e.preventDefault();
         const fromIndex = dragIndexRef.current;
         if (fromIndex === null || fromIndex === dropIndex) {
            setDragIndex(null);
            setDragOverIndex(null);
            dragIndexRef.current = null;
            return;
         }

         const reordered = [...campos];
         const [moved] = reordered.splice(fromIndex, 1);
         reordered.splice(dropIndex, 0, moved);
         onReorder(reordered);

         setDragIndex(null);
         setDragOverIndex(null);
         dragIndexRef.current = null;
      },
      [campos, onReorder]
   );

   const handleDragEnd = useCallback(() => {
      setDragIndex(null);
      setDragOverIndex(null);
      dragIndexRef.current = null;
   }, []);

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
                  {campos.map((campo, index) => {
                     const isDragging = dragIndex === index;
                     const isDragOver =
                        dragOverIndex === index && dragIndex !== index;

                     return (
                        <div
                           key={index}
                           className={clsx(
                              "group relative border bg-white px-4 py-2.5 shadow-xs transition-all",
                              isDragging
                                 ? "opacity-40"
                                 : isDragOver
                                   ? "border-purple-400"
                                   : "border-gray-200"
                           )}
                           draggable={isEditable}
                           onDragStart={(e) =>
                              isEditable
                                 ? handleDragStart(e, index)
                                 : e.preventDefault()
                           }
                           onDragOver={(e) =>
                              isEditable ? handleDragOver(e, index) : undefined
                           }
                           onDragLeave={
                              isEditable ? handleDragLeave : undefined
                           }
                           onDrop={(e) =>
                              isEditable ? handleDrop(e, index) : undefined
                           }
                           onDragEnd={isEditable ? handleDragEnd : undefined}
                        >
                           {/* Indicador de drop */}
                           {isDragOver && (
                              <div className="absolute -top-1.5 right-0 left-0 z-20 h-0.5 rounded-full bg-purple-500" />
                           )}

                           <div className="flex items-start gap-3">
                              {/* Grip handle */}
                              {isEditable && (
                                 <div
                                    className="flex shrink-0 cursor-grab items-center pt-0.5 text-gray-400 transition-colors hover:text-gray-600 active:cursor-grabbing"
                                    title="Arrastar para reordenar"
                                 >
                                    <GripIcon className="h-4 w-4" />
                                 </div>
                              )}

                              <div className="min-w-0 flex-1">
                                 <label className="mb-1 block text-xs font-semibold tracking-wide text-purple-600 uppercase">
                                    {campo.label || ""}
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
                     );
                  })}
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
