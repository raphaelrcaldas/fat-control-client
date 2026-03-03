"use client";

import { useState } from "react";
import { Checkbox } from "flowbite-react";
import type {
   EtapaItem,
   MissaoComEtapas,
} from "services/routes/estatistica/etapas";
import { MissaoCard } from "./MissaoCard";
import { EtapasFlatTable } from "./EtapasFlatTable";
import { EtapaDetailModal } from "../EtapaDetailModal";
import { EtapaFormModal } from "../EtapaFormModal";

export interface EtapasTableProps {
   missoes: MissaoComEtapas[];
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

   if (!loading && missoes.length === 0) {
      return null;
   }

   const allEtapaIds = missoes.flatMap((m) => m.etapas.map((e) => e.id));
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
               missoes={missoes}
               loading={loading}
               selectedIds={selectedIds}
               onToggleEtapa={onToggleEtapa}
               onToggleAll={onToggleAll}
               allSelected={allSelected}
               someSelected={someSelected}
               onDetailEtapa={setDetailId}
               onEditEtapa={(etapa) => {
                  const missao = missoes.find((m) =>
                     m.etapas.some((e) => e.id === etapa.id)
                  );
                  if (missao)
                     setEtapaFormState({ missao, editingEtapa: etapa });
               }}
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
