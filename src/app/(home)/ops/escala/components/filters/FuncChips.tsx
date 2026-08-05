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
                        // Chip de seleção segue o tema da org (`primary-*`):
                        // `red-*` fica reservado a perigo/exclusão, e cravado
                        // virava a única mancha vermelha numa org de tema
                        // azul. Hover sob `pointer-fine` porque no dedo o
                        // estado gruda depois do toque.
                        // Anel de foco em slate-900 com offset, não em
                        // `primary-*`: no chip SELECIONADO o preenchimento já é
                        // primary, e o anel padrão sumia — medido, a diferença
                        // de pixel entre focado e não-focado era ZERO. O offset
                        // joga o anel sobre o branco da página, então serve aos
                        // dois estados.
                        "inline-flex items-center justify-center gap-1.5 rounded-md border px-2.5 py-1 transition-colors select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 pointer-coarse:min-h-[44px]",
                        checked
                           ? "border-primary-700 bg-primary-600 pointer-fine:hover:bg-primary-700 text-white shadow-sm"
                           : "border-slate-300 bg-white text-slate-700 pointer-fine:hover:border-slate-400 pointer-fine:hover:bg-slate-50"
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
