"use client";

import clsx from "clsx";
import { Etapa } from "../../types";
import { calcularTempoVoo } from "../../transformers";
import { HelperText } from "flowbite-react";
import { useMemo, useEffect, useRef } from "react";

export interface EtapaFieldErrors {
   dataDecolagem?: boolean;
   horaDecolagem?: boolean;
   origem?: boolean;
   dataPouso?: boolean;
   horaPouso?: boolean;
   destino?: boolean;
   alternativa?: boolean;
   tempoVooAlternativa?: boolean;
   quantidadeCombustivel?: boolean;
   esforcoAereo?: boolean;
}

interface OrdemEtapaItemProps {
   etapa: Etapa;
   index: number;
   isEditable: boolean;
   canRemove: boolean;
   onChange: (field: string, value: string) => void;
   onRemove: () => void;
   onInsertAfter: () => void;
   fieldErrors?: EtapaFieldErrors;
}

// Arredonda hora para múltiplo de 5 minutos
const roundTimeToFiveMinutes = (time: string): string => {
   if (!time) return time;
   const [hours, minutes] = time.split(":").map(Number);
   const roundedMinutes = Math.round(minutes / 5) * 5;
   const finalMinutes = roundedMinutes === 60 ? 0 : roundedMinutes;
   const finalHours = roundedMinutes === 60 ? (hours + 1) % 24 : hours;
   return `${String(finalHours).padStart(2, "0")}:${String(
      finalMinutes
   ).padStart(2, "0")}`;
};

