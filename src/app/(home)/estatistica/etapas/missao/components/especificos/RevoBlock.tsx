"use client";

import { useId } from "react";
import { Label, TextInput } from "flowbite-react";
import { FaGasPump } from "react-icons/fa";
import { HiX } from "react-icons/hi";

import {
   inlineLabelClass,
   parseIntOrNull,
   removeButtonClass,
   type RevoBlockProps,
} from "./types";
import { useTouchedFields } from "./useTouchedFields";

export function RevoBlock({
   item,
   index,
   onChange,
   onRemove,
   showErrors,
}: RevoBlockProps) {
   const id = useId();
   const { touch, showError } = useTouchedFields<"combTransf">(showErrors);

   return (
      // O remover fica fora do wrap: quando a largura nao comporta a linha,
      // os campos descem e o X continua no canto, em vez de ir sozinho para
      // a segunda linha.
      <div className="flex items-start gap-3 rounded border border-amber-200 bg-amber-50/40 px-3 py-1.5 shadow-sm">
         <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2">
            {/* Cabeçalho */}
            <div className="inline-flex items-center gap-2">
               <span className="flex h-7 w-7 items-center justify-center rounded bg-amber-100 text-amber-600">
                  <FaGasPump className="h-4 w-4" />
               </span>
               <span className="text-sm font-semibold text-gray-800">REVO</span>
               <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                  #{index + 1}
               </span>
            </div>

            {/* Combustível transferido */}
            <div className="inline-flex items-center gap-2">
               <Label htmlFor={`${id}-comb`} className={inlineLabelClass}>
                  Comb. transf (L)
               </Label>
               <TextInput
                  id={`${id}-comb`}
                  type="number"
                  min={1}
                  max={32767}
                  value={item.combTransf ?? ""}
                  color={
                     showError(
                        "combTransf",
                        item.combTransf == null || item.combTransf < 1
                     )
                        ? "failure"
                        : undefined
                  }
                  onBlur={() => touch("combTransf")}
                  onChange={(e) =>
                     onChange({
                        combTransf: parseIntOrNull(e.target.value, 0, 32767),
                     })
                  }
                  sizing="sm"
                  className="w-24 text-center font-mono"
                  placeholder="≥1"
                  title="Mínimo 1"
               />
            </div>
         </div>

         {/* Remover */}
         <button
            type="button"
            onClick={onRemove}
            className={removeButtonClass}
            aria-label={`Remover REVO ${index + 1}`}
            title="Remover REVO"
         >
            <HiX className="h-5 w-5" />
         </button>
      </div>
   );
}
