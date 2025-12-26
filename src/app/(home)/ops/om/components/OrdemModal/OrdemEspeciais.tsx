"use client";

import clsx from "clsx";
import { useState, useEffect } from "react";
import { CampoEspecial } from "../../types";

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

export function OrdemEspeciais({
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

                  return (
                     <div key={index} className="group relative">
                        <div
                           className={clsx(
                              "rounded-lg border bg-white p-3",
                              isEditing
                                 ? "border-2 border-blue-300"
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
}
