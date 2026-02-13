"use client";

import { memo, useState, useEffect, useRef, useCallback } from "react";
import clsx from "clsx";
import type { CampoEspecial } from "services/routes/om/ordens";

interface OrdemEspeciaisProps {
   campos: CampoEspecial[];
   isEditable: boolean;
   onUpdate: (campos: CampoEspecial[]) => void;
}

// Componente para formulário de novo campo
interface NovoCampoFormProps {
   value: CampoEspecial;
   onChange: (campo: CampoEspecial) => void;
   onConfirm: () => void;
   onCancel: () => void;
   isValid: boolean;
}

function NovoCampoForm({
   value,
   onChange,
   onConfirm,
   onCancel,
   isValid,
}: NovoCampoFormProps) {
   const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
         e.preventDefault();
         onConfirm();
      } else if (e.key === "Escape") {
         onCancel();
      }
   };

   return (
      <div className="rounded-lg border-2 border-blue-300 bg-white p-3">
         <div className="flex flex-col gap-3">
            <div>
               <label className="mb-1 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Nome do Campo
               </label>
               <input
                  type="text"
                  value={value.label}
                  onChange={(e) =>
                     onChange({ ...value, label: e.target.value })
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Ex: Observação"
                  autoFocus
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400"
               />
            </div>
            <div>
               <label className="mb-1 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Valor
               </label>
               <textarea
                  value={value.valor}
                  onChange={(e) =>
                     onChange({ ...value, valor: e.target.value })
                  }
                  onKeyDown={(e) => {
                     if (e.key === "Escape") {
                        onCancel();
                     }
                  }}
                  placeholder="Digite o valor..."
                  rows={2}
                  className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400"
               />
            </div>
            <div className="flex items-center gap-1">
               <button
                  type="button"
                  onClick={onConfirm}
                  disabled={!isValid}
                  className="rounded-lg p-2 text-green-600 transition-colors hover:bg-green-50 disabled:text-gray-300"
                  title="Confirmar"
               >
                  <svg
                     className="h-5 w-5"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                     />
                  </svg>
               </button>
               <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:text-gray-600"
                  title="Cancelar"
               >
                  <svg
                     className="h-5 w-5"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                     />
                  </svg>
               </button>
            </div>
         </div>
      </div>
   );
}

// Ícone de grip (arrastar) — 6 pontos em grade 2x3
function GripIcon({ className }: { className?: string }) {
   return (
      <svg
         className={className}
         fill="currentColor"
         viewBox="0 0 16 24"
         aria-hidden="true"
      >
         <circle cx="4" cy="4" r="2" />
         <circle cx="12" cy="4" r="2" />
         <circle cx="4" cy="12" r="2" />
         <circle cx="12" cy="12" r="2" />
         <circle cx="4" cy="20" r="2" />
         <circle cx="12" cy="20" r="2" />
      </svg>
   );
}

