"use client";
import { useSyncExternalStore } from "react";

const QUERY = "(min-width: 80rem)";
function subscribe(onChange: () => void) {
   const media = window.matchMedia(QUERY);
   media.addEventListener("change", onChange);
   return () => media.removeEventListener("change", onChange);
}
const getSnapshot = () => window.matchMedia(QUERY).matches;
const getServerSnapshot = () => false;

/** Evita carregar/montar o ApexCharts enquanto o gráfico está oculto. */
export function useSeboDesktop() {
   return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
