"use client";

import { forwardRef, ChangeEvent, useState, useEffect } from "react";

interface DurationInputProps {
   value: string;
   onChange: (value: string) => void;
   disabled?: boolean;
   placeholder?: string;
   className?: string;
   roundMinutes?: boolean;
}

export const DurationInput = forwardRef<HTMLInputElement, DurationInputProps>(
   (
      {
         value,
         onChange,
         disabled,
         placeholder,
         className,
         roundMinutes = false,
      },
      ref
   ) => {
      const [localValue, setLocalValue] = useState(value);

      useEffect(() => {
         setLocalValue(value);
      }, [value]);

      const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
         const input = e.target.value;

         // Permite digitar livremente
         if (input === "") {
            setLocalValue("");
            onChange("");
            return;
         }

         // Remove tudo exceto dígitos e :
         const cleaned = input.replace(/[^\d:]/g, "");

         // Permite até 5 caracteres (HH:MM)
         if (cleaned.length <= 5) {
            setLocalValue(cleaned);
         }
      };

      const handleBlur = () => {
         if (!localValue) {
            onChange("");
            return;
         }

         // Remove tudo exceto dígitos
         const digits = localValue.replace(/\D/g, "");

         if (digits.length === 0) {
            setLocalValue("");
            onChange("");
            return;
         }

         let hours = 0;
         let minutes = 0;

         if (digits.length <= 2) {
            // Se digitou só 1 ou 2 dígitos, considera como horas
            hours = Math.min(parseInt(digits) || 0, 23);
         } else {
            // Se digitou 3 ou 4 dígitos, divide em horas e minutos
            hours = Math.min(parseInt(digits.slice(0, 2)) || 0, 23);
            minutes = Math.min(parseInt(digits.slice(2, 4)) || 0, 59);
         }

         // Arredonda minutos para múltiplo de 5 se necessário
         if (roundMinutes) {
            minutes = Math.round(minutes / 5) * 5;
            if (minutes === 60) {
               minutes = 0;
               hours = Math.min(hours + 1, 23);
            }
         }

         const formatted = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
         setLocalValue(formatted);
         onChange(formatted);
      };

      const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
         // Permite navegação e edição
         const allowedKeys = [
            "Backspace",
            "Delete",
            "ArrowLeft",
            "ArrowRight",
            "Tab",
         ];

         if (allowedKeys.includes(e.key)) {
            return;
         }

         // Permite apenas números e :
         if (!/[\d:]/.test(e.key)) {
            e.preventDefault();
         }
      };

      return (
         <input
            ref={ref}
            type="text"
            inputMode="numeric"
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            className={className}
         />
      );
   }
);

DurationInput.displayName = "DurationInput";
