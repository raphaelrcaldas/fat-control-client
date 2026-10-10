import type { CartaoStatus } from "../types";

export interface StatusColors {
   text: string;
   badgeBg: string;
   badgeBorder: string;
   dot: string;
}

// Paleta de status (4 estados × 4 tons) isolada aqui de propósito: é uma
// escala específica de validade, fora do tema Tailwind. Consumir sempre deste
// mapa — nunca espalhar hex pelos componentes.
export function getStatusColors(status: CartaoStatus): StatusColors {
   switch (status) {
      case "danger":
         return {
            text: "#A32D2D",
            badgeBg: "#FCEBEB",
            badgeBorder: "#F09595",
            dot: "#E24B4A",
         };
      case "warn":
         return {
            text: "#854F0B",
            badgeBg: "#FAEEDA",
            badgeBorder: "#EF9F27",
            dot: "#BA7517",
         };
      case "ok":
         return {
            text: "#3B6D11",
            badgeBg: "#EAF3DE",
            badgeBorder: "#97C459",
            dot: "#639922",
         };
      case "empty":
         return {
            // gray-600: o gray-500 sobre o fundo f3f4f6 dá 4,4:1 e reprova AA.
            text: "#4b5563",
            badgeBg: "#f3f4f6",
            badgeBorder: "#d1d5db",
            dot: "#9ca3af",
         };
   }
}
