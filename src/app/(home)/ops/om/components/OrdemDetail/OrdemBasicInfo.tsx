"use client";

import { memo, useState, useEffect, useCallback, useMemo } from "react";
import clsx from "clsx";
import type { OrdemMissaoOut } from "services/routes/om/ordens";
import type { AeronavePublic } from "services/routes/aeronaves";
import { minutesToTime, timeToMinutes } from "utils/dateHandler";

/**
 * Componente de input para tempo no formato HH:MM
 * Usa estado local durante edição para evitar "saltos" de cursor
 */
interface TimeInputProps {
   value: number; // minutos
   onChange: (minutes: number) => void;
   disabled?: boolean;
   placeholder?: string;
   className?: string;
}

function TimeInput({
   value,
   onChange,
   disabled,
   placeholder = "00:00",
   className,
}: TimeInputProps) {
   const [displayValue, setDisplayValue] = useState(() => minutesToTime(value));
   const [isFocused, setIsFocused] = useState(false);

   // Sincroniza com valor externo quando não está em foco
   useEffect(() => {
      if (!isFocused) {
         setDisplayValue(minutesToTime(value));
      }
   }, [value, isFocused]);

   const formatTimeInput = useCallback((input: string): string => {
      // Remove tudo que não é dígito
      const digits = input.replace(/\D/g, "");

      if (digits.length === 0) return "";
      if (digits.length <= 2) return digits;
      if (digits.length <= 4) {
         return `${digits.slice(0, 2)}:${digits.slice(2)}`;
      }
      // Limita a 4 dígitos (HH:MM)
      return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
   }, []);

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatTimeInput(e.target.value);
      setDisplayValue(formatted);
   };

   const handleFocus = () => {
      setIsFocused(true);
   };

   const handleBlur = () => {
      setIsFocused(false);

      // Normaliza e valida o valor
      let finalValue = displayValue;

      // Se estiver incompleto, completa com zeros
      const digits = displayValue.replace(/\D/g, "");
      if (digits.length === 0) {
         finalValue = "00:00";
      } else if (digits.length <= 2) {
         finalValue = `${digits.padStart(2, "0")}:00`;
      } else if (digits.length <= 4) {
         const hours = digits.slice(0, 2).padStart(2, "0");
         const mins = digits.slice(2).padEnd(2, "0");
         finalValue = `${hours}:${mins}`;
      }

      // Valida minutos (máx 59)
      const [h, m] = finalValue.split(":").map(Number);
      const validMins = Math.min(m || 0, 59);
      finalValue = `${(h || 0).toString().padStart(2, "0")}:${validMins.toString().padStart(2, "0")}`;

      setDisplayValue(finalValue);
      onChange(timeToMinutes(finalValue));
   };

   return (
      <input
         type="text"
         inputMode="numeric"
         value={displayValue}
         onChange={handleChange}
         onFocus={handleFocus}
         onBlur={handleBlur}
         disabled={disabled}
         placeholder={placeholder}
         maxLength={5}
         className={className}
      />
   );
}

interface ValidationErrors {
   tipo: boolean;
   matriculaAeronave: boolean;
   etapas: boolean;
   piloto: boolean;
   mecanico: boolean;
   loadmaster: boolean;
}

interface OrdemBasicInfoProps {
   formData: OrdemMissaoOut;
   isEditable: boolean;
   onUpdate: (updates: Partial<OrdemMissaoOut>) => void;
   validationErrors?: ValidationErrors;
   aeronaves: AeronavePublic[];
}

