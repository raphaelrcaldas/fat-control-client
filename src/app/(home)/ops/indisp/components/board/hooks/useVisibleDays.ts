"use client";

import { useSyncExternalStore } from "react";

/**
 * Quantos dias a janela mostra.
 *
 * A grade antiga sempre gerava 21 dias e escondia coluna por CSS
 * (`columnVisibility`). Com as faixas posicionadas em % da trilha isso deixou
 * de funcionar — uma coluna escondida não encolhe a trilha, ela desalinha a
 * faixa. Então a mesma escada de revelação progressiva passou a decidir
 * QUANTOS dias existem, e a largura de um dia fica ~constante entre telas
 * (é o que permite medir o rótulo da faixa em dias, e não em px).
 */
const STEPS = [
   { query: "(min-width: 1536px)", days: 21 },
   { query: "(min-width: 1280px)", days: 17 },
   { query: "(min-width: 1024px)", days: 14 },
   { query: "(min-width: 768px)", days: 10 },
];

const MIN_DAYS = 7;
const SSR_DAYS = 21;

function subscribe(onChange: () => void) {
   const listas = STEPS.map((s) => window.matchMedia(s.query));
   listas.forEach((m) => m.addEventListener("change", onChange));
   return () =>
      listas.forEach((m) => m.removeEventListener("change", onChange));
}

function getSnapshot(): number {
   const hit = STEPS.find((s) => window.matchMedia(s.query).matches);
   return hit ? hit.days : MIN_DAYS;
}

export function useVisibleDays(): number {
   return useSyncExternalStore(subscribe, getSnapshot, () => SSR_DAYS);
}
