"use client";

import { useCallback, useMemo } from "react";
import { useExportCart } from "@/components/export/useExportCart";
import type {
   EtapaFlatItem,
   MissaoComEtapas,
} from "services/routes/estatistica/etapas";

const getEtapaId = (etapa: EtapaFlatItem) => etapa.id;

export function useEtapaSelection(
   missoes: MissaoComEtapas[],
   flatEtapas: EtapaFlatItem[] = [],
   grouped = true
) {
   // Guarda a etapa inteira para a selecao sobreviver a pagina e aos filtros
   // sem nova busca no momento de montar a planilha.
   const cart = useExportCart<EtapaFlatItem>(getEtapaId);

   const visibleEtapas = useMemo<EtapaFlatItem[]>(
      () =>
         grouped
            ? missoes.flatMap((missao) =>
                 missao.etapas.map((etapa) => ({
                    ...etapa,
                    missao_id: missao.id,
                    missao_titulo: missao.titulo,
                 }))
              )
            : flatEtapas,
      [grouped, flatEtapas, missoes]
   );

   const selectedIds = useMemo(
      () => new Set(cart.items.map((etapa) => etapa.id)),
      [cart.items]
   );

   const allEtapaIds = useMemo(
      () => visibleEtapas.map((etapa) => etapa.id),
      [visibleEtapas]
   );

   const allSelected =
      allEtapaIds.length > 0 && allEtapaIds.every((id) => selectedIds.has(id));
   const visibleSelectedCount = allEtapaIds.filter((id) =>
      selectedIds.has(id)
   ).length;

   const toggleEtapa = useCallback(
      (id: number) => {
         const etapa = visibleEtapas.find((item) => item.id === id);
         if (etapa) cart.toggle(etapa);
      },
      [cart, visibleEtapas]
   );

   const toggleMissao = useCallback(
      (etapaIds: number[]) => {
         if (etapaIds.every((id) => cart.has(id))) {
            cart.removeMany(etapaIds);
            return;
         }
         const ids = new Set(etapaIds);
         cart.addMany(visibleEtapas.filter((etapa) => ids.has(etapa.id)));
      },
      [cart, visibleEtapas]
   );

   const toggleAll = useCallback(() => {
      if (allSelected) {
         cart.removeMany(allEtapaIds);
      } else {
         cart.addMany(visibleEtapas);
      }
   }, [allEtapaIds, allSelected, cart, visibleEtapas]);

   return {
      cart,
      selectedIds,
      selectedEtapas: cart.items,
      visibleSelectedCount,
      allSelected,
      toggleEtapa,
      toggleMissao,
      toggleAll,
      clearSelection: cart.clear,
   };
}
