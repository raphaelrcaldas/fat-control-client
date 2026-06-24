"use client";

import { HiOutlineClipboardList } from "react-icons/hi";

export function EmptyEtapaPlaceholder() {
   return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
         <HiOutlineClipboardList
            className="h-10 w-10 text-gray-300"
            aria-hidden
         />
         <p className="text-sm font-medium text-gray-600">
            Selecione uma etapa
         </p>
         <p className="max-w-xs text-xs text-gray-400">
            Escolha uma etapa na barra lateral, ou clique em &quot;Nova
            etapa&quot; para começar.
         </p>
      </div>
   );
}
