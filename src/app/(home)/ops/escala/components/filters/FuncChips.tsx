import clsx from "clsx";
import { Label } from "flowbite-react";
import { FUNCOES_PRINCIPAIS, getFuncLabel } from "@/constants";
import type { EscalaFiltersState } from "../../types";

interface FuncChipsProps {
   value: EscalaFiltersState;
   onChange: (next: EscalaFiltersState) => void;
}

export function FuncChips({ value, onChange }: FuncChipsProps) {
   const toggleFunc = (f: string) => {
      const next = value.funcs.includes(f)
         ? value.funcs.filter((x) => x !== f)
         : [...value.funcs, f];
      onChange({ ...value, funcs: next });
   };

   return (
      <div className="md:col-span-12">
         <Label className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
            Funções
         </Label>
         <div className="mt-1 flex flex-wrap gap-1.5">
            {FUNCOES_PRINCIPAIS.map((f) => {
               const checked = value.funcs.includes(f);
               return (
                  <button
                     key={f}
                     type="button"
                     onClick={() => toggleFunc(f)}
                     aria-pressed={checked}
                     className={clsx(
                        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 transition-colors select-none",
                        checked
                           ? "border-red-700 bg-red-600 text-white shadow-sm hover:bg-red-700"
                           : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                     )}
                  >
                     <span className="font-mono text-[10px] font-bold tracking-widest uppercase">
                        {getFuncLabel(f, true)}
                     </span>
                  </button>
               );
            })}
         </div>
      </div>
   );
}
