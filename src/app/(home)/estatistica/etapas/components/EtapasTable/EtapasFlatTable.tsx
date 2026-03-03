"use client";

import type {
   EtapaItem,
   MissaoComEtapas,
} from "services/routes/estatistica/etapas";
import { EtapasInnerTable } from "./EtapasInnerTable";

export interface EtapasFlatTableProps {
   missoes: MissaoComEtapas[];
   loading: boolean;
   selectedIds: Set<number>;
   onToggleEtapa: (id: number) => void;
   onToggleAll: () => void;
   allSelected: boolean;
   someSelected: boolean;
   onDetailEtapa: (id: number) => void;
   onEditEtapa: (etapa: EtapaItem) => void;
}

export function EtapasFlatTable({
   missoes,
   loading,
   selectedIds,
   onToggleEtapa,
   onToggleAll,
   allSelected,
   someSelected,
   onDetailEtapa,
   onEditEtapa,
}: EtapasFlatTableProps) {
   const allEtapas = missoes.flatMap((m) => m.etapas);

   return (
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
         <EtapasInnerTable
            etapas={allEtapas}
            loading={loading}
            selectedIds={selectedIds}
            onToggleEtapa={onToggleEtapa}
            onDetailEtapa={onDetailEtapa}
            onEditEtapa={onEditEtapa}
            headerCheckbox={{
               checked: allSelected,
               indeterminate: someSelected,
               onChange: onToggleAll,
            }}
         />
      </div>
   );
}
