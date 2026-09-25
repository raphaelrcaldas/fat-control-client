"use client";

import { useId } from "react";
import clsx from "clsx";
import { Label, TextInput } from "flowbite-react";
import { HiOutlineCube, HiX } from "react-icons/hi";

import type { HeavyCdsTipo } from "../../context/types";

import { BrancoToggle } from "./BrancoToggle";
import {
   inlineLabelClass,
   parseIntOrNull,
   removeButtonClass,
   type HeavyCdsBlockProps,
} from "./types";
import { useTouchedFields } from "./useTouchedFields";

const HVY_TIPOS: { v: HeavyCdsTipo; l: string }[] = [
   { v: "heavy", l: "HEAVY" },
   { v: "cds", l: "CDS" },
];

export function HvyCdsBlock({
   item,
   index,
   onChange,
   onRemove,
   showErrors,
}: HeavyCdsBlockProps) {
   const id = useId();
   const { touch, showError } = useTouchedFields<"peso" | "dist" | "radial">(
      showErrors
   );

   // Branco = nada largado. Sem largada nao existe ponto de impacto, por
   // isso dist/radial ficam zerados e travados enquanto o chip esta ativo.
   const isBranco = item.peso === 0;

   return (
      // O remover fica fora do wrap: quando a largura nao comporta a linha,
      // os campos descem juntos e o X continua no canto, em vez de ir sozinho
      // para a segunda linha.
      <div className="flex items-start gap-3 rounded border border-red-200 bg-red-50/40 px-3 py-1.5 shadow-sm">
         <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2">
            {/* Cabeçalho: rotulo curto para caber numa linha na largura maxima do editor */}
            <div
               className="inline-flex items-center gap-2"
               title="Lançamento de Carga"
            >
               <span className="flex h-7 w-7 items-center justify-center rounded bg-red-100 text-red-600">
                  <HiOutlineCube className="h-4 w-4" />
               </span>
               <span className="text-sm font-semibold text-gray-800">
                  Carga
               </span>
               <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
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
                  className="flex overflow-hidden rounded-md border border-red-200"
               >
                  {HVY_TIPOS.map(({ v, l }, i) => (
                     <button
                        key={v}
                        type="button"
                        aria-pressed={item.tipo === v}
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

            {/* Peso, radial e distancia quebram como um grupo */}
            <div className="inline-flex items-center gap-3">
               {/* Peso */}
               <div className="inline-flex items-center gap-2">
                  <Label htmlFor={`${id}-peso`} className={inlineLabelClass}>
                     Peso (kg)
                  </Label>
                  <TextInput
                     id={`${id}-peso`}
                     type="number"
                     min={0}
                     max={32767}
                     value={item.peso ?? ""}
                     color={
                        showError("peso", item.peso == null)
                           ? "failure"
                           : undefined
                     }
                     onBlur={() => touch("peso")}
                     onChange={(e) => {
                        const peso = parseIntOrNull(e.target.value, 0, 32767);
                        if (peso === 0) {
                           // Zerar o peso na mao equivale a marcar branco: o
                           // ponto de impacto deixa de existir e vai para 0.
                           onChange({ peso, dist: 0, radial: 0 });
                        } else if (isBranco) {
                           // Saindo do branco: o 0/0 era do branco, nao foi
                           // informado. Sem limpar, o radial 0 passaria como
                           // valor valido que ninguem digitou.
                           onChange({ peso, dist: null, radial: null });
                        } else {
                           onChange({ peso });
                        }
                     }}
                     sizing="sm"
                     className="w-20 text-center font-mono"
                     placeholder="0+"
                     title="Peso largado (0 = lançamento em branco)"
                  />
               </div>

               {/* Radial */}
               <div className="inline-flex items-center gap-2">
                  <Label htmlFor={`${id}-radial`} className={inlineLabelClass}>
                     Radial (°)
                  </Label>
                  <TextInput
                     id={`${id}-radial`}
                     type="number"
                     min={0}
                     max={359}
                     disabled={isBranco}
                     value={item.radial ?? ""}
                     color={
                        showError("radial", !isBranco && item.radial == null)
                           ? "failure"
                           : undefined
                     }
                     onBlur={() => touch("radial")}
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

               {/* Distância */}
               <div className="inline-flex items-center gap-2">
                  <Label htmlFor={`${id}-dist`} className={inlineLabelClass}>
                     Dist (m)
                  </Label>
                  <TextInput
                     id={`${id}-dist`}
                     type="number"
                     min={1}
                     max={32767}
                     disabled={isBranco}
                     value={item.dist ?? ""}
                     color={
                        showError(
                           "dist",
                           !isBranco && (item.dist == null || item.dist < 1)
                        )
                           ? "failure"
                           : undefined
                     }
                     onBlur={() => touch("dist")}
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
            </div>
         </div>

         {/* Remover */}
         <button
            type="button"
            onClick={onRemove}
            className={removeButtonClass}
            aria-label={`Remover lançamento de carga ${index + 1}`}
            title="Remover lançamento"
         >
            <HiX className="h-5 w-5" />
         </button>
      </div>
   );
}