export const OrdemEspeciais = memo(function OrdemEspeciais({
   campos,
   isEditable,
   onUpdate,
}: OrdemEspeciaisProps) {
   const [editingIndexes, setEditingIndexes] = useState<Set<number>>(new Set());
   const [addingAfterIndex, setAddingAfterIndex] = useState<number | null>(
      null
   );
   const [novoCampo, setNovoCampo] = useState<CampoEspecial>({
      label: "",
      valor: "",
   });

   // Drag and drop state
   const dragIndexRef = useRef<number | null>(null);
   const [dragIndex, setDragIndex] = useState<number | null>(null);
   const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

   // Quando um novo campo é adicionado, coloca em modo de edição
   useEffect(() => {
      if (campos.length > 0) {
         const lastIndex = campos.length - 1;
         const lastCampo = campos[lastIndex];
         if (!lastCampo.valor.trim() && !editingIndexes.has(lastIndex)) {
            setEditingIndexes((prev) => new Set(prev).add(lastIndex));
         }
      }
   }, [campos.length]);

   const isNovoCampoValid = novoCampo.label.trim() && novoCampo.valor.trim();

   const handleInsertAfter = (index: number) => {
      if (!isNovoCampoValid) return;

      const newCampos = [...campos];
      newCampos.splice(index + 1, 0, {
         label: novoCampo.label.trim(),
         valor: novoCampo.valor.trim(),
      });
      onUpdate(newCampos);

      setNovoCampo({ label: "", valor: "" });
      setAddingAfterIndex(null);
   };

   const handleAddFirst = () => {
      if (!isNovoCampoValid) return;

      onUpdate([
         { label: novoCampo.label.trim(), valor: novoCampo.valor.trim() },
      ]);
      setNovoCampo({ label: "", valor: "" });
      setAddingAfterIndex(null);
   };

   const cancelAdd = () => {
      setNovoCampo({ label: "", valor: "" });
      setAddingAfterIndex(null);
   };

   const handleRemoveCampo = (index: number) => {
      onUpdate(campos.filter((_, i) => i !== index));
      setEditingIndexes((prev) => {
         const newSet = new Set<number>();
         prev.forEach((i) => {
            if (i < index) newSet.add(i);
            else if (i > index) newSet.add(i - 1);
         });
         return newSet;
      });
   };

   const handleChangeCampo = (
      index: number,
      field: "label" | "valor",
      value: string
   ) => {
      onUpdate(
         campos.map((c, i) => (i === index ? { ...c, [field]: value } : c))
      );
   };

   const handleConfirmCampo = (index: number) => {
      const campo = campos[index];
      if (!campo.label.trim() || !campo.valor.trim()) return;
      setEditingIndexes((prev) => {
         const newSet = new Set(prev);
         newSet.delete(index);
         return newSet;
      });
   };

   const handleEditCampo = (index: number) => {
      setEditingIndexes((prev) => new Set(prev).add(index));
   };

   const handleKeyDownCampo = (e: React.KeyboardEvent, index: number) => {
      if (e.key === "Enter" && !e.shiftKey) {
         e.preventDefault();
         handleConfirmCampo(index);
      }
   };

   // --- Drag and drop handlers ---
   const handleDragStart = useCallback(
      (e: React.DragEvent<HTMLDivElement>, index: number) => {
         dragIndexRef.current = index;
         setDragIndex(index);
         e.dataTransfer.effectAllowed = "move";
         // Use a transparent image so the browser default ghost is minimal
         // and our opacity styling provides the visual cue
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
         onUpdate(reordered);

         // Update editing indexes to follow moved items
         setEditingIndexes((prev) => {
            if (prev.size === 0) return prev;
            const newSet = new Set<number>();
            prev.forEach((editIdx) => {
               let newIdx = editIdx;
               if (editIdx === fromIndex) {
                  newIdx = dropIndex;
               } else if (fromIndex < dropIndex) {
                  // Item moved down: items between shift up by 1
                  if (editIdx > fromIndex && editIdx <= dropIndex) {
                     newIdx = editIdx - 1;
                  }
               } else {
                  // Item moved up: items between shift down by 1
                  if (editIdx >= dropIndex && editIdx < fromIndex) {
                     newIdx = editIdx + 1;
                  }
               }
               newSet.add(newIdx);
            });
            return newSet;
         });

         setDragIndex(null);
         setDragOverIndex(null);
         dragIndexRef.current = null;
      },
      [campos, onUpdate]
   );

   const handleDragEnd = useCallback(() => {
      setDragIndex(null);
      setDragOverIndex(null);
      dragIndexRef.current = null;
   }, []);

   return (
      <div>
         {campos.length === 0 ? (
            <div className="py-4">
               {addingAfterIndex === -1 && isEditable ? (
                  <NovoCampoForm
                     value={novoCampo}
                     onChange={setNovoCampo}
                     onConfirm={handleAddFirst}
                     onCancel={cancelAdd}
                     isValid={!!isNovoCampoValid}
                  />
               ) : (
                  <div className="text-center">
                     <p className="mb-2 text-sm text-gray-400">
                        Nenhuma ordem especial adicionada
                     </p>
                     {isEditable && (
                        <button
                           type="button"
                           onClick={() => setAddingAfterIndex(-1)}
                           className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 pb-0.5 text-lg leading-none font-bold text-white transition-colors hover:bg-blue-600"
                           title="Adicionar campo"
                        >
                           +
                        </button>
                     )}
                  </div>
               )}
            </div>
         ) : (
            <div className="space-y-3">
               {campos.map((campo, index) => {
                  const isEditing = editingIndexes.has(index);
                  const isLabelEmpty = !campo.label.trim();
                  const isValorEmpty = !campo.valor.trim();
                  const isAddingAfter = addingAfterIndex === index;
                  const isDragging = dragIndex === index;
                  const isDragOver =
                     dragOverIndex === index && dragIndex !== index;

                  return (
                     <div
                        key={index}
                        className={clsx(
                           "group relative transition-opacity",
                           isDragging && "opacity-40"
                        )}
                        draggable={isEditable && !isEditing}
                        onDragStart={(e) =>
                           isEditable && !isEditing
                              ? handleDragStart(e, index)
                              : e.preventDefault()
                        }
                        onDragOver={(e) =>
                           isEditable ? handleDragOver(e, index) : undefined
                        }
                        onDragLeave={isEditable ? handleDragLeave : undefined}
                        onDrop={(e) =>
                           isEditable ? handleDrop(e, index) : undefined
                        }
                        onDragEnd={isEditable ? handleDragEnd : undefined}
                     >
                        {/* Drop indicator line above */}
                        {isDragOver && (
                           <div className="absolute -top-1.5 right-0 left-0 z-20 h-0.5 rounded-full bg-blue-500" />
                        )}

                        <div
                           className={clsx(
                              "rounded-lg border bg-white p-3",
                              isEditing
                                 ? "border-2 border-blue-300"
                                 : isDragOver
                                   ? "border-blue-400"
                                   : "border-gray-200"
                           )}
                        >
                           {isEditing && isEditable ? (
                              // Modo de edição: dois inputs em coluna
                              <div className="flex flex-col gap-3">
                                 <div>
                                    <label className="mb-1 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                       Nome do Campo
                                    </label>
                                    <input
                                       type="text"
                                       value={campo.label}
                                       onChange={(e) =>
                                          handleChangeCampo(
                                             index,
                                             "label",
                                             e.target.value
                                          )
                                       }
                                       onKeyDown={(e) =>
                                          handleKeyDownCampo(e, index)
                                       }
                                       autoFocus
                                       placeholder="Nome do campo..."
                                       className={clsx(
                                          "w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:ring-2",
                                          isLabelEmpty
                                             ? "border-red-300 focus:border-red-400 focus:ring-red-400"
                                             : "border-gray-300 focus:border-blue-400 focus:ring-blue-400"
                                       )}
                                    />
                                    {isLabelEmpty && (
                                       <p className="mt-1 text-xs text-red-500">
                                          Obrigatório
                                       </p>
                                    )}
                                 </div>
                                 <div>
                                    <label className="mb-1 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                       Valor
                                    </label>
                                    <textarea
                                       value={campo.valor}
                                       onChange={(e) =>
                                          handleChangeCampo(
                                             index,
                                             "valor",
                                             e.target.value
                                          )
                                       }
                                       placeholder="Digite o valor..."
                                       rows={2}
                                       className={clsx(
                                          "w-full resize-none rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:ring-2",
                                          isValorEmpty
                                             ? "border-red-300 focus:border-red-400 focus:ring-red-400"
                                             : "border-gray-300 focus:border-blue-400 focus:ring-blue-400"
                                       )}
                                    />
                                    {isValorEmpty && (
                                       <p className="mt-1 text-xs text-red-500">
                                          Obrigatório
                                       </p>
                                    )}
                                 </div>
                                 <div className="flex items-center gap-1">
                                    <button
                                       type="button"
                                       onClick={() => handleConfirmCampo(index)}
                                       disabled={isLabelEmpty || isValorEmpty}
                                       className="rounded-lg p-2 text-green-600 transition-colors hover:bg-green-50 disabled:text-gray-300 disabled:hover:bg-transparent"
                                       title="Confirmar"
                                    >
                                       <svg
                                          className="h-5 w-5"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                       >
                                          <path
                                             strokeLinecap="round"
                                             strokeLinejoin="round"
                                             strokeWidth={2}
                                             d="M5 13l4 4L19 7"
                                          />
                                       </svg>
                                    </button>
                                    <button
                                       type="button"
                                       onClick={() => handleRemoveCampo(index)}
                                       className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                                       title="Remover campo"
                                    >
                                       <svg
                                          className="h-4 w-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                       >
                                          <path
                                             strokeLinecap="round"
                                             strokeLinejoin="round"
                                             strokeWidth={2}
                                             d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                          />
                                       </svg>
                                    </button>
                                 </div>
                              </div>
                           ) : (
                              // Modo visualização
                              <div className="flex items-center gap-3">
                                 {/* Grip handle para drag and drop */}
                                 {isEditable && (
                                    <div
                                       className="flex shrink-0 cursor-grab items-center text-gray-400 transition-colors hover:text-gray-600 active:cursor-grabbing"
                                       title="Arrastar para reordenar"
                                    >
                                       <GripIcon className="h-5 w-5" />
                                    </div>
                                 )}
                                 <div className="min-w-0 flex-1">
                                    <label className="mb-1 block text-xs font-semibold tracking-wide text-gray-600 uppercase">
                                       {campo.label}
                                    </label>
                                    <span className="block whitespace-pre-wrap text-gray-900">
                                       {campo.valor || (
                                          <span className="text-gray-400 italic">
                                             Sem valor
                                          </span>
                                       )}
                                    </span>
                                 </div>
                                 {isEditable && (
                                    <div className="flex items-center gap-1">
                                       <button
                                          type="button"
                                          onClick={() => handleEditCampo(index)}
                                          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-500"
                                          title="Editar"
                                       >
                                          <svg
                                             className="h-4 w-4"
                                             fill="none"
                                             stroke="currentColor"
                                             viewBox="0 0 24 24"
                                          >
                                             <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                             />
                                          </svg>
                                       </button>
                                       <button
                                          type="button"
                                          onClick={() =>
                                             handleRemoveCampo(index)
                                          }
                                          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                                          title="Remover campo"
                                       >
                                          <svg
                                             className="h-4 w-4"
                                             fill="none"
                                             stroke="currentColor"
                                             viewBox="0 0 24 24"
                                          >
                                             <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                             />
                                          </svg>
                                       </button>
                                    </div>
                                 )}
                              </div>
                           )}
                        </div>

                        {/* Botão de adicionar após este campo */}
                        {isEditable && !isAddingAfter && (
                           <button
                              type="button"
                              onClick={() => setAddingAfterIndex(index)}
                              title="Inserir campo após este"
                              className="absolute -bottom-4 left-1/2 z-10 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-blue-500 pb-0.5 text-lg leading-none font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-blue-600"
                           >
                              +
                           </button>
                        )}

                        {/* Input para novo campo após este */}
                        {isAddingAfter && isEditable && (
                           <div className="mt-4">
                              <NovoCampoForm
                                 value={novoCampo}
                                 onChange={setNovoCampo}
                                 onConfirm={() => handleInsertAfter(index)}
                                 onCancel={cancelAdd}
                                 isValid={!!isNovoCampoValid}
                              />
                           </div>
                        )}
                     </div>
                  );
               })}
            </div>
         )}
      </div>
   );
});
