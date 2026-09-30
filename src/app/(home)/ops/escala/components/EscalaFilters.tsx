"use client";
import { useAuth } from "@/app/context/auth";
import { DateRangeFields } from "./filters/DateRangeFields";
import { QuadTipoSelect } from "./filters/QuadTipoSelect";
import { SortToggle } from "./filters/SortToggle";
import { FuncChips } from "./filters/FuncChips";
import type { EscalaFiltersState } from "../types";

interface EscalaFiltersProps {
   value: EscalaFiltersState;
   onChange: (next: EscalaFiltersState) => void;
   /** Só na 1ª carga (sem dado); no refetch fica habilitado. */
   disabled?: boolean;
}

export function EscalaFilters({
   value,
   onChange,
   disabled = false,
}: EscalaFiltersProps) {
   // A sigla vem da org ativa — estava cravada como "1º/1º GT", que qualquer
   // outra unidade via no próprio painel de filtro.
   const { activeOrg } = useAuth();

   return (
      <div className="rounded border border-slate-200 bg-white shadow-sm">
         <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-2">
            {/* Era `slate-400` (2,63:1) — o tracking largo a 10px já é o pior
                caso de legibilidade da tela. */}
            <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-slate-500 uppercase">
               Briefing
            </span>
            <div className="h-px flex-1 bg-slate-200" />
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-slate-500 uppercase">
               <span>
                  Setor de Escala
                  {activeOrg && (
                     <>
                        <span className="mx-1 text-slate-300">·</span>
                        {activeOrg.toUpperCase()}
                     </>
                  )}
               </span>
            </div>
         </div>

         <div className="grid grid-cols-1 gap-3 px-4 py-3 md:grid-cols-12">
            <DateRangeFields
               value={value}
               onChange={onChange}
               disabled={disabled}
            />
            <QuadTipoSelect
               value={value}
               onChange={onChange}
               disabled={disabled}
            />
            <SortToggle
               value={value.sort}
               onChange={(s) => onChange({ ...value, sort: s })}
               disabled={disabled}
            />
            <FuncChips value={value} onChange={onChange} disabled={disabled} />
         </div>
      </div>
   );
}
