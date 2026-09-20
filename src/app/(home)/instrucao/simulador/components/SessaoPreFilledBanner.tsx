"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { HiInformationCircle, HiX } from "react-icons/hi";

interface SessaoPreFilledBannerProps {
   visible: boolean;
   onDismiss: () => void;
}

/**
 * Avisa que a sessão nasceu pré-preenchida com a anterior. Sem ele, campos já
 * populados parecem dados salvos: o usuário some com a diferença entre "isto
 * veio da sessão passada" e "isto é o que está no banco".
 */
export function SessaoPreFilledBanner({
   visible,
   onDismiss,
}: SessaoPreFilledBannerProps) {
   const [mounted, setMounted] = useState(false);

   useEffect(() => {
      if (!visible) {
         setMounted(false);
         return;
      }
      const id = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(id);
   }, [visible]);

   if (!visible) return null;

   return (
      <div
         role="status"
         className={clsx(
            "flex items-start gap-3 rounded border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 shadow-sm",
            "transition-all duration-200 ease-out motion-reduce:transition-none",
            mounted ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
         )}
      >
         <HiInformationCircle
            className="mt-0.5 h-5 w-5 shrink-0 text-blue-500"
            aria-hidden
         />
         <p className="flex-1">
            Pré-preenchido com a sessão anterior — confira a data e informe os
            horários.
         </p>
         <button
            type="button"
            onClick={onDismiss}
            aria-label="Dispensar aviso"
            className="rounded p-1 text-blue-500 transition hover:bg-blue-100 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-500"
         >
            <HiX className="h-4 w-4" />
         </button>
      </div>
   );
}
