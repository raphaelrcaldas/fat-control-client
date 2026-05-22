"use client";

import clsx from "clsx";
import { Label, TextInput } from "flowbite-react";
import { HiOutlineCube, HiX } from "react-icons/hi";

import type { HeavyCdsTipo } from "../../_state/types";

import {
   especificoLabelClass,
   parseIntOrNull,
   type HeavyCdsBlockProps,
} from "./types";

const HVY_TIPOS: { v: HeavyCdsTipo; l: string }[] = [
   { v: "heavy", l: "HEAVY" },
   { v: "cds", l: "CDS" },
];

export function HvyCdsBlock({
   item,
   index,
   onChange,
   onRemove,
}: HeavyCdsBlockProps) {
   return (
      <div className="rounded-lg border border-red-200 bg-red-50/40 p-3">
         <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-600">
               <HiOutlineCube className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-gray-800">
               Lançamento de Carga
            </span>
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
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

         <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="flex flex-col text-left">
               <Label className={especificoLabelClass}>Tipo</Label>
               <div className="flex overflow-hidden rounded-md border border-red-200">
                  {HVY_TIPOS.map(({ v, l }, i) => (
                     <button
                        key={v}
                        type="button"
                        onClick={() => onChange({ tipo: v })}
                        className={clsx(
                           "flex-1 px-2 py-[7px] text-xs font-bold focus:outline-none",
                           item.tipo === v
                              ? "bg-red-800 text-white"
                              : "bg-white text-red-500 hover:bg-red-100",
                           i !== 0 && "border-l border-red-200"
                        )}
                     >
                        {l}
                     </button>
                  ))}
               </div>
            </div>

            <div className="flex flex-col text-left">
               <Label className={especificoLabelClass}>Peso (kg)</Label>
               <TextInput
                  type="number"
                  min={1}
                  max={32767}
                  value={item.peso ?? ""}
                  color={
                     item.peso != null && item.peso >= 1 ? undefined : "failure"
                  }
                  onChange={(e) =>
                     onChange({
                        peso: parseIntOrNull(e.target.value, 0, 32767),
                     })
                  }
                  sizing="sm"
                  className="text-center font-mono"
               />
               {(item.peso == null || item.peso < 1) && (
                  <p className="mt-1 text-xs text-red-600">Mínimo 1</p>
               )}
            </div>

            <div className="flex flex-col text-left">
               <Label className={especificoLabelClass}>Distância (m)</Label>
               <TextInput
                  type="number"
                  min={1}
                  max={32767}
                  value={item.dist ?? ""}
                  color={
                     item.dist != null && item.dist >= 1 ? undefined : "failure"
                  }
                  onChange={(e) =>
                     onChange({
                        dist: parseIntOrNull(e.target.value, 0, 32767),
                     })
                  }
                  sizing="sm"
                  className="text-center font-mono"
               />
               {(item.dist == null || item.dist < 1) && (
                  <p className="mt-1 text-xs text-red-600">Mínimo 1</p>
               )}
            </div>

            <div className="flex flex-col text-left">
               <Label className={especificoLabelClass}>Radial (°)</Label>
               <TextInput
                  type="number"
                  min={0}
                  max={359}
                  value={item.radial ?? ""}
                  color={item.radial != null ? undefined : "failure"}
                  onChange={(e) =>
                     onChange({
                        radial: parseIntOrNull(e.target.value, 0, 359),
                     })
                  }
                  sizing="sm"
                  className="text-center font-mono"
               />
               {item.radial == null && (
                  <p className="mt-1 text-xs text-red-600">0–359</p>
               )}
            </div>
         </div>
      </div>
   );
}
