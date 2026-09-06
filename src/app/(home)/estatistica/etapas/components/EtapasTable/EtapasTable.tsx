"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Checkbox, Label } from "flowbite-react";
import type {
   EtapaFlatItem,
   EtapaItem,
   MissaoComEtapas,
} from "services/routes/estatistica/etapas";
import { MissaoCard } from "./MissaoCard";
import { EtapasFlatTable } from "./EtapasFlatTable";
import { EtapasNavigatorModal } from "../EtapasNavigatorModal/EtapasNavigatorModal";

export interface EtapasTableProps {
   missoes: MissaoComEtapas[];
   flatEtapas?: EtapaFlatItem[];
   loading: boolean;
   selectedIds: Set<number>;
   onToggleEtapa: (id: number) => void;
   onToggleMissao: (etapaIds: number[]) => void;
   onToggleAll: () => void;
   allSelected: boolean;
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
   onDeleteMissao,
   grouped = true,
}: EtapasTableProps) {
   const [detailState, setDetailState] = useState<{
      etapaId: number;
      etapas: EtapaItem[];
      missaoTitulo?: string | null;
   } | null>(null);

   const router = useRouter();

   const hasData = grouped ? missoes.length > 0 : flatEtapas.length > 0;

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

   // Stable callback: open detail by id
   const handleDetailEtapa = useCallback(
      (id: number) => {
         if (grouped) {
            const missao = missoes.find((m) =>
               m.etapas.some((e) => e.id === id)
            );
            setDetailState({
               etapaId: id,
               etapas: missao?.etapas ?? [],
               missaoTitulo: missao?.titulo,
            });
         } else {
            setDetailState({ etapaId: id, etapas: flatEtapas });
         }
      },
      [grouped, missoes, flatEtapas]
   );

   // Stable callback: open edit form by id (grouped mode)
   const handleEditEtapaGrouped = useCallback(
      (id: number) => {
         const missao = missoes.find((m) => m.etapas.some((e) => e.id === id));
         if (!missao) return;
         router.push(`/estatistica/etapas/missao/${missao.id}?etapa=${id}`);
      },
      [missoes, router]
   );

   // Stable callback: open edit form by id (flat mode)
   const handleEditEtapaFlat = useCallback(
      (id: number) => {
         const etapa = etapaById.get(id);
         if (!etapa) return;
         const flatEtapa = etapa as EtapaFlatItem;
         router.push(
            `/estatistica/etapas/missao/${flatEtapa.missao_id}?etapa=${id}`
         );
      },
      [etapaById, router]
   );

   if (!loading && !hasData) {
      return null;
   }

   return (
      <div className="space-y-2">
         {/* Selecionar tudo da pagina + ações em massa. Mesma geometria dos
             cards (mx-0.5 + coluna w-7 centrada, flush à esquerda) para o
             checkbox cair sobre os das missões/etapas. */}
         {/* pl-px compensa a borda de 1px do card das missões, que empurra o
             conteúdo interno e tirava esta barra do eixo por 1px. */}
         <div className="mx-0.5 flex h-9 flex-wrap items-center gap-2 pr-1 pl-px">
            <div className="flex w-7 shrink-0 items-center justify-center">
               <Checkbox
                  id="select-all-etapas"
                  color="primary"
                  checked={allSelected}
                  ref={(el) => {
                     if (el) el.indeterminate = someSelected;
                  }}
                  onChange={onToggleAll}
                  className="size-5 cursor-pointer"
               />
            </div>
            <Label
               htmlFor="select-all-etapas"
               className="cursor-pointer text-sm font-medium text-gray-600"
            >
               Selecionar todas as etapas da pagina
            </Label>
         </div>

         {grouped ? (
            missoes.map((missao) => (
               <MissaoCard
                  key={missao.id}
                  missao={missao}
                  loading={loading}
                  selectedIds={selectedIds}
                  onToggleEtapa={onToggleEtapa}
                  onToggleMissao={onToggleMissao}
                  onDetailEtapa={handleDetailEtapa}
                  onEditEtapa={handleEditEtapaGrouped}
                  onDeleteMissao={onDeleteMissao}
               />
            ))
         ) : (
            <EtapasFlatTable
               etapas={flatEtapas}
               loading={loading}
               selectedIds={selectedIds}
               onToggleEtapa={onToggleEtapa}
               onDetailEtapa={handleDetailEtapa}
               onEditEtapa={handleEditEtapaFlat}
            />
         )}

         {detailState && (
            <EtapasNavigatorModal
               etapas={detailState.etapas}
               initialEtapaId={detailState.etapaId}
               onClose={() => setDetailState(null)}
               missaoTitulo={detailState.missaoTitulo}
               onEditEtapa={
                  grouped ? handleEditEtapaGrouped : handleEditEtapaFlat
               }
            />
         )}
      </div>
   );
}
