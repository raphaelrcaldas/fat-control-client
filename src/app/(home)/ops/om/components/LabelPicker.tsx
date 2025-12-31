"use client";

import { HiTag, HiX } from "react-icons/hi";
import { Etiqueta } from "../types";

type LabelPickerProps = {
   allLabels: Etiqueta[];
   selectedLabels: Etiqueta[];
   onChange: (labels: Etiqueta[]) => void;
   isEditable?: boolean;
   className?: string;
};

export function LabelPicker({
   allLabels,
   selectedLabels,
   onChange,
   isEditable = true,
   className = "",
}: LabelPickerProps) {
   const toggleLabel = (label: Etiqueta) => {
      const isSelected = selectedLabels.some((l) => l.id === label.id);
      const newSelected = isSelected
         ? selectedLabels.filter((l) => l.id !== label.id)
         : [...selectedLabels, label];
      onChange(newSelected);
   };

   const unselectedLabels = allLabels.filter(
      (label) => !selectedLabels.some((l) => l.id === label.id)
   );

   return (
      <div className={`space-y-1 ${className}`}>
         {/* Etiquetas selecionadas */}
         <div className="flex flex-wrap gap-2">
            {selectedLabels.length === 0 && !isEditable && (
               <p className="text-sm text-gray-400 italic">
                  Nenhuma etiqueta atribuída a esta missão.
               </p>
            )}
            {selectedLabels.map((label) => (
               <span
                  key={label.id}
                  style={{
                     backgroundColor: `${label.cor}20`,
                     color: label.cor,
                     borderColor: label.cor,
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold shadow-sm transition-all"
               >
                  <HiTag className="h-3 w-3" />
                  {label.nome}
                  {isEditable && (
                     <button
                        type="button"
                        onClick={() => toggleLabel(label)}
                        className="ml-1 rounded-full p-0.5 transition-colors hover:bg-black/10"
                        title="Remover"
                     >
                        <HiX className="h-3.5 w-3.5" />
                     </button>
                  )}
               </span>
            ))}
         </div>

         {/* Seletor de etiquetas (modo edição) */}
         {isEditable && unselectedLabels.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
               {unselectedLabels.map((label) => (
                  <button
                     key={label.id}
                     type="button"
                     onClick={() => toggleLabel(label)}
                     className="inline-flex items-center gap-1.5 rounded-full border border-dashed px-3 py-1 text-xs font-medium transition-all hover:scale-105"
                     style={{
                        borderColor: label.cor,
                        color: label.cor,
                        backgroundColor: `${label.cor}10`,
                     }}
                     title={label.descricao || "Clique para adicionar"}
                  >
                     <HiTag className="h-3 w-3" />
                     {label.nome}
                  </button>
               ))}
            </div>
         )}

         {isEditable && allLabels.length === 0 && (
            <p className="text-sm text-gray-400 italic">
               Nenhuma etiqueta cadastrada.
            </p>
         )}
      </div>
   );
}
