"use client";

import { useState, useMemo, useCallback } from "react";
import { Badge, Checkbox, Spinner } from "flowbite-react";
import {
   HiCheck,
   HiX,
   HiCheckCircle,
   HiClock,
   HiSun,
   HiMoon,
} from "react-icons/hi";
import { GiOwl } from "react-icons/gi";
import type {
   EtapaFlatItem,
   EtapaItem,
   MissaoComEtapas,
} from "services/routes/estatistica/etapas";
import { useBulkUpdateEtapas } from "@/hooks/queries/useEtapas";
import { minutesToTime } from "@/../utils/dateHandler";
import { MissaoCard } from "./MissaoCard";
import { EtapasFlatTable } from "./EtapasFlatTable";
import { EtapasNavigatorModal } from "../EtapasNavigatorModal/EtapasNavigatorModal";
import { EtapaFormModal } from "../EtapaFormModal/EtapaFormModal";
import { PermBased } from "@/app/(home)/hooks/usePermBased";

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
   onClearSelection?: () => void;
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
   onClearSelection,
}: EtapasTableProps) {
   const [detailState, setDetailState] = useState<{
      etapaId: number;
      etapas: EtapaItem[];
      missaoTitulo?: string | null;
   } | null>(null);
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
               is_simulador: false,
               etapas: flatEtapas.filter((fe) => fe.missao_id === e.missao_id),
            });
         }
      }
      return map;
   }, [grouped, flatEtapas]);

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

   // ── Bulk update ──────────────────────────────────────────────
   const bulkUpdate = useBulkUpdateEtapas();
   const [bulkFeedback, setBulkFeedback] = useState<string | null>(null);

   const totalTvoo = useMemo(() => {
      const allEtapas = grouped ? missoes.flatMap((m) => m.etapas) : flatEtapas;
      return allEtapas
         .filter((e) => selectedIds.has(e.id))
         .reduce((sum, e) => sum + e.tvoo, 0);
   }, [selectedIds, missoes, flatEtapas, grouped]);

   const oiTotals = useMemo(() => {
      const allEtapas = grouped ? missoes.flatMap((m) => m.etapas) : flatEtapas;
      const selected = allEtapas.filter((e) => selectedIds.has(e.id));
      const totals = { d: 0, n: 0, v: 0 };
      for (const etapa of selected) {
         for (const oi of etapa.oi_etapas) {
            totals[oi.reg] += oi.tvoo;
         }
      }
      return totals;
   }, [selectedIds, missoes, flatEtapas, grouped]);

   const handleBulkUpdate = useCallback(
      (field: "sagem" | "parte1", value: boolean) => {
         const ids = Array.from(selectedIds);
         bulkUpdate.mutate(
            { ids, data: { [field]: value } },
            {
               onSuccess: (result) => {
                  if (result.ok) {
                     const label = field === "sagem" ? "SAGEM" : "Parte 1";
                     setBulkFeedback(
                        `${label} ${value ? "marcado" : "desmarcado"} em ${ids.length} etapa(s)`
                     );
                     setTimeout(() => setBulkFeedback(null), 3000);
                     onClearSelection?.();
                  }
               },
            }
         );
      },
      [selectedIds, bulkUpdate]
   );

   const selectionActions = selectedIds.size > 0 && (
      <div className="flex flex-wrap items-center gap-2">
         <div className="h-4 w-px bg-gray-300" />
         <Badge color="red" size="sm">
            {selectedIds.size} etapa(s)
         </Badge>
         <div className="flex items-center gap-1 text-sm font-semibold text-gray-800">
            <HiClock className="h-4 w-4 text-blue-600" />
            {minutesToTime(totalTvoo)}
         </div>
         <div className="h-4 w-px bg-gray-300" />
         {(oiTotals.d > 0 || oiTotals.n > 0 || oiTotals.v > 0) && (
            <div className="flex items-center gap-2">
               {oiTotals.d > 0 && (
                  <div className="flex items-center gap-1 text-sm font-semibold text-amber-600">
                     <HiSun className="h-4 w-4" />
                     {minutesToTime(oiTotals.d)}
                  </div>
               )}
               {oiTotals.n > 0 && (
                  <div className="flex items-center gap-1 text-sm font-semibold text-indigo-600">
                     <HiMoon className="h-4 w-4" />
                     {minutesToTime(oiTotals.n)}
                  </div>
               )}
               {oiTotals.v > 0 && (
                  <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
                     <GiOwl className="h-4 w-4" />
                     {minutesToTime(oiTotals.v)}
                  </div>
               )}
            </div>
         )}
         <div className="h-4 w-px bg-gray-300" />

         <PermBased resource="etp_mis" requiredPerm="create">
            <div className="flex items-center gap-2 rounded-md bg-white px-3 py-1.5 shadow">
               <span className="mr-1 text-sm font-medium text-gray-500">
                  SAGEM
               </span>
               <button
                  onClick={() => handleBulkUpdate("sagem", true)}
                  disabled={bulkUpdate.isPending}
                  className="rounded bg-emerald-50 px-1.5 py-0.5 text-sm font-semibold text-emerald-700 shadow hover:bg-emerald-100 disabled:opacity-50"
               >
                  <HiCheck className="inline h-4 w-4" />
               </button>
               <button
                  onClick={() => handleBulkUpdate("sagem", false)}
                  disabled={bulkUpdate.isPending}
                  className="rounded bg-amber-50 px-1.5 py-0.5 text-sm font-semibold text-amber-700 shadow hover:bg-amber-100 disabled:opacity-50"
               >
                  <HiX className="inline h-4 w-4" />
               </button>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-white px-3 py-1.5 shadow">
               <span className="mr-1 text-sm font-medium text-gray-500">
                  Parte 1
               </span>
               <button
                  onClick={() => handleBulkUpdate("parte1", true)}
                  disabled={bulkUpdate.isPending}
                  className="rounded bg-emerald-50 px-1.5 py-0.5 text-sm font-semibold text-emerald-700 shadow hover:bg-emerald-100 disabled:opacity-50"
               >
                  <HiCheck className="inline h-4 w-4" />
               </button>
               <button
                  onClick={() => handleBulkUpdate("parte1", false)}
                  disabled={bulkUpdate.isPending}
                  className="rounded bg-amber-50 px-1.5 py-0.5 text-sm font-semibold text-amber-700 shadow hover:bg-amber-100 disabled:opacity-50"
               >
                  <HiX className="inline h-4 w-4" />
               </button>
            </div>
         </PermBased>

         {bulkUpdate.isPending && <Spinner size="xs" color="failure" />}
         {bulkFeedback && (
            <span className="flex items-center gap-0.5 text-sm font-medium text-emerald-600">
               <HiCheckCircle className="h-4 w-4" />
               {bulkFeedback}
            </span>
         )}
      </div>
   );

   return (
      <div className="space-y-2 py-1">
         {grouped ? (
            <>
               {/* Selecionar tudo da pagina + ações em massa */}
               <div className="ml-2 flex h-8 flex-wrap items-center gap-2 px-1">
                  <Checkbox
                     color="red"
                     checked={allSelected}
                     ref={(el) => {
                        if (el) el.indeterminate = someSelected;
                     }}
                     onChange={onToggleAll}
                     className="cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-600">
                     Selecionar todas as etapas da pagina
                  </span>
                  {selectionActions}
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
            <>
               {selectionActions && (
                  <div className="flex flex-wrap items-center gap-2 px-1">
                     {selectionActions}
                  </div>
               )}
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
            </>
         )}

         {detailState && (
            <EtapasNavigatorModal
               etapas={detailState.etapas}
               initialEtapaId={detailState.etapaId}
               onClose={() => setDetailState(null)}
               missaoTitulo={detailState.missaoTitulo}
            />
         )}

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
