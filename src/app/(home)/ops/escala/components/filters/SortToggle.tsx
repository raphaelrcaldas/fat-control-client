import clsx from "clsx";
import { Label } from "flowbite-react";
import type { EscalaSort } from "../../types";

interface SortToggleProps {
   value: EscalaSort;
   onChange: (s: EscalaSort) => void;
}

export function SortToggle({ value, onChange }: SortToggleProps) {
   return (
      <div className="md:col-span-3">
         <Label className="block text-[10px] font-bold tracking-widest text-slate-600 uppercase">
            Ordenação
         </Label>
         <div
            role="group"
            aria-label="Ordenação"
            className="mt-2 inline-flex rounded-md border border-slate-300 bg-slate-100 p-0.5"
         >
            <SortButton
               active={value === "horas_voo"}
               onClick={() => onChange("horas_voo")}
               label="Horas de voo"
            />
            <SortButton
               active={value === "quads_asc"}
               onClick={() => onChange("quads_asc")}
               label="Quadrinhos"
            />
         </div>
      </div>
   );
}

interface SortButtonProps {
   active: boolean;
   onClick: () => void;
   label: string;
}

function SortButton({ active, onClick, label }: SortButtonProps) {
   return (
      <button
         type="button"
         onClick={onClick}
         aria-pressed={active}
         className={clsx(
            // Media 23,5px de altura (11px × 1.5 + py-1) com gap ZERO entre os
            // dois botões — abaixo do piso de 24px do WCAG 2.5.8 e sem direito
            // à exceção de espaçamento, porque estão colados. No mouse cresce
            // meio pixel; no dedo vai a 44.
            "inline-flex min-h-[24px] items-center justify-center rounded-sm px-2.5 py-1 text-[11px] font-bold tracking-wider whitespace-nowrap uppercase transition-colors pointer-coarse:min-h-[44px]",
            active
               ? "bg-white text-slate-900 shadow-sm"
               : // `slate-500` sobre o `slate-100` do trilho dava 4,34:1.
                 "text-slate-600 pointer-fine:hover:text-slate-800"
         )}
      >
         {label}
      </button>
   );
}
