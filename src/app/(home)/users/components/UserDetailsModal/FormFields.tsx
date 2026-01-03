/**
 * Componentes de campos de formulário validados e reutilizáveis
 */

import { Label, TextInput, Select } from "flowbite-react";
import clsx from "clsx";
import { onlyLettersKeyDown, onlyNumbersKeyDown } from "./utils";

// ========================================
// Tipos
// ========================================

interface ValidatedTextInputProps {
   label: string;
   name: string;
   register: any;
   error?: any;
   type?: "text" | "email" | "date" | "number";
   maxLength?: number;
   minLength?: number;
   icon?: any;
   validationType?: "letters" | "numbers" | "none";
   className?: string;
   min?: number;
   placeholder?: string;
}

interface ValidatedSelectProps {
   label: string;
   name: string;
   register: any;
   error?: any;
   options: { value: string; label: string }[];
   className?: string;
}

// ========================================
// Componente: TextInput Validado
// ========================================

export function ValidatedTextInput({
   label,
   name,
   register,
   error,
   type = "text",
   maxLength,
   minLength,
   icon,
   validationType = "none",
   className = "",
   min,
   placeholder,
}: ValidatedTextInputProps) {
   const onKeyDownHandler =
      validationType === "letters"
         ? onlyLettersKeyDown
         : validationType === "numbers"
           ? onlyNumbersKeyDown
           : undefined;

   return (
      <div className={className}>
         <Label htmlFor={name}>{label}</Label>
         <TextInput
            id={name}
            {...register(name)}
            type={type}
            autoComplete="off"
            maxLength={maxLength}
            minLength={minLength}
            min={min}
            icon={icon}
            placeholder={placeholder}
            onKeyDown={onKeyDownHandler}
            className={clsx({
               "focus:border-red-500 focus:ring-red-500": error,
            })}
         />
         {error && (
            <span className="text-xs text-red-600">
               {typeof error?.message === "string"
                  ? error.message
                  : "Campo inválido"}
            </span>
         )}
      </div>
   );
}

// ========================================
// Componente: Select Validado
// ========================================

export function ValidatedSelect({
   label,
   name,
   register,
   error,
   options,
   className = "",
}: ValidatedSelectProps) {
   return (
      <div className={className}>
         <Label htmlFor={name}>{label}</Label>
         <Select
            id={name}
            defaultValue=""
            {...register(name)}
            className={clsx({
               "focus:border-red-500 focus:ring-red-500": error,
            })}
         >
            <option value="" disabled>
               Selecione...
            </option>
            {options.map((opt) => (
               <option key={opt.value} value={opt.value}>
                  {opt.label}
               </option>
            ))}
         </Select>
         {error && (
            <span className="text-xs text-red-600">
               {typeof error?.message === "string"
                  ? error.message
                  : "Campo inválido"}
            </span>
         )}
      </div>
   );
}
