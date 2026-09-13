"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Checkbox, Label } from "flowbite-react";
import type {
   EtapaItem,
   MissaoComEtapas,
} from "services/routes/estatistica/etapas";
import { MissaoCard } from "./MissaoCard";
import { EtapasNavigatorModal } from "../EtapasNavigatorModal/EtapasNavigatorModal";

export interface EtapasTableProps {
   missoes: MissaoComEtapas[];
   loading: boolean;
   selectedIds: Set<number>;
   onToggleEtapa: (id: number) => void;
   onToggleMissao: (etapaIds: number[]) => void;
   onToggleAll: () => void;
   allSelected: boolean;
   onDeleteMissao: (missao: MissaoComEtapas) => void;
}

export function EtapasTable({
   missoes,
   loading,
   selectedIds,
   onToggleEtapa,
   onToggleMissao,
   onToggleAll,
   allSelected,
   onDeleteMissao,
}: EtapasTableProps) {
   const [detailState, setDetailState] = useState<{
      etapaId: number;
      etapas: EtapaItem[];
      missaoTitulo?: string | null;
   } | null>(null);

   const router = useRouter();

   const allEtapaIds = useMemo(
      () => missoes.flatMap((m) => m.etapas.map((e) => e.id)),
      [missoes]
   );

   const someSelected =
      !allSelected && allEtapaIds.some((id) => selectedIds.has(id));

   // Stable callback: open detail by id
   const handleDetailEtapa = useCallback(
      (id: number) => {
         const missao = missoes.find((m) => m.etapas.some((e) => e.id === id));
         setDetailState({
            etapaId: id,
            etapas: missao?.etapas ?? [],
            missaoTitulo: missao?.titulo,
         });
      },
      [missoes]
   );

   // Stable callback: open edit form by id
   const handleEditEtapa = useCallback(
      (id: number) => {
         const missao = missoes.find((m) => m.etapas.some((e) => e.id === id));
         if (!missao) return;
         router.push(`/estatistica/etapas/missao/${missao.id}?etapa=${id}`);
      },
      [missoes, router]
   );

   if (!loading && missoes.length === 0) {
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

         {missoes.map((missao) => (
            <MissaoCard
               key={missao.id}
               missao={missao}
               loading={loading}
               selectedIds={selectedIds}
               onToggleEtapa={onToggleEtapa}
               onToggleMissao={onToggleMissao}
               onDetailEtapa={handleDetailEtapa}
               onEditEtapa={handleEditEtapa}
               onDeleteMissao={onDeleteMissao}
            />
         ))}

         {detailState && (
            <EtapasNavigatorModal
               etapas={detailState.etapas}
               initialEtapaId={detailState.etapaId}
               onClose={() => setDetailState(null)}
               missaoTitulo={detailState.missaoTitulo}
               onEditEtapa={handleEditEtapa}
            />
         )}
      </div>
   );
}
