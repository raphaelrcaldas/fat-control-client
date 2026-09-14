"use client";

import { useCallback, useMemo, useState } from "react";
import type { HistoricoVisibility } from "./useHistoricoSeries";

export interface HistoricoVisibilityControls {
   visibility: HistoricoVisibility;
   onToggleTotal: () => void;
   onToggleGroup: (grupo: string) => void;
   onTogglePrograma: (id: number) => void;
   onIsolate: (id: number) => void;
   /** Sai do isolamento preservando o resto da seleção. */
   onClearIsolated: () => void;
   /** Volta ao default da tela (só o Total) — ver `resetVisibility`. */
   onResetVisibility: () => void;
   /** Há algo além do default ligado (habilita a ação de limpar). */
   hasSelection: boolean;
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

   /**
    * Volta ao default da tela: só o Total. É a MESMA rotina que a troca de ano
    * usa — um só conceito de "estado inicial", para o botão de limpar e a
    * troca de ano nunca divergirem.
    */
   const resetVisibility = useCallback(() => {
      setTotalVisible(true);
      setGroups({});
      setToggled({});
      setIsolated(null);
   }, []);

   // Reset síncrono na troca de ano (padrão React "state reset during render").
   const [prevAnoRef, setPrevAnoRef] = useState(anoRef);
   if (prevAnoRef !== anoRef) {
      setPrevAnoRef(anoRef);
      resetVisibility();
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

   // Só desfaz o isolamento: o `toggled` por trás volta a valer, como no
   // segundo clique no nome. Não confundir com `resetVisibility`.
   const onClearIsolated = () => setIsolated(null);

   const visibility = useMemo<HistoricoVisibility>(
      () => ({ totalVisible, groups, toggled, isolated }),
      [totalVisible, groups, toggled, isolated]
   );

   // Desviou do default (só o Total) por qualquer via? Os records guardam
   // `false` depois de ligar e desligar, então conta VALOR true, não chave.
   const hasSelection =
      !totalVisible ||
      isolated !== null ||
      Object.values(groups).some(Boolean) ||
      Object.values(toggled).some(Boolean);

   return {
      visibility,
      onToggleTotal,
      onToggleGroup,
      onTogglePrograma,
      onIsolate,
      onClearIsolated,
      onResetVisibility: resetVisibility,
      hasSelection,
   };
}
