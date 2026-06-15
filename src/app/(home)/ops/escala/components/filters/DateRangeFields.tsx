import { useMemo } from "react";
import { Label, TextInput } from "flowbite-react";
import { todayIso } from "@/../utils/dateHandler";
import type { EscalaFiltersState } from "../../types";

interface DateRangeFieldsProps {
   value: EscalaFiltersState;
   onChange: (next: EscalaFiltersState) => void;
}

export function DateRangeFields({ value, onChange }: DateRangeFieldsProps) {
   const today = useMemo(() => todayIso(), []);

   return (
      <>
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
      </>
   );
}
