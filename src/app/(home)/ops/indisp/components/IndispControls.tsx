"use client";

import { Label, Select } from "flowbite-react";
import { DateNavigator } from "./DateNavigator";

interface FuncOption {
   value: string;
   label: string;
}

interface IndispControlsProps {
   func: string;
   funcOptions: FuncOption[];
   onFuncChange: (func: string) => void;
   onShift: (days: number, months: number) => void;
   onToday: () => void;
   canBack: boolean;
   canForward: boolean;
}

export function IndispControls({
   func,
   funcOptions,
   onFuncChange,
   onShift,
   onToday,
   canBack,
   canForward,
}: IndispControlsProps) {
   return (
      <div className="relative flex min-h-14 shrink-0 items-center justify-between gap-3 px-4 py-2 md:min-h-22">
         <div className="flex items-center gap-2">
            <Label htmlFor="indisp-func" className="text-sm">
               Função
            </Label>
            <Select
               id="indisp-func"
               className="w-36"
               value={func}
               onChange={(e) => onFuncChange(e.target.value)}
            >
               {funcOptions.map((f) => (
                  <option key={f.value} value={f.value}>
                     {f.label}
                  </option>
               ))}
            </Select>
         </div>

         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <DateNavigator
               onShift={onShift}
               onToday={onToday}
               canBack={canBack}
               canForward={canForward}
            />
         </div>
      </div>
   );
}