export const OrdemBasicInfo = memo(function OrdemBasicInfo({
   formData,
   isEditable,
   onUpdate,
   validationErrors,
   aeronaves,
}: OrdemBasicInfoProps) {
   // Calcular o somatório de tempo de voo das etapas
   const somaTempoVooEtapas = useMemo(() => {
      if (!formData.etapas || formData.etapas.length === 0) return 0;
      return formData.etapas.reduce(
         (acc, etapa) => acc + (etapa.tvoo_etp || 0),
         0
      );
   }, [formData.etapas]);

   // Validar se esf_aer é menor que o somatório de tempo de voo
   const erroEsfAer = useMemo(() => {
      const esfAer = formData.esf_aer || 0;
      if (esfAer > 0 && esfAer < somaTempoVooEtapas) {
         return `Mínimo: ${minutesToTime(somaTempoVooEtapas)} (soma das etapas)`;
      }
      return null;
   }, [formData.esf_aer, somaTempoVooEtapas]);

   /**
    * Regra de negócio: O número da OM só pode ser editado em ordens aprovadas.
    * Em rascunhos, o número é "auto" e será gerado automaticamente na aprovação.
    * Após aprovada, o usuário pode corrigir o número se necessário.
    */
   const isNumeroEditable = isEditable && formData.status === "aprovada";

   return (
      <div className="flex gap-4">
         <div className="w-24">
            <label
               htmlFor="numero-om"
               className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-gray-600 uppercase"
            >
               Nº OM
            </label>
            <input
               id="numero-om"
               type="text"
               value={formData.numero === "auto" ? "" : formData.numero || ""}
               onChange={(e) =>
                  onUpdate({
                     // Sanitiza: apenas alfanuméricos e hífen
                     numero: e.target.value
                        .replace(/[^a-zA-Z0-9-]/g, "")
                        .toUpperCase(),
                  })
               }
               disabled={!isNumeroEditable}
               placeholder="AUTO"
               maxLength={10}
               aria-label="Número da Ordem de Missão"
               className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2.5 text-center font-mono text-gray-900 uppercase transition-all placeholder:text-gray-400 focus:border-red-400 focus:ring-2 focus:ring-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            />
         </div>
         <div className="flex-1">
            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-gray-600 uppercase">
               Documento Referência
            </label>
            <input
               type="text"
               value={formData.doc_ref || ""}
               onChange={(e) =>
                  onUpdate({
                     doc_ref: e.target.value.toUpperCase(),
                  })
               }
               disabled={!isEditable}
               placeholder="FIEX-001/2025"
               className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2.5 text-gray-900 uppercase transition-all placeholder:text-gray-400 focus:border-red-400 focus:ring-2 focus:ring-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            />
         </div>
         <div className="flex-1">
            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-gray-600 uppercase">
               Descrição da Missão
               <span className="text-red-500">*</span>
            </label>
            <input
               type="text"
               value={formData.tipo || ""}
               onChange={(e) =>
                  onUpdate({ tipo: e.target.value.toUpperCase() })
               }
               disabled={!isEditable}
               placeholder="EX: TRANSPORTE DE AUTORIDADE"
               className={clsx(
                  "w-full rounded-lg border-2 bg-white px-3 py-2.5 text-gray-900 uppercase transition-all placeholder:text-gray-400 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
                  validationErrors?.tipo
                     ? "border-red-300 focus:border-red-400 focus:ring-red-400"
                     : "border-gray-200 focus:border-red-400 focus:ring-red-400"
               )}
            />
         </div>
         <div className="w-42">
            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-gray-600 uppercase">
               Aeronave
               <span className="text-red-500">*</span>
            </label>
            <select
               value={formData.matricula_anv || ""}
               onChange={(e) =>
                  onUpdate({
                     matricula_anv: e.target.value || "",
                  })
               }
               disabled={!isEditable}
               className={clsx(
                  "w-full rounded-lg border-2 bg-white px-3 py-2.5 text-center text-gray-900 transition-all focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
                  validationErrors?.matriculaAeronave
                     ? "border-red-300 focus:border-red-400 focus:ring-red-400"
                     : "border-gray-200 focus:border-red-400 focus:ring-red-400"
               )}
            >
               <option value="" disabled>
                  Selecione...
               </option>
               {aeronaves.map((anv) => (
                  <option key={anv.matricula} value={anv.matricula}>
                     {anv.matricula}
                  </option>
               ))}
            </select>
         </div>
         <div className="w-fit">
            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-gray-600 uppercase">
               Esf. Aéreo
            </label>
            <TimeInput
               value={formData.esf_aer || 0}
               onChange={(minutes) => onUpdate({ esf_aer: minutes })}
               disabled={!isEditable}
               placeholder="00:00"
               className={clsx(
                  "w-28 rounded-lg border-2 bg-white px-3 py-2.5 text-center font-mono text-gray-900 transition-all placeholder:text-gray-400 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
                  erroEsfAer
                     ? "border-red-300 focus:border-red-400 focus:ring-red-400"
                     : "border-gray-200 focus:border-red-400 focus:ring-red-400"
               )}
            />
            {erroEsfAer && (
               <p className="mt-1 text-xs text-red-500">{erroEsfAer}</p>
            )}
         </div>
      </div>
   );
});
