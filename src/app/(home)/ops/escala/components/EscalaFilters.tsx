"use client";
import clsx from "clsx";
import { useMemo } from "react";
import { Label, Select, Spinner, TextInput } from "flowbite-react";
import { useQuadsTypes } from "@/hooks/queries/useQuads";
import { todayIso } from "@/../utils/dateHandler";
import { FUNCOES_PRINCIPAIS, getFuncLabel } from "@/constants";
import type { EscalaSort } from "services/routes/ops/escala";

const ELIGIBLE_GROUPS = new Set(["sobr", "nasc", "local", "inter"]);

export interface EscalaFiltersState {
   date_start: string;
   date_end: string;
   tipo_quad_id: number | null;
   funcs: string[];
   sort: EscalaSort;
}

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
   const { data: quadsType = [], isLoading } = useQuadsTypes("11gt");
   const today = useMemo(() => todayIso(), []);

   const eligibleGroups = useMemo(
      () => quadsType.filter((g) => ELIGIBLE_GROUPS.has(g.short)),
      [quadsType]
   );

   const toggleFunc = (f: string) => {
      const next = value.funcs.includes(f)
         ? value.funcs.filter((x) => x !== f)
         : [...value.funcs, f];
      onChange({ ...value, funcs: next });
   };

   return (
      <div className="mb-4 rounded-xl border border-slate-300 bg-white shadow-sm">
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
            <div className="md:col-span-3">
               <Label
                  htmlFor="esc-date-start"
                  className="text-[10px] font-bold tracking-widest text-slate-600 uppercase"
               >
                  Início
               </Label>
               <TextInput
                  id="esc-date-start"
                  type="date"
                  min={today}
                  value={value.date_start}
                  onChange={(e) => {
                     const nextStart = e.target.value;
                     const nextEnd =
                        value.date_end && value.date_end < nextStart
                           ? nextStart
                           : value.date_end;
                     onChange({
                        ...value,
                        date_start: nextStart,
                        date_end: nextEnd,
                     });
                  }}
                  className="font-mono tabular-nums"
               />
            </div>

            <div className="md:col-span-3">
               <Label
                  htmlFor="esc-date-end"
                  className="text-[10px] font-bold tracking-widest text-slate-600 uppercase"
               >
                  Fim
               </Label>
               <TextInput
                  id="esc-date-end"
                  type="date"
                  min={value.date_start || today}
                  value={value.date_end}
                  onChange={(e) =>
                     onChange({ ...value, date_end: e.target.value })
                  }
                  className="font-mono tabular-nums"
               />
            </div>

            <div className="md:col-span-3">
               <Label
                  htmlFor="esc-tipo"
                  className="text-[10px] font-bold tracking-widest text-slate-600 uppercase"
               >
                  Quadrinho
               </Label>
               <Select
                  id="esc-tipo"
                  value={value.tipo_quad_id ?? ""}
                  onChange={(e) =>
                     onChange({
                        ...value,
                        tipo_quad_id: e.target.value
                           ? parseInt(e.target.value, 10)
                           : null,
                     })
                  }
                  disabled={isLoading}
               >
                  <option value="">— Selecionar —</option>
                  {eligibleGroups.map((group) => (
                     <optgroup key={group.id} label={group.long.toUpperCase()}>
                        {group.types.map((t) => (
                           <option key={t.id} value={t.id}>
                              {t.long.toUpperCase()}
                           </option>
                        ))}
                     </optgroup>
                  ))}
               </Select>
            </div>

            <div className="md:col-span-3">
               <Label
                  htmlFor="esc-sort"
                  className="text-[10px] font-bold tracking-widest text-slate-600 uppercase"
               >
                  Ordenação
               </Label>
               <div id="esc-sort" className="mt-1">
                  <SortToggle
                     value={value.sort}
                     onChange={(s) => onChange({ ...value, sort: s })}
                  />
               </div>
            </div>

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
         </div>
      </div>
   );
}

interface SortToggleProps {
   value: EscalaSort;
   onChange: (s: EscalaSort) => void;
}

function SortToggle({ value, onChange }: SortToggleProps) {
   return (
      <div className="mt-1 inline-flex rounded-md border border-slate-300 bg-slate-100 p-0.5">
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
