"use client";
import { useEffect, useState } from "react";

const FALLBACK = "#475569";

/**
 * Converte `--primary-<tom>` (pode vir em oklch) para hex via canvas. O
 * fallback é atribuído antes: valor que o canvas não entende é ignorado em
 * silêncio e manteria a cor anterior (preto, na primeira vez).
 */
function readPrimaryHex(shade: number): string {
   const context = document
      .createElement("canvas")
      .getContext("2d", { willReadFrequently: true });
   if (!context) return FALLBACK;
   context.fillStyle = FALLBACK;
   context.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue(`--primary-${shade}`)
      .trim();
   context.fillRect(0, 0, 1, 1);
   const channels = context.getImageData(0, 0, 1, 1).data;
   return (
      "#" +
      Array.from(channels.slice(0, 3), (channel) =>
         channel.toString(16).padStart(2, "0")
      ).join("")
   );
}

/**
 * ApexCharts calcula tons em hexadecimal e não resolve var()/oklch do tema.
 * O gráfico carrega com `ssr: false`, então a cor já sai certa no primeiro
 * render (sem animar do cinza para a marca).
 */
export function useChartColor(shade = 600) {
   const [color, setColor] = useState(() => readPrimaryHex(shade));
   useEffect(() => {
      const observer = new MutationObserver(() =>
         setColor(readPrimaryHex(shade))
      );
      observer.observe(document.documentElement, {
         attributes: true,
         attributeFilter: ["data-org-theme"],
      });
      return () => observer.disconnect();
   }, [shade]);
   return color;
}
