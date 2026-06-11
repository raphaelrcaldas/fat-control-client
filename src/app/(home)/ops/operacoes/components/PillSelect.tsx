"use client";

import clsx from "clsx";
import { Label } from "flowbite-react";

interface PillOption {
   value: string;
   label: string;
}

interface Props {
   label: string;
   required?: boolean;
   value: string;
   options: readonly PillOption[];
   /** Classe sólida aplicada à pill ativa, por valor (cor própria). */
   styles: Record<string, { active: string }>;
   onChange: (value: string) => void;
   error?: string;
}

/**
 * Segmented control: uma pill por opção, cada qual com cor própria quando
 * selecionada. Inativas ficam neutras. Acessível via radiogroup/radio.
 */
export function PillSelect({
   label,
   required,
   value,
   options,
   styles,
   onChange,
   error,
}: Props) {
   return (
      <div>
         <Label className="mb-1.5 block text-sm font-semibold">
            {label} {required && <span className="text-red-500">*</span>}
         </Label>
         <div
            role="radiogroup"
            aria-label={label}
            className={clsx(
               "grid auto-cols-fr grid-flow-col gap-1 rounded-lg border p-1",
               error
                  ? "border-red-400 bg-red-50/40"
                  : "border-gray-200 bg-gray-50"
            )}
         >
            {options.map((opt) => {
               const active = value === opt.value;
               return (
                  <button
                     key={opt.value}
                     type="button"
                     role="radio"
                     aria-checked={active}
                     onClick={() => onChange(opt.value)}
                     className={clsx(
                        "rounded-md px-2 py-1.5 text-sm font-semibold transition-colors",
                        active
                           ? styles[opt.value].active
                           : "text-slate-600 hover:bg-white hover:text-slate-900"
                     )}
                  >
                     {opt.label}
                  </button>
               );
            })}
         </div>
         {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
   );
}
