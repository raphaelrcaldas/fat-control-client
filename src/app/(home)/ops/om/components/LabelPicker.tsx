"use client";

import type { Etiqueta } from "services/routes/om/ordens";
import { EtiquetaChip } from "./EtiquetaChip";

type LabelPickerProps = {
   allLabels: Etiqueta[];
   selectedLabels: Etiqueta[];
   onChange: (labels: Etiqueta[]) => void;
   isEditable?: boolean;
   className?: string;
};

// Seção Classificação da OM. Em edição, uma fileira só na ordem do catálogo
// (alfabética, vinda da API), e cada chip alterna NO LUGAR. Antes as
// selecionadas iam para uma fileira própria: o chip clicado saltava de linha,
// os vizinhos se reorganizavam e, no celular, a seção crescia 32px a cada
// toque — o alvo sob o dedo mudava.
export function LabelPicker({
   allLabels,
   selectedLabels,
   onChange,
   isEditable = true,
   className = "",
}: LabelPickerProps) {
   const selectedIds = new Set(selectedLabels.map((l) => l.id));

   // Selecionada que não está no catálogo (excluída por outra pessoa entre o
   // carregamento da OM e agora) continua visível para poder ser removida
   const foraDoCatalogo = selectedLabels.filter(
      (l) => !allLabels.some((a) => a.id === l.id)
   );
   const opcoes = [...allLabels, ...foraDoCatalogo];

   const toggleLabel = (label: Etiqueta) => {
      const next = selectedIds.has(label.id)
         ? selectedLabels.filter((l) => l.id !== label.id)
         : [...selectedLabels, label];
      // Mantém a ordem do catálogo, a mesma exibida
      onChange(opcoes.filter((o) => next.some((n) => n.id === o.id)));
   };

   if (!isEditable) {
      return (
         <div className={className}>
            {selectedLabels.length === 0 ? (
               <p className="text-sm text-gray-400 italic">
                  Nenhuma etiqueta atribuída a esta missão.
               </p>
            ) : (
               <div className="flex flex-wrap gap-2">
                  {selectedLabels.map((label) => (
                     <EtiquetaChip key={label.id} etiqueta={label} />
                  ))}
               </div>
            )}
         </div>
      );
   }

   if (opcoes.length === 0) {
      return (
         <p className={`text-sm text-gray-400 italic ${className}`}>
            Nenhuma etiqueta cadastrada.
         </p>
      );
   }

   return (
      <div
         role="group"
         aria-label="Etiquetas da missão"
         className={`flex flex-wrap gap-2 ${className}`}
      >
         {opcoes.map((label) => (
            <EtiquetaChip
               key={label.id}
               etiqueta={label}
               selected={selectedIds.has(label.id)}
               onToggle={() => toggleLabel(label)}
            />
         ))}
      </div>
   );
}
