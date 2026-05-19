"use client";

import { Button } from "flowbite-react";
import { HiOutlineRefresh } from "react-icons/hi";

import type { EspecificoBlockProps } from "./types";

export function RevoBlock({ oiCount }: EspecificoBlockProps) {
   return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50/40 p-3">
         <div className="mb-2 flex items-center gap-2">
            <HiOutlineRefresh className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-semibold text-gray-800">
               Reabastecimento Aéreo
            </span>
            <span className="text-xs text-gray-500">
               Transferência em voo ({oiCount} OI)
            </span>
            <Button color="light" size="xs" disabled className="ml-auto">
               + REVO
            </Button>
         </div>
         <p className="text-sm text-gray-500 italic">Em breve.</p>
         {/* TODO: campos reais — fase 2 */}
      </div>
   );
}
