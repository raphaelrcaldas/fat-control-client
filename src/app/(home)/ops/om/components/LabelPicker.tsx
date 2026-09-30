"use client";

import type { Etiqueta } from "services/routes/om/ordens";
import { EtiquetaChip } from "./EtiquetaChip";

type LabelPickerProps = {
   allLabels: Etiqueta[];
   /** Estado da consulta do catálogo: sem ele, "nenhuma cadastrada" é mentira. */
   isLoading?: boolean;
   isError?: boolean;
   onRetry?: () => void;
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
   isLoading = false,
   isError = false,
   onRetry,
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

   if (isLoading && opcoes.length === 0) {
      return (
         <div role="status" className={className}>
            <span className="sr-only">Carregando etiquetas…</span>
            <div aria-hidden className="flex flex-wrap gap-2">
               {[0, 1, 2].map((i) => (
                  <div
                     key={i}
                     className="h-[26px] w-20 animate-pulse rounded-full bg-slate-100"
                  />
               ))}
            </div>
         </div>
      );
   }

   if (isError && opcoes.length === 0) {
      return (
         <p role="alert" className={`text-sm text-red-700 ${className}`}>
            Não foi possível carregar as etiquetas.{" "}
            {onRetry && (
               <button
                  type="button"
                  onClick={onRetry}
                  className="font-semibold underline underline-offset-2"
               >
                  Tentar novamente
               </button>
            )}
         </p>
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
