"use client";
import { Spinner } from "flowbite-react";
import { DateRangeFields } from "./filters/DateRangeFields";
import { QuadTipoSelect } from "./filters/QuadTipoSelect";
import { SortToggle } from "./filters/SortToggle";
import { FuncChips } from "./filters/FuncChips";
import type { EscalaFiltersState } from "../types";

interface EscalaFiltersProps {
   value: EscalaFiltersState;
   onChange: (next: EscalaFiltersState) => void;
   isFetching?: boolean;
}

export function EscalaFilters({
   value,
   onChange,
   isFetching = false,
}: EscalaFiltersProps) {
   return (
      <div className="mb-4 rounded border border-slate-200 bg-white shadow-sm">
         <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-2">
            <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-slate-400 uppercase">
               Briefing
            </span>
            <div className="h-px flex-1 bg-slate-200" />
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-slate-500 uppercase">
               {isFetching && <Spinner size="xs" color="failure" />}
               <span>
                  Setor de Escala
                  <span className="mx-1 text-slate-300">·</span>
                  1º/1º GT
               </span>
            </div>
         </div>

         <div className="grid grid-cols-1 gap-3 px-4 py-3 md:grid-cols-12">
            <DateRangeFields value={value} onChange={onChange} />
            <QuadTipoSelect value={value} onChange={onChange} />
            <SortToggle
               value={value.sort}
               onChange={(s) => onChange({ ...value, sort: s })}
            />
            <FuncChips value={value} onChange={onChange} />
         </div>
      </div>
   );
}
