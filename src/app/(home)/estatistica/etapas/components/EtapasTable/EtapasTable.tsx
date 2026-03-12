"use client";

import { useState, useMemo, useCallback } from "react";
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

   const allEtapaIds = useMemo(
      () =>
         grouped
            ? missoes.flatMap((m) => m.etapas.map((e) => e.id))
            : flatEtapas.map((e) => e.id),
      [grouped, missoes, flatEtapas]
   );

   const someSelected =
      !allSelected && allEtapaIds.some((id) => selectedIds.has(id));

   // Lookup maps for id-based callbacks
   const etapaById = useMemo(() => {
      const map = new Map<number, EtapaItem>();
      if (grouped) {
         for (const m of missoes) {
            for (const e of m.etapas) map.set(e.id, e);
         }
      } else {
         for (const e of flatEtapas) map.set(e.id, e);
      }
      return map;
   }, [grouped, missoes, flatEtapas]);

   const missaoByEtapaId = useMemo(() => {
      if (grouped) return null;
      const map = new Map<number, MissaoComEtapas>();
      for (const e of flatEtapas) {
         if (!map.has(e.missao_id)) {
            map.set(e.missao_id, {
               id: e.missao_id,
               titulo: (e as EtapaFlatItem).missao_titulo,
               obs: null,
               etapas: flatEtapas.filter((fe) => fe.missao_id === e.missao_id),
            });
         }
      }
      return map;
   }, [grouped, flatEtapas]);

   // Stable callback: open detail by id
   const handleDetailEtapa = useCallback((id: number) => {
      setDetailId(id);
   }, []);

   // Stable callback: open edit form by id (grouped mode)
   const handleEditEtapaGrouped = useCallback(
      (id: number) => {
         const etapa = etapaById.get(id);
         if (!etapa) return;
         const missao = missoes.find((m) => m.etapas.some((e) => e.id === id));
         if (!missao) return;
         setEtapaFormState({ missao, editingEtapa: etapa });
      },
      [etapaById, missoes]
   );

   // Stable callback: open edit form by id (flat mode)
   const handleEditEtapaFlat = useCallback(
      (id: number) => {
         const etapa = etapaById.get(id);
         if (!etapa) return;
         const flatEtapa = etapa as EtapaFlatItem;
         const missao = missaoByEtapaId?.get(flatEtapa.missao_id);
         if (!missao) return;
         setEtapaFormState({ missao, editingEtapa: etapa });
      },
      [etapaById, missaoByEtapaId]
   );

   const handleAddEtapa = useCallback(
      (m: MissaoComEtapas) =>
         setEtapaFormState({ missao: m, editingEtapa: null }),
      []
   );

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
                     onDetailEtapa={handleDetailEtapa}
                     onEditEtapa={handleEditEtapaGrouped}
                     onAddEtapa={handleAddEtapa}
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
               onDetailEtapa={handleDetailEtapa}
               onEditEtapa={handleEditEtapaFlat}
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
