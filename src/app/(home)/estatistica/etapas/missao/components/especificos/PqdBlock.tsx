"use client";

import clsx from "clsx";
import { Label, TextInput } from "flowbite-react";
import { GiParachute } from "react-icons/gi";
import { HiX } from "react-icons/hi";

import type { PqdTipo } from "../../context/types";

import { inlineLabelClass, parseIntOrNull, type PqdBlockProps } from "./types";

const PQD_TIPOS: { v: PqdTipo; l: string }[] = [
   { v: "PREC", l: "PREC" },
   { v: "LV", l: "LV" },
   { v: "VTC", l: "VTC" },
   { v: "LIVRE", l: "LIVRE" },
];

export function PqdBlock({ item, index, onChange, onRemove }: PqdBlockProps) {
   return (
      <div className="inline-flex flex-wrap items-center gap-6 rounded border border-green-200 bg-green-50/40 px-3 py-1.5 shadow-sm">
         {/* Cabeçalho */}
         <div className="inline-flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-green-100 text-green-600">
               <GiParachute className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-gray-800">
               Lançamento PQD
            </span>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
               #{index + 1}
            </span>
         </div>

         {/* Tipo */}
         <div className="inline-flex items-center gap-2">
            <Label className={inlineLabelClass}>Tipo</Label>
            <div className="flex overflow-hidden rounded-md border border-green-200">
               {PQD_TIPOS.map(({ v, l }, i) => (
                  <button
                     key={v}
                     type="button"
                     onClick={() => onChange({ tipo: v })}
                     className={clsx(
                        "w-14 px-2 py-1.75 text-xs font-bold focus:outline-none",
                        item.tipo === v
                           ? "bg-green-700 text-white"
                           : "bg-white text-green-600 hover:bg-green-100",
                        i !== 0 && "border-l border-green-200"
                     )}
                  >
                     {l}
                  </button>
               ))}
            </div>
         </div>

         {/* Quantidade */}
         <div className="inline-flex items-center gap-2">
            <Label className={inlineLabelClass}>qtd</Label>
            <TextInput
               type="number"
               min={0}
               max={32767}
               value={item.qtd ?? ""}
               color={item.qtd != null && item.qtd >= 0 ? undefined : "failure"}
               onChange={(e) =>
                  onChange({ qtd: parseIntOrNull(e.target.value, 0, 32767) })
               }
               sizing="sm"
               className="w-20 text-center font-mono"
               placeholder="0+"
               title="Informe a quantidade (0 = passagem em branco)"
            />
         </div>

         {/* Remover */}
         <button
            type="button"
            onClick={onRemove}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600"
            title="Remover lançamento"
         >
            <HiX className="h-5 w-5" />
         </button>
      </div>
   );
}
