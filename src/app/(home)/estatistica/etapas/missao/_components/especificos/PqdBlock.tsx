"use client";

import { Button } from "flowbite-react";
import { GiParachute } from "react-icons/gi";

import type { EspecificoBlockProps } from "./types";

export function PqdBlock({ oiCount }: EspecificoBlockProps) {
   return (
      <div className="rounded-lg border border-purple-200 bg-purple-50/40 p-3">
         <div className="mb-2 flex items-center gap-2">
            <GiParachute className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold text-gray-800">
               Lançamento de Paraquedista
            </span>
            <span className="text-xs text-gray-500">
               Circuitos na ZL ({oiCount} OI)
            </span>
            <Button color="light" size="xs" disabled className="ml-auto">
               + Circuito
            </Button>
         </div>
         <p className="text-sm text-gray-500 italic">Em breve.</p>
         {/* TODO: campos reais — fase 2 */}
      </div>
   );
}
