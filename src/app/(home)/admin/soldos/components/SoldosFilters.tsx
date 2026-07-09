import clsx from "clsx";
import { Checkbox, Label } from "flowbite-react";
import { CIRCULO_OPTIONS } from "../helpers/soldoHelpers";

interface SoldosFiltersProps {
   circulo: string;
   onCirculoChange: (value: string) => void;
   onlyActive: boolean;
   onOnlyActiveChange: (value: boolean) => void;
   disabled?: boolean;
}

export default function SoldosFilters({
   circulo,
   onCirculoChange,
   onlyActive,
   onOnlyActiveChange,
   disabled,
}: SoldosFiltersProps) {
   return (
      <div className="flex flex-wrap items-center gap-4">
         <div className="flex flex-wrap gap-2">
            {CIRCULO_OPTIONS.map((option) => (
               <button
                  key={option.value}
                  type="button"
                  onClick={() => onCirculoChange(option.value)}
                  disabled={disabled}
                  className={clsx(
                     "rounded border px-4 py-2 text-sm font-medium transition-colors",
                     circulo === option.value
                        ? "border-red-300 bg-red-50 text-red-700"
                        : "border-slate-200 bg-white text-gray-600 hover:bg-gray-50"
                  )}
               >
                  {option.label}
               </button>
            ))}
         </div>

         <div className="flex items-center gap-2 rounded border border-slate-200 bg-white px-4 py-2">
            <Checkbox
               id="onlyActive"
               checked={onlyActive}
               onChange={(e) => onOnlyActiveChange(e.target.checked)}
               disabled={disabled}
               color="red"
            />
            <Label htmlFor="onlyActive" className="cursor-pointer">
               Somente vigentes
            </Label>
         </div>
      </div>
   );
}
