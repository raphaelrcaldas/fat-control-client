"use client";

import { useMemo, useState } from "react";
import type { HistoricoVisibility } from "./useHistoricoSeries";

export interface HistoricoVisibilityControls {
   visibility: HistoricoVisibility;
   onToggleTotal: () => void;
   onToggleGroup: (grupo: string) => void;
   onTogglePrograma: (id: number) => void;
   onIsolate: (id: number) => void;
}

/**
 * Estado de visibilidade das séries (Total, Σ grupos, programas), compartilhado
 * entre toolbar ↔ chart ↔ rail. Default "só o Total": records vazios = tudo
 * oculto (`toggled[id] === true` = visível — ver `HistoricoVisibility`).
 *
 * Trocar o `anoRef` RESETA tudo: os `esfaer_id` e grupos de um ano não valem
 * para outro (um `isolated` órfão deixaria a view num estado sem saída).
 */
export function useHistoricoVisibility(
   anoRef: number
): HistoricoVisibilityControls {
   const [totalVisible, setTotalVisible] = useState(true);
   const [groups, setGroups] = useState<Record<string, boolean>>({});
   const [toggled, setToggled] = useState<Record<number, boolean>>({});
   const [isolated, setIsolated] = useState<number | null>(null);

   // Reset síncrono na troca de ano (padrão React "state reset during render").
   const [prevAnoRef, setPrevAnoRef] = useState(anoRef);
   if (prevAnoRef !== anoRef) {
      setPrevAnoRef(anoRef);
      setTotalVisible(true);
      setGroups({});
      setToggled({});
      setIsolated(null);
   }

   const onToggleTotal = () => setTotalVisible((v) => !v);

   const onToggleGroup = (grupo: string) =>
      setGroups((prev) => ({ ...prev, [grupo]: !prev[grupo] }));

   const onTogglePrograma = (id: number) => {
      setToggled((prev) => {
         if (isolated === null) {
            return { ...prev, [id]: !(prev[id] ?? false) };
         }
         // Sair do isolamento materializando o que está NA TELA (WYSIWYG):
         // só o isolado visível como base, e o clique togla `id` sobre ela —
         // nunca sobre o `toggled` cru que o rail não estava exibindo.
         return { [isolated]: true, [id]: id !== isolated };
      });
      setIsolated(null);
   };

   const onIsolate = (id: number) =>
      setIsolated((prev) => (prev === id ? null : id));

   const visibility = useMemo<HistoricoVisibility>(
      () => ({ totalVisible, groups, toggled, isolated }),
      [totalVisible, groups, toggled, isolated]
   );

   return {
      visibility,
      onToggleTotal,
      onToggleGroup,
      onTogglePrograma,
      onIsolate,
   };
}
