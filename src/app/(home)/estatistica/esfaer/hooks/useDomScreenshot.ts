import { useCallback, useState } from "react";
import { domToPng } from "modern-screenshot";
import { useToast } from "@/app/context/toast";

/**
 * Captura um nó do DOM como PNG e dispara o download. Desacopla a dependência
 * de `modern-screenshot` da UI, expondo apenas `capture` + `isCapturing`.
 */
export function useDomScreenshot() {
   const [isCapturing, setIsCapturing] = useState(false);
   const { push } = useToast();

   const capture = useCallback(
      async (node: HTMLElement | null, filename: string) => {
         if (!node) return;
         setIsCapturing(true);
         try {
            const dataUrl = await domToPng(node, {
               backgroundColor: "#ffffff",
               scale: 2,
            });
            const link = document.createElement("a");
            link.download = filename;
            link.href = dataUrl;
            link.click();
         } catch {
            push({ message: "Erro ao gerar imagem", type: "error" });
         } finally {
            setIsCapturing(false);
         }
      },
      [push]
   );

   return { capture, isCapturing };
}
