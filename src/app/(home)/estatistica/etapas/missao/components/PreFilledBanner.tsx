"use client";

import { useEffect, useState } from "react";
import { HiInformationCircle, HiX } from "react-icons/hi";
import clsx from "clsx";

type Props = {
   message?: string;
   onDismiss: () => void;
   visible: boolean;
};

const DEFAULT_MESSAGE =
   "Pré-preenchido com base na etapa anterior — ajuste o que for necessário.";

export function PreFilledBanner({
   message = DEFAULT_MESSAGE,
   onDismiss,
   visible,
}: Props) {
   const [mounted, setMounted] = useState(false);
   useEffect(() => {
      if (visible) {
         const id = requestAnimationFrame(() => setMounted(true));
         return () => cancelAnimationFrame(id);
      }
      setMounted(false);
   }, [visible]);

   if (!visible) return null;

   return (
      <div
         role="status"
         className={clsx(
            "flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800",
            "transition-all duration-200 ease-out motion-reduce:transition-none",
            mounted ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
         )}
      >
         <HiInformationCircle
            className="mt-0.5 h-5 w-5 shrink-0 text-blue-500"
            aria-hidden
         />
         <p className="flex-1">{message}</p>
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
