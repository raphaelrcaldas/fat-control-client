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
            "rounded-sm px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase transition-colors",
            active
               ? "bg-white text-slate-900 shadow-sm"
               : "text-slate-500 hover:text-slate-700"
         )}
      >
         {label}
      </button>
   );
}
