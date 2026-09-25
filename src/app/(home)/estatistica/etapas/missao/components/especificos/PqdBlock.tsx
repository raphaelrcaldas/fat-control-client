"use client";

import { useId } from "react";
import clsx from "clsx";
import { Label, TextInput } from "flowbite-react";
import { GiParachute } from "react-icons/gi";
import { HiX } from "react-icons/hi";

import type { PqdTipo } from "../../context/types";

import { BrancoToggle } from "./BrancoToggle";
import {
   inlineLabelClass,
   parseIntOrNull,
   removeButtonClass,
   type PqdBlockProps,
} from "./types";
import { useTouchedFields } from "./useTouchedFields";

const PQD_TIPOS: { v: PqdTipo; l: string }[] = [
   { v: "PREC", l: "PREC" },
   { v: "LV", l: "LV" },
   { v: "VTC", l: "VTC" },
   { v: "LIVRE", l: "LIVRE" },
];

export function PqdBlock({
   item,
   index,
   onChange,
   onRemove,
   showErrors,
}: PqdBlockProps) {
   const id = useId();
   const { touch, showError } = useTouchedFields<"qtd">(showErrors);
   const isBranco = item.qtd === 0;

   return (
      // O remover fica fora do wrap: quando a largura nao comporta a linha,
      // os campos descem e o X continua no canto, em vez de ir sozinho para
      // a segunda linha.
      <div className="flex items-start gap-3 rounded border border-green-200 bg-green-50/40 px-3 py-1.5 shadow-sm">
         <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2">
            {/* Cabeçalho */}
            <div className="inline-flex items-center gap-2">
               <span className="flex h-7 w-7 items-center justify-center rounded bg-green-100 text-green-600">
                  <GiParachute className="h-4 w-4" />
               </span>
               <span className="text-sm font-semibold text-gray-800">PQD</span>
               <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                  #{index + 1}
               </span>
            </div>

            {/* Tipo */}
            <div className="inline-flex items-center gap-2">
               <Label id={`${id}-tipo`} className={inlineLabelClass}>
                  Tipo
               </Label>
               <div
                  role="group"
                  aria-labelledby={`${id}-tipo`}
                  className="flex overflow-hidden rounded-md border border-green-200"
               >
                  {PQD_TIPOS.map(({ v, l }, i) => (
                     <button
                        key={v}
                        type="button"
                        aria-pressed={item.tipo === v}
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

            {/* Passagem em branco (qtd 0): procedimento feito, nada largado */}
            <BrancoToggle
               active={isBranco}
               onToggle={() => onChange({ qtd: isBranco ? null : 0 })}
            />

            {/* Quantidade */}
            <div className="inline-flex items-center gap-2">
               <Label htmlFor={`${id}-qtd`} className={inlineLabelClass}>
                  qtd
               </Label>
               <TextInput
                  id={`${id}-qtd`}
                  type="number"
                  min={0}
                  max={32767}
                  value={item.qtd ?? ""}
                  color={
                     showError("qtd", item.qtd == null) ? "failure" : undefined
                  }
                  onBlur={() => touch("qtd")}
                  onChange={(e) =>
                     onChange({ qtd: parseIntOrNull(e.target.value, 0, 32767) })
                  }
                  sizing="sm"
                  className="w-20 text-center font-mono"
                  placeholder="0+"
                  title="Quantidade largada (0 = passagem em branco)"
               />
            </div>
         </div>

         {/* Remover */}
         <button
            type="button"
            onClick={onRemove}
            className={removeButtonClass}
            aria-label={`Remover lançamento PQD ${index + 1}`}
            title="Remover lançamento"
         >
            <HiX className="h-5 w-5" />
         </button>
      </div>
   );
}
