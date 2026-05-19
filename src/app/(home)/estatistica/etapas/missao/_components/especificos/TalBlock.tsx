"use client";

import { Button } from "flowbite-react";
import { HiOutlineTruck } from "react-icons/hi";

import type { EspecificoBlockProps } from "./types";

export function TalBlock({ oiCount }: EspecificoBlockProps) {
   return (
      <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-3">
         <div className="mb-2 flex items-center gap-2">
            <HiOutlineTruck className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-800">
               Transporte Aéreo Logístico
            </span>
            <span className="text-xs text-gray-500">
               Carga geral ({oiCount} OI)
            </span>
            <Button color="light" size="xs" disabled className="ml-auto">
               + Transporte
            </Button>
         </div>
         <p className="text-sm text-gray-500 italic">Em breve.</p>
         {/* TODO: campos reais — fase 2 */}
      </div>
   );
}
