"use client";

import type { EtapaFlatItem } from "services/routes/estatistica/etapas";
import { EtapasInnerTable } from "./EtapasInnerTable";

export interface EtapasFlatTableProps {
   etapas: EtapaFlatItem[];
   loading: boolean;
   selectedIds: Set<number>;
   onToggleEtapa: (id: number) => void;
   onDetailEtapa: (id: number) => void;
   onEditEtapa: (id: number) => void;
}

export function EtapasFlatTable({
   etapas,
   loading,
   selectedIds,
   onToggleEtapa,
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
         />
      </div>
   );
}
