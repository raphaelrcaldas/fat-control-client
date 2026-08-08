"use client";

import clsx from "clsx";
import { Label, TextInput } from "flowbite-react";
import { HiOutlineCube, HiX } from "react-icons/hi";

import type { HeavyCdsTipo } from "../../context/types";

import { BrancoToggle } from "./BrancoToggle";
import {
   inlineLabelClass,
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
   // Branco = nada largado. Sem largada nao existe ponto de impacto, por
   // isso dist/radial ficam zerados e travados enquanto o chip esta ativo.
   const isBranco = item.peso === 0;

   return (
      <div className="inline-flex flex-wrap items-center gap-3 rounded border border-red-200 bg-red-50/40 px-3 py-1.5 shadow-sm">
         {/* Cabeçalho */}
         <div className="inline-flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-red-100 text-red-600">
               <HiOutlineCube className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-gray-800">
               Lançamento de Carga
            </span>
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
               #{index + 1}
            </span>
         </div>

         {/* Tipo */}
         <div className="inline-flex items-center gap-2">
            <Label className={inlineLabelClass}>Tipo</Label>
            <div className="flex overflow-hidden rounded-md border border-red-200">
               {HVY_TIPOS.map(({ v, l }, i) => (
                  <button
                     key={v}
                     type="button"
                     onClick={() => onChange({ tipo: v })}
                     className={clsx(
                        "w-16 px-2 py-1.75 text-xs font-bold focus:outline-none",
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

         {/* Lançamento em branco (peso 0): procedimento feito, nada largado */}
         <BrancoToggle
            active={isBranco}
            onToggle={() =>
               onChange(
                  isBranco
                     ? { peso: null, dist: null, radial: null }
                     : { peso: 0, dist: 0, radial: 0 }
               )
            }
         />

         {/* Peso */}
         <div className="inline-flex items-center gap-2">
            <Label className={inlineLabelClass}>Peso (kg)</Label>
            <TextInput
               type="number"
               min={0}
               max={32767}
               value={item.peso ?? ""}
               color={
                  item.peso != null && item.peso >= 0 ? undefined : "failure"
               }
               onChange={(e) => {
                  const peso = parseIntOrNull(e.target.value, 0, 32767);
                  // Zerar o peso na mao equivale a marcar branco: o ponto
                  // de impacto deixa de existir e vai junto para 0.
                  onChange(
                     peso === 0 ? { peso, dist: 0, radial: 0 } : { peso }
                  );
               }}
               sizing="sm"
               className="w-20 text-center font-mono"
               placeholder="0+"
               title="Peso largado (0 = lançamento em branco)"
            />
         </div>

         {/* Distância */}
         <div className="inline-flex items-center gap-2">
            <Label className={inlineLabelClass}>Dist (m)</Label>
            <TextInput
               type="number"
               min={1}
               max={32767}
               disabled={isBranco}
               value={item.dist ?? ""}
               color={
                  isBranco || (item.dist != null && item.dist >= 1)
                     ? undefined
                     : "failure"
               }
               onChange={(e) =>
                  onChange({
                     dist: parseIntOrNull(e.target.value, 0, 32767),
                  })
               }
               sizing="sm"
               className="w-20 text-center font-mono"
               placeholder="≥1"
               title={
                  isBranco
                     ? "Lançamento em branco não tem ponto de impacto"
                     : "Mínimo 1"
               }
            />
         </div>

         {/* Radial */}
         <div className="inline-flex items-center gap-2">
            <Label className={inlineLabelClass}>Radial (°)</Label>
            <TextInput
               type="number"
               min={0}
               max={359}
               disabled={isBranco}
               value={item.radial ?? ""}
               color={isBranco || item.radial != null ? undefined : "failure"}
               onChange={(e) =>
                  onChange({
                     radial: parseIntOrNull(e.target.value, 0, 359),
                  })
               }
               sizing="sm"
               className="w-20 text-center font-mono"
               placeholder="0–359"
               title={
                  isBranco
                     ? "Lançamento em branco não tem ponto de impacto"
                     : "Informe um valor entre 0 e 359"
               }
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
