"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import type {
   EtapaFlatItem,
   MissaoComEtapas,
} from "services/routes/estatistica/etapas";

export function useEtapaSelection(
   missoes: MissaoComEtapas[],
   flatEtapas: EtapaFlatItem[] = []
) {
   const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

   const dataKey =
      flatEtapas.length > 0
         ? `flat-${flatEtapas.length}-${flatEtapas[0]?.id}-${flatEtapas.at(-1)?.id}`
         : `grouped-${missoes.length}-${missoes[0]?.id}-${missoes.at(-1)?.id}`;

   useEffect(() => {
      setSelectedIds(new Set());
   }, [dataKey]);

   const allEtapaIds = useMemo(
      () =>
         flatEtapas.length > 0
            ? flatEtapas.map((e) => e.id)
            : missoes.flatMap((m) => m.etapas.map((e) => e.id)),
      [flatEtapas, missoes]
   );

   const allSelected =
      allEtapaIds.length > 0 && allEtapaIds.every((id) => selectedIds.has(id));

   const toggleEtapa = useCallback((id: number) => {
      setSelectedIds((prev) => {
         const next = new Set(prev);
         if (next.has(id)) next.delete(id);
         else next.add(id);
         return next;
      });
   }, []);

   const toggleMissao = useCallback((etapaIds: number[]) => {
      setSelectedIds((prev) => {
         const next = new Set(prev);
         const allChecked = etapaIds.every((id) => next.has(id));
         if (allChecked) {
            etapaIds.forEach((id) => next.delete(id));
         } else {
            etapaIds.forEach((id) => next.add(id));
         }
         return next;
      });
   }, []);

   const toggleAll = useCallback(() => {
      setSelectedIds((prev) => {
         const currentAllSelected =
            allEtapaIds.length > 0 && allEtapaIds.every((id) => prev.has(id));
         if (currentAllSelected) return new Set();
         return new Set(allEtapaIds);
      });
   }, [allEtapaIds]);

   return { selectedIds, allSelected, toggleEtapa, toggleMissao, toggleAll };
}