export function OrdemEtapaItem({
   etapa,
   index,
   isEditable,
   canRemove,
   onChange,
   onRemove,
   onInsertAfter,
   fieldErrors = {},
}: OrdemEtapaItemProps) {
   // Garantir valores definidos para evitar erro de controlled/uncontrolled
   const dataDecolagem = etapa.dataDecolagem ?? "";
   const horaDecolagem = etapa.horaDecolagem ?? "";
   const dataPouso = etapa.dataPouso ?? "";
   const horaPouso = etapa.horaPouso ?? "";
   const origem = etapa.origem ?? "";
   const destino = etapa.destino ?? "";
   const alternativa = etapa.alternativa ?? "";
   const tempoVooAlternativa = etapa.tempoVooAlternativa ?? "";
   const quantidadeCombustivel = etapa.quantidadeCombustivel ?? "";
   const esforcoAereo = etapa.esforcoAereo ?? "";

   const tempoVoo = calcularTempoVoo(
      dataDecolagem,
      horaDecolagem,
      dataPouso,
      horaPouso
   );

   // Ref para rastrear o último ajuste e evitar loop infinito
   const lastAdjustmentRef = useRef<string>("");

   // Auto-ajuste reativo: quando data decolagem > data pouso, ajustar data pouso
   useEffect(() => {
      // Só validar se campos necessários estiverem preenchidos e componente editável
      if (!isEditable || !dataDecolagem || !dataPouso) {
         return;
      }

      // Se data de decolagem for maior que data de pouso, ajustar data de pouso
      if (dataDecolagem > dataPouso) {
         const adjustmentKey = `data-${dataDecolagem}`;

         if (lastAdjustmentRef.current !== adjustmentKey) {
            lastAdjustmentRef.current = adjustmentKey;
            onChange("dataPouso", dataDecolagem);
         }
      } else {
         lastAdjustmentRef.current = "";
      }
   }, [dataDecolagem, dataPouso, isEditable]);

   // Auto-ajuste reativo: se mesma data mas hora decolagem >= hora pouso, ajustar hora
   useEffect(() => {
      // Só validar se todos os campos estiverem preenchidos e componente editável
      if (
         !isEditable ||
         !dataDecolagem ||
         !horaDecolagem ||
         !dataPouso ||
         !horaPouso
      ) {
         return;
      }

      // Se mesma data mas hora inválida, ajustar hora de pouso
      if (dataDecolagem === dataPouso && horaDecolagem >= horaPouso) {
         const [hours, minutes] = horaDecolagem.split(":").map(Number);
         const totalMinutes = hours * 60 + minutes + 5; // +5 minutos
         const newHours = Math.floor(totalMinutes / 60) % 24;
         const newMinutes = totalMinutes % 60;
         const newHoraPouso = `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}`;

         const adjustmentKey = `hora-${newHoraPouso}`;

         if (lastAdjustmentRef.current !== adjustmentKey) {
            lastAdjustmentRef.current = adjustmentKey;
            onChange("horaPouso", newHoraPouso);
         }
      } else {
         lastAdjustmentRef.current = "";
      }
   }, [dataDecolagem, horaDecolagem, dataPouso, horaPouso, isEditable]);

   // Validacao: decolagem nao pode ser posterior ao pouso
   const erroDataHora = useMemo(() => {
      // So valida se todos os campos estiverem preenchidos
      if (!dataDecolagem || !horaDecolagem || !dataPouso || !horaPouso) {
         return null;
      }

      const decolagem = new Date(`${dataDecolagem}T${horaDecolagem}`);
      const pouso = new Date(`${dataPouso}T${horaPouso}`);

      if (decolagem >= pouso) {
         return "A data/hora de decolagem deve ser anterior a data/hora de pouso.";
      }

      return null;
   }, [dataDecolagem, horaDecolagem, dataPouso, horaPouso]);

   // Validacao: tempo de voo da etapa deve ser >= 5 minutos
   const erroTempoVooEtapa = useMemo(() => {
      if (!dataDecolagem || !horaDecolagem || !dataPouso || !horaPouso) {
         return null;
      }

      const decolagem = new Date(`${dataDecolagem}T${horaDecolagem}`);
      const pouso = new Date(`${dataPouso}T${horaPouso}`);
      const diffMinutes = (pouso.getTime() - decolagem.getTime()) / 60000;

      if (diffMinutes > 0 && diffMinutes < 5) {
         return `Tempo de voo mínimo é 5 minutos (calculado: ${Math.floor(diffMinutes)} min).`;
      }

      return null;
   }, [dataDecolagem, horaDecolagem, dataPouso, horaPouso]);

   // Validacao: tempo de voo alternativa deve ser >= 5 minutos
   const erroTempoVooAlternativa = useMemo(() => {
      if (!tempoVooAlternativa) return null;

      const [hours, minutes] = tempoVooAlternativa.split(":").map(Number);
      const totalMinutes = (hours || 0) * 60 + (minutes || 0);

      if (totalMinutes > 0 && totalMinutes < 5) {
         return "Tempo de voo alternativa mínimo é 5 minutos.";
      }

      return null;
   }, [tempoVooAlternativa]);

   return (
      <div className="group relative rounded-lg border border-gray-200 bg-white p-4 text-center">
         <div className="absolute top-1/2 -left-3 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border-2 border-red-500 bg-white text-xs font-bold text-red-600">
            {index + 1}
         </div>

         <div className="flex items-start gap-3 overflow-x-auto">
            {/* Grupo Decolagem */}
            <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-2">
               <span className="mb-2 block text-xs font-semibold tracking-wide text-blue-700 uppercase">
                  Decolagem
               </span>
               <div className="flex gap-2">
                  <div>
                     <label className="mb-1 block text-xs font-medium text-gray-500">
                        Data
                     </label>
                     <input
                        type="date"
                        value={dataDecolagem}
                        onChange={(e) =>
                           onChange("dataDecolagem", e.target.value)
                        }
                        disabled={!isEditable}
                        className={clsx(
                           "w-36 rounded border bg-white px-2 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
                           fieldErrors.dataDecolagem
                              ? "border-red-400 focus:ring-red-500"
                              : "border-gray-300 focus:ring-blue-500"
                        )}
                     />
                  </div>
                  <div>
                     <label className="mb-1 block text-xs font-medium text-gray-500">
                        Hora (Z)
                     </label>
                     <input
                        type="time"
                        value={horaDecolagem}
                        onChange={(e) => {
                           const rounded = roundTimeToFiveMinutes(
                              e.target.value
                           );
                           onChange("horaDecolagem", rounded);
                        }}
                        disabled={!isEditable}
                        step="300"
                        className={clsx(
                           "w-20 rounded border bg-white px-2 py-2 text-center text-sm text-gray-900 focus:border-transparent focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
                           fieldErrors.horaDecolagem
                              ? "border-red-400 focus:ring-red-500"
                              : "border-gray-300 focus:ring-blue-500"
                        )}
                     />
                  </div>
                  <div>
                     <label className="mb-1 block text-xs font-medium text-gray-500">
                        Origem
                     </label>
                     <input
                        type="text"
                        value={origem}
                        onChange={(e) => {
                           const value = e.target.value.replace(
                              /[^a-zA-Z]/g,
                              ""
                           );
                           onChange("origem", value.toUpperCase());
                        }}
                        disabled={!isEditable}
                        placeholder="SBGL"
                        maxLength={4}
                        className={clsx(
                           "w-20 rounded border bg-white px-2 py-2 text-center font-mono text-sm text-gray-900 uppercase placeholder:text-gray-400 focus:border-transparent focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
                           fieldErrors.origem
                              ? "border-red-400 focus:ring-red-500"
                              : "border-gray-300 focus:ring-blue-500"
                        )}
                     />
                  </div>
               </div>
            </div>

            {/* Tempo de Voo (calculado) */}
            <div className="h-full rounded-lg border border-gray-200 bg-gray-50/50 p-2">
               <span className="mb-7 block text-xs font-semibold tracking-wide text-gray-700 uppercase">
                  T. Voo
               </span>
               <div className="flex h-9.5 w-16 items-center justify-center rounded border border-gray-300 bg-gray-50 font-mono text-sm font-medium text-gray-700 hover:cursor-not-allowed">
                  {tempoVoo}
               </div>
            </div>

            {/* Grupo Destino */}
            <div className="rounded-lg border border-green-200 bg-green-50/50 p-2">
               <span className="mb-2 block text-xs font-semibold tracking-wide text-green-700 uppercase">
                  Pouso
               </span>
               <div className="flex gap-2">
                  <div>
                     <label className="mb-1 block text-xs font-medium text-gray-500">
                        Data
                     </label>
                     <input
                        type="date"
                        value={dataPouso}
                        min={dataDecolagem}
                        onChange={(e) => onChange("dataPouso", e.target.value)}
                        disabled={!isEditable}
                        className={clsx(
                           "w-36 rounded border bg-white px-2 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
                           fieldErrors.dataPouso
                              ? "border-red-400 focus:ring-red-500"
                              : "border-gray-300 focus:ring-green-500"
                        )}
                     />
                  </div>
                  <div>
                     <label className="mb-1 block text-xs font-medium text-gray-500">
                        Hora (Z)
                     </label>
                     <input
                        type="time"
                        value={horaPouso}
                        onChange={(e) => {
                           const rounded = roundTimeToFiveMinutes(
                              e.target.value
                           );
                           onChange("horaPouso", rounded);
                        }}
                        disabled={!isEditable}
                        step="300"
                        className={clsx(
                           "w-20 rounded border bg-white px-2 py-2 text-center text-sm text-gray-900 focus:border-transparent focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
                           fieldErrors.horaPouso
                              ? "border-red-400 focus:ring-red-500"
                              : "border-gray-300 focus:ring-green-500"
                        )}
                     />
                  </div>
                  <div>
                     <label className="mb-1 block text-xs font-medium text-gray-500">
                        Destino
                     </label>
                     <input
                        type="text"
                        value={destino}
                        onChange={(e) => {
                           const value = e.target.value.replace(
                              /[^a-zA-Z]/g,
                              ""
                           );
                           onChange("destino", value.toUpperCase());
                        }}
                        disabled={!isEditable}
                        placeholder="SBBR"
                        maxLength={4}
                        className={clsx(
                           "w-20 rounded border bg-white px-2 py-2 text-center font-mono text-sm text-gray-900 uppercase placeholder:text-gray-400 focus:border-transparent focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
                           fieldErrors.destino
                              ? "border-red-400 focus:ring-red-500"
                              : "border-gray-300 focus:ring-green-500"
                        )}
                     />
                  </div>
               </div>
            </div>

            {/* Grupo Alternativa */}
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-2">
               <span className="mb-2 block text-xs font-semibold tracking-wide text-amber-700 uppercase">
                  Alternativa
               </span>
               <div className="flex gap-2">
                  <div>
                     <label className="mb-1 block text-xs font-medium text-gray-500">
                        ICAO<span className="text-red-500">*</span>
                     </label>
                     <input
                        type="text"
                        value={alternativa}
                        onChange={(e) => {
                           const value = e.target.value.replace(
                              /[^a-zA-Z]/g,
                              ""
                           );
                           onChange("alternativa", value.toUpperCase());
                        }}
                        disabled={!isEditable}
                        placeholder="SBSP"
                        maxLength={4}
                        className={clsx(
                           "w-20 rounded border bg-white px-2 py-2 text-center font-mono text-sm text-gray-900 uppercase placeholder:text-gray-400 focus:border-transparent focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
                           fieldErrors.alternativa
                              ? "border-red-400 focus:ring-red-500"
                              : "border-gray-300 focus:ring-amber-500"
                        )}
                     />
                  </div>
                  <div>
                     <label className="mb-1 block text-xs font-medium text-gray-500">
                        T. Alt.<span className="text-red-500">*</span>
                     </label>
                     <input
                        type="time"
                        value={tempoVooAlternativa}
                        onChange={(e) => {
                           const rounded = roundTimeToFiveMinutes(
                              e.target.value
                           );
                           onChange("tempoVooAlternativa", rounded);
                        }}
                        disabled={!isEditable}
                        step="300"
                        className={clsx(
                           "w-20 rounded border bg-white px-2 py-2 text-center text-sm text-gray-900 focus:border-transparent focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
                           fieldErrors.tempoVooAlternativa
                              ? "border-red-400 focus:ring-red-500"
                              : "border-gray-300 focus:ring-amber-500"
                        )}
                     />
                  </div>
               </div>
            </div>

            {/* Combustível */}
            <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-2">
               <span className="mb-7 block text-xs font-semibold tracking-wide text-purple-700 uppercase">
                  Combustível
               </span>
               <input
                  type="number"
                  min="1"
                  value={quantidadeCombustivel}
                  onChange={(e) => {
                     const value = e.target.value.replace(/[^0-9]/g, "");
                     if (value === "" || parseInt(value, 10) > 0) {
                        onChange("quantidadeCombustivel", value);
                     }
                  }}
                  disabled={!isEditable}
                  placeholder="1500"
                  className={clsx(
                     "w-24 rounded border bg-white px-2 py-2 text-center font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
                     fieldErrors.quantidadeCombustivel
                        ? "border-red-400 focus:ring-red-500"
                        : "border-gray-300 focus:ring-purple-500"
                  )}
               />
            </div>

            {/* Esforço Aéreo */}
            <div className="min-w-40 flex-1 rounded-lg border border-red-200 bg-red-50/50 p-2">
               <span className="mb-7 block text-xs font-semibold tracking-wide text-red-700 uppercase">
                  Esforço Aéreo
               </span>
               <input
                  type="text"
                  value={esforcoAereo}
                  onChange={(e) =>
                     onChange("esforcoAereo", e.target.value.toUpperCase())
                  }
                  disabled={!isEditable}
                  placeholder="ESFORÇO AÉREO ALOCADO"
                  className={clsx(
                     "w-full rounded border bg-white px-3 py-2 text-center text-sm text-gray-900 uppercase placeholder:text-gray-400 focus:border-transparent focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
                     fieldErrors.esforcoAereo
                        ? "border-red-400 focus:ring-red-500"
                        : "border-gray-300 focus:ring-red-500"
                  )}
               />
            </div>
         </div>

         {(erroDataHora || erroTempoVooEtapa || erroTempoVooAlternativa) && (
            <div className="mt-2 space-y-1 text-left">
               {erroDataHora && (
                  <HelperText color="failure">{erroDataHora}</HelperText>
               )}
               {erroTempoVooEtapa && (
                  <HelperText color="failure">{erroTempoVooEtapa}</HelperText>
               )}
               {erroTempoVooAlternativa && (
                  <HelperText color="failure">
                     {erroTempoVooAlternativa}
                  </HelperText>
               )}
            </div>
         )}

         {isEditable && (
            <>
               {canRemove && (
                  <button
                     type="button"
                     onClick={onRemove}
                     className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                  >
                     ×
                  </button>
               )}
               <button
                  type="button"
                  onClick={onInsertAfter}
                  title="Inserir etapa após esta"
                  className="absolute -bottom-4 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-blue-500 text-lg font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-blue-600"
               >
                  +
               </button>
            </>
         )}
      </div>
   );
}
