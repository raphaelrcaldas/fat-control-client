"use client";

import { Label, TextInput } from "flowbite-react";
import { FaGasPump } from "react-icons/fa";
import { HiX } from "react-icons/hi";

import {
   especificoLabelClass,
   parseIntOrNull,
   type RevoBlockProps,
} from "./types";

export function RevoBlock({ item, index, onChange, onRemove }: RevoBlockProps) {
   return (
      <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-3">
         <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-600">
               <FaGasPump className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-gray-800">
               Reabastecimento Aéreo
            </span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
               #{index + 1}
            </span>
            <button
               type="button"
               onClick={onRemove}
               className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600"
               title="Remover REVO"
            >
               <HiX className="h-5 w-5" />
            </button>
         </div>

         <div className="grid grid-cols-1 gap-3 sm:grid-cols-[200px]">
            <div className="flex flex-col text-left">
               <Label className={especificoLabelClass}>
                  Combustível transferido (L)
               </Label>
               <TextInput
                  type="number"
                  min={1}
                  max={32767}
                  value={item.combTransf ?? ""}
                  color={
                     item.combTransf != null && item.combTransf >= 1
                        ? undefined
                        : "failure"
                  }
                  onChange={(e) =>
                     onChange({
                        combTransf: parseIntOrNull(e.target.value, 0, 32767),
                     })
                  }
                  sizing="sm"
                  className="text-center font-mono"
               />
               {(item.combTransf == null || item.combTransf < 1) && (
                  <p className="mt-1 text-xs text-red-600">Mínimo 1</p>
               )}
            </div>
         </div>
      </div>
   );
}
