"use client";

import { useSyncExternalStore } from "react";

/**
 * Quantos dias a janela do quadro mostra.
 *
 * Mesma escada progressiva de `ops/indisp`, com valores próprios e bem mais
 * baixos: lá a célula é uma faixa contínua e comporta 21 dias, aqui ela
 * carrega o par hora+rota ("1230Z SBGL - SBAF"), que precisa de ~132px para
 * não ser cortado. Como a grade não rola na horizontal (o arrasto navega no
 * tempo, e os dois gestos colidiriam), o número de dias é o que decide a
 * largura da coluna — medido com `table-fixed` na largura útil de cada
 * breakpoint.
 *
 * `useSyncExternalStore` em vez de `useState` + listener de `resize`: o
 * valor é lido do `matchMedia` no primeiro render, sem o flash de começar
 * num palpite e corrigir depois, e sem precisar de debounce — um
 * breakpoint dispara uma vez, não a cada pixel arrastado.
 */
const STEPS = [
   { query: "(min-width: 1536px)", days: 9 },
   { query: "(min-width: 1280px)", days: 7 },
   { query: "(min-width: 768px)", days: 5 },
];

// No celular a coluna da aeronave já come ~64px dos 360px: dois dias é o
// que sobra com a rota inteira legível.
const MIN_DAYS = 2;
const SSR_DAYS = 7;

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
