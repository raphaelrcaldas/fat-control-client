"use client";

import clsx from "clsx";
import { Label, TextInput } from "flowbite-react";
import { GiParachute } from "react-icons/gi";
import { HiX } from "react-icons/hi";

import type { PqdTipo } from "../../_state/types";

import {
   especificoLabelClass,
   parseIntOrNull,
   type PqdBlockProps,
} from "./types";

const PQD_TIPOS: { v: PqdTipo; l: string }[] = [
   { v: "VTC", l: "VTC" },
   { v: "LV", l: "LV" },
   { v: "PREC", l: "PREC" },
   { v: "LIVRE", l: "LIVRE" },
];

export function PqdBlock({ item, index, onChange, onRemove }: PqdBlockProps) {
   return (
      <div className="rounded-lg border border-purple-200 bg-purple-50/40 p-3">
         <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-purple-600">
               <GiParachute className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-gray-800">
               Lançamento de Paraquedista
            </span>
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700">
               #{index + 1}
            </span>
            <button
               type="button"
               onClick={onRemove}
               className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600"
               title="Remover lançamento"
            >
               <HiX className="h-5 w-5" />
            </button>
         </div>

         <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_120px]">
            <div className="flex flex-col text-left">
               <Label className={especificoLabelClass}>Tipo</Label>
               <div className="flex overflow-hidden rounded-md border border-purple-200">
                  {PQD_TIPOS.map(({ v, l }, i) => (
                     <button
                        key={v}
                        type="button"
                        onClick={() => onChange({ tipo: v })}
                        className={clsx(
                           "flex-1 px-2 py-1.75 text-xs font-bold focus:outline-none",
                           item.tipo === v
                              ? "bg-purple-700 text-white"
                              : "bg-white text-purple-600 hover:bg-purple-100",
                           i !== 0 && "border-l border-purple-200"
                        )}
                     >
                        {l}
                     </button>
                  ))}
               </div>
            </div>

            <div className="flex flex-col text-left">
               <Label className={especificoLabelClass}>Quantidade</Label>
               <TextInput
                  type="number"
                  min={0}
                  max={32767}
                  value={item.qtd ?? ""}
                  color={
                     item.qtd != null && item.qtd >= 0 ? undefined : "failure"
                  }
                  onChange={(e) =>
                     onChange({ qtd: parseIntOrNull(e.target.value, 0, 32767) })
                  }
                  sizing="sm"
                  className="text-center font-mono"
               />
               {(item.qtd == null || item.qtd < 0) && (
                  <p className="mt-1 text-xs text-red-600">
                     Informe a quantidade (0 = passagem em branco)
                  </p>
               )}
            </div>
         </div>
      </div>
   );
}
