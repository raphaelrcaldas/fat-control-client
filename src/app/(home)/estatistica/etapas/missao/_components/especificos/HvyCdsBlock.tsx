"use client";

import { Button } from "flowbite-react";
import { HiOutlineCube } from "react-icons/hi";

import type { EspecificoBlockProps } from "./types";

export function HvyCdsBlock({ tipoMissaoCod, oiCount }: EspecificoBlockProps) {
   return (
      <div className="rounded-lg border border-red-200 bg-red-50/40 p-3">
         <div className="mb-2 flex items-center gap-2">
            <HiOutlineCube className="h-4 w-4 text-red-600" />
            <span className="text-sm font-semibold text-gray-800">
               Heavy / CDS
            </span>
            <span className="text-xs text-gray-500">
               Lançamento de carga pesada ({tipoMissaoCod} · {oiCount} OI)
            </span>
            <Button color="light" size="xs" disabled className="ml-auto">
               + Lançamento
            </Button>
         </div>
         <p className="text-sm text-gray-500 italic">Em breve.</p>
         {/* TODO: campos reais — fase 2 */}
      </div>
   );
}
