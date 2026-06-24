"use client";

import { useEffect, useRef } from "react";

interface UseSaveShortcutArgs {
   onSave: () => void;
   disabled: boolean;
}

/**
 * Atalho Ctrl/Cmd+S: dispara onSave (quando nao desabilitado) e previne o
 * "salvar pagina" do navegador. onSave e lido via ref para sempre chamar a
 * versao mais recente sem re-registrar o listener.
 */
export function useSaveShortcut({ onSave, disabled }: UseSaveShortcutArgs) {
   const onSaveRef = useRef(onSave);
   onSaveRef.current = onSave;

   useEffect(() => {
      function onKey(e: KeyboardEvent) {
         if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
            e.preventDefault();
            if (!disabled) onSaveRef.current();
         }
      }
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
   }, [disabled]);
}
