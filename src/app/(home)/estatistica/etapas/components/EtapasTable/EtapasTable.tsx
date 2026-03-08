"use client";

import { useState } from "react";
import { Checkbox } from "flowbite-react";
import type {
   EtapaFlatItem,
   EtapaItem,
   MissaoComEtapas,
} from "services/routes/estatistica/etapas";
import { MissaoCard } from "./MissaoCard";
import { EtapasFlatTable } from "./EtapasFlatTable";
import { EtapaDetailModal } from "../EtapaDetailModal";
import { EtapaFormModal } from "../EtapaFormModal";

export interface EtapasTableProps {
   missoes: MissaoComEtapas[];
   flatEtapas?: EtapaFlatItem[];
   loading: boolean;
   selectedIds: Set<number>;
   onToggleEtapa: (id: number) => void;
   onToggleMissao: (etapaIds: number[]) => void;
   onToggleAll: () => void;
   allSelected: boolean;
   onEditMissao: (missao: MissaoComEtapas) => void;
   onDeleteMissao: (missao: MissaoComEtapas) => void;
   grouped?: boolean;
}

export function EtapasTable({
   missoes,
   flatEtapas = [],
   loading,
   selectedIds,
   onToggleEtapa,
   onToggleMissao,
   onToggleAll,
   allSelected,
   onEditMissao,
   onDeleteMissao,
   grouped = true,
}: EtapasTableProps) {
   const [detailId, setDetailId] = useState<number | null>(null);
   const [etapaFormState, setEtapaFormState] = useState<{
      missao: MissaoComEtapas;
      editingEtapa: EtapaItem | null;
   } | null>(null);

   const hasData = grouped ? missoes.length > 0 : flatEtapas.length > 0;

   if (!loading && !hasData) {
      return null;
   }

   const allEtapaIds = grouped
      ? missoes.flatMap((m) => m.etapas.map((e) => e.id))
      : flatEtapas.map((e) => e.id);
   const someSelected =
      !allSelected && allEtapaIds.some((id) => selectedIds.has(id));

   return (
      <div className="space-y-4 py-2">
         {grouped ? (
            <>
               {/* Selecionar tudo da pagina */}
               <div className="flex items-center gap-2 px-1">
                  <Checkbox
                     color="red"
                     checked={allSelected}
                     ref={(el) => {
                        if (el) el.indeterminate = someSelected;
                     }}
                     onChange={onToggleAll}
                     className="cursor-pointer"
                  />
                  <span className="text-xs font-medium text-gray-600">
                     Selecionar todas as etapas da pagina
                  </span>
               </div>

               {missoes.map((missao) => (
                  <MissaoCard
                     key={missao.id}
                     missao={missao}
                     loading={loading}
                     selectedIds={selectedIds}
                     onToggleEtapa={onToggleEtapa}
                     onToggleMissao={onToggleMissao}
                     onDetailEtapa={setDetailId}
                     onEditEtapa={(etapa) =>
                        setEtapaFormState({ missao, editingEtapa: etapa })
                     }
                     onAddEtapa={(m) =>
                        setEtapaFormState({ missao: m, editingEtapa: null })
                     }
                     onEditMissao={onEditMissao}
                     onDeleteMissao={onDeleteMissao}
                  />
               ))}
            </>
         ) : (
            <EtapasFlatTable
               etapas={flatEtapas}
               loading={loading}
               selectedIds={selectedIds}
               onToggleEtapa={onToggleEtapa}
               onToggleAll={onToggleAll}
               allSelected={allSelected}
               someSelected={someSelected}
               onDetailEtapa={setDetailId}
               onEditEtapa={(etapa) =>
                  setEtapaFormState({
                     missao: {
                        id: etapa.missao_id,
                        titulo: etapa.missao_titulo,
                        obs: null,
                        etapas: flatEtapas.filter(
                           (e) => e.missao_id === etapa.missao_id
                        ),
                     },
                     editingEtapa: etapa,
                  })
               }
            />
         )}

         <EtapaDetailModal
            etapaId={detailId}
            onClose={() => setDetailId(null)}
         />

         {etapaFormState && (
            <EtapaFormModal
               show={!!etapaFormState}
               onClose={() => setEtapaFormState(null)}
               missao={etapaFormState.missao}
               editingEtapa={etapaFormState.editingEtapa}
            />
         )}
      </div>
   );
}
