"use client";

import type { EtapaFlatItem } from "services/routes/estatistica/etapas";
import { EtapasInnerTable } from "./EtapasInnerTable";

export interface EtapasFlatTableProps {
   etapas: EtapaFlatItem[];
   loading: boolean;
   selectedIds: Set<number>;
   onToggleEtapa: (id: number) => void;
   onToggleAll: () => void;
   allSelected: boolean;
   someSelected: boolean;
   onDetailEtapa: (id: number) => void;
   onEditEtapa: (etapa: EtapaFlatItem) => void;
}

export function EtapasFlatTable({
   etapas,
   loading,
   selectedIds,
   onToggleEtapa,
   onToggleAll,
   allSelected,
   someSelected,
   onDetailEtapa,
   onEditEtapa,
}: EtapasFlatTableProps) {
   return (
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
         <EtapasInnerTable
            etapas={etapas}
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
