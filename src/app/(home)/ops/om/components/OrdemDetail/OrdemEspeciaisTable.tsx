"use client";

import { memo, useState, useRef, useCallback, useLayoutEffect } from "react";
import {
   HiPencil,
   HiTrash,
   HiPlus,
   HiChevronUp,
   HiChevronDown,
} from "react-icons/hi";
import clsx from "clsx";
import type { CampoEspecial } from "services/routes/om/ordens";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

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

   // Key estável por item: `CampoEspecial` não tem id e, com `key={index}`,
   // o React reaproveitava o nó do índice — o foco ficava no botão da
   // posição antiga, que já era de outro item. O reorder (splice) preserva
   // as referências, então o próprio objeto identifica o item; objeto novo
   // (criado ao editar) ganha id novo, o que é o comportamento certo
   const campoIdsRef = useRef(new WeakMap<CampoEspecial, string>());
   const nextCampoIdRef = useRef(0);
   const getCampoKey = (campo: CampoEspecial) => {
      let id = campoIdsRef.current.get(campo);
      if (id === undefined) {
         id = `campo-${nextCampoIdRef.current++}`;
         campoIdsRef.current.set(campo, id);
      }
      return id;
   };

   // Foco pendente após mover pelo teclado. Mesmo com key estável, o React
   // move o nó no DOM e o navegador tira o foco dele; e, ao chegar na borda,
   // o botão focado fica `disabled` e o foco cairia no `body`
   const listRef = useRef<HTMLDivElement>(null);
   const pendingFocusRef = useRef<{
      index: number;
      direction: -1 | 1;
   } | null>(null);

   // Layout effect: o foco é devolvido antes da pintura, sem piscar
   useLayoutEffect(() => {
      const pending = pendingFocusRef.current;
      if (!pending) return;
      pendingFocusRef.current = null;

      const findButton = (direction: -1 | 1) =>
         listRef.current?.querySelector<HTMLButtonElement>(
            `button[data-move-index="${pending.index}"][data-move-direction="${direction}"]`
         );
      const button = findButton(pending.direction);
      // Na borda, o botão da mesma direção está desabilitado: o foco vai
      // para o da direção oposta do mesmo item, que continua útil
      const target =
         button && !button.disabled
            ? button
            : findButton(pending.direction === 1 ? -1 : 1);
      target?.focus();
   }, [campos]);

   // Reordenação por teclado/toque: alternativa ao drag HTML5, que não
   // funciona no toque nem no teclado
   const handleMove = useCallback(
      (index: number, direction: -1 | 1) => {
         const targetIndex = index + direction;
         if (targetIndex < 0 || targetIndex >= campos.length) return;

         const reordered = [...campos];
         const [moved] = reordered.splice(index, 1);
         reordered.splice(targetIndex, 0, moved);
         pendingFocusRef.current = { index: targetIndex, direction };
         onReorder(reordered);
      },
      [campos, onReorder]
   );

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
                     className="group flex min-h-[24px] items-center gap-1.5 text-sm font-semibold text-purple-600 transition-colors hover:text-purple-700"
                  >
                     <HiPlus className="h-4 w-4 transition-transform group-hover:scale-110" />
                     Adicionar
                  </button>
               )}
            </div>

            {/* Lista de campos em cards */}
            {campos.length === 0 ? (
               <div className="rounded border border-gray-200 bg-gray-50 py-8 text-center">
                  <p className="text-sm text-gray-500">
                     Nenhuma ordem especial cadastrada
                  </p>
               </div>
            ) : (
               <div ref={listRef} className="space-y-3">
                  {campos.map((campo, index) => {
                     const isDragging = dragIndex === index;
                     const isDragOver =
                        dragOverIndex === index && dragIndex !== index;

                     return (
                        <div
                           key={getCampoKey(campo)}
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
                                 {/* Ações na linha do rótulo, e não numa coluna
                                     ao lado: com quatro botões a coluna
                                     espremia o valor em ~120px no celular */}
                                 <div className="mb-1 flex items-start justify-between gap-2">
                                    <span
                                       className="min-w-0 truncate pt-1 text-xs font-semibold tracking-wide text-purple-600 uppercase"
                                       title={campo.label || undefined}
                                    >
                                       {campo.label || ""}
                                    </span>
                                    {isEditable && (
                                       <div className="flex shrink-0 items-center gap-1 pointer-fine:opacity-0 pointer-fine:group-focus-within:opacity-100 pointer-fine:group-hover:opacity-100">
                                          <button
                                             type="button"
                                             onClick={() =>
                                                handleMove(index, -1)
                                             }
                                             disabled={index === 0}
                                             data-move-index={index}
                                             data-move-direction={-1}
                                             className="rounded p-1.5 text-gray-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                                             title="Mover para cima"
                                             aria-label="Mover ordem especial para cima"
                                          >
                                             <HiChevronUp className="h-4 w-4" />
                                          </button>
                                          <button
                                             type="button"
                                             onClick={() =>
                                                handleMove(index, 1)
                                             }
                                             disabled={
                                                index === campos.length - 1
                                             }
                                             data-move-index={index}
                                             data-move-direction={1}
                                             className="rounded p-1.5 text-gray-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                                             title="Mover para baixo"
                                             aria-label="Mover ordem especial para baixo"
                                          >
                                             <HiChevronDown className="h-4 w-4" />
                                          </button>
                                          <button
                                             type="button"
                                             onClick={() => onEditCampo(index)}
                                             className="rounded p-1.5 text-gray-400 transition-colors hover:bg-purple-50 hover:text-purple-600"
                                             title="Editar"
                                             aria-label={`Editar ordem especial ${index + 1}`}
                                          >
                                             <HiPencil className="h-4 w-4" />
                                          </button>
                                          <button
                                             type="button"
                                             onClick={() =>
                                                handleDeleteClick(index)
                                             }
                                             className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                                             title="Excluir"
                                             aria-label={`Excluir ordem especial ${index + 1}`}
                                          >
                                             <HiTrash className="h-4 w-4" />
                                          </button>
                                       </div>
                                    )}
                                 </div>
                                 <p className="text-sm whitespace-pre-wrap text-gray-700">
                                    {campo.valor || (
                                       <span className="text-gray-400 italic">
                                          Sem valor
                                       </span>
                                    )}
                                 </p>
                              </div>
                           </div>
                        </div>
                     );
                  })}
               </div>
            )}
         </div>

         {/* Modal de confirmação de exclusão */}
         <ConfirmModal
            show={deleteConfirmIndex !== null}
            onClose={handleCancelDelete}
            onConfirm={handleConfirmDelete}
            title="Excluir Ordem Especial"
            confirmButtonText="Sim, excluir"
            iconColor="text-red-400"
            description={
               <>
                  {/* Detalhes do campo */}
                  {deleteConfirmIndex !== null &&
                     campos[deleteConfirmIndex] && (
                        <div className="mb-4 rounded bg-gray-50 p-3 text-left">
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
                  <p className="text-sm text-gray-500">
                     Tem certeza que deseja excluir este campo?
                  </p>
               </>
            }
         />
      </>
   );
});
