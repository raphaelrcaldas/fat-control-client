"use client";

import { memo, useMemo, useEffect, useRef } from "react";
import clsx from "clsx";
import type { EtapaOut } from "services/routes/om/ordens";
import {
   extractDate,
   extractTime,
   toIsoDatetime,
   minutesToTime,
   calcularTempoVooMinutos,
} from "utils/dateHandler";
import { HelperText } from "flowbite-react";

export interface EtapaFieldErrors {
   dt_dep?: boolean;
   origem?: boolean;
   dt_arr?: boolean;
   dest?: boolean;
   alternativa?: boolean;
   tvoo_alt?: boolean;
   qtd_comb?: boolean;
   esf_aer?: boolean;
}

interface OrdemEtapaItemProps {
   etapa: EtapaOut;
   index: number;
   isEditable: boolean;
   canRemove: boolean;
   onChange: (field: string, value: string | number) => void;
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

export const OrdemEtapaItem = memo(function OrdemEtapaItem({
   etapa,
   index,
   isEditable,
   canRemove,
   onChange,
   onRemove,
   onInsertAfter,
   fieldErrors = {},
}: OrdemEtapaItemProps) {
   // Extrair data e hora dos campos ISO
   const dataDecolagem = extractDate(etapa.dt_dep || "");
   const horaDecolagem = extractTime(etapa.dt_dep || "");
   const dataPouso = extractDate(etapa.dt_arr || "");
   const horaPouso = extractTime(etapa.dt_arr || "");
   const origem = etapa.origem ?? "";
   const destino = etapa.dest ?? "";
   const alternativa = etapa.alternativa ?? "";
   const tempoVooAlternativa = minutesToTime(etapa.tvoo_alt || 0);
   const quantidadeCombustivel = etapa.qtd_comb ?? "";
   const esforcoAereo = etapa.esf_aer ?? "";

   // Tempo de voo calculado
   const tempoVoo = useMemo(() => {
      if (!etapa.dt_dep || !etapa.dt_arr) return "00:00";
      const minutes = calcularTempoVooMinutos(etapa.dt_dep, etapa.dt_arr);
      return minutesToTime(minutes);
   }, [etapa.dt_dep, etapa.dt_arr]);

   // Helper para atualizar datetime
   const updateDateTime = (
      field: "dt_dep" | "dt_arr",
      date: string,
      time: string
   ) => {
      const isoDatetime = toIsoDatetime(date, time);
      onChange(field, isoDatetime);
   };

   // Ref para rastrear o último ajuste e evitar loop infinito
   const lastAdjustmentRef = useRef<string>("");

   // Auto-ajuste reativo: quando data decolagem > data pouso, ajustar data pouso
   useEffect(() => {
      if (!isEditable || !dataDecolagem || !dataPouso) return;

      if (dataDecolagem > dataPouso) {
         const adjustmentKey = `data-${dataDecolagem}`;
         if (lastAdjustmentRef.current !== adjustmentKey) {
            lastAdjustmentRef.current = adjustmentKey;
            updateDateTime("dt_arr", dataDecolagem, horaPouso || "00:00");
         }
      } else {
         lastAdjustmentRef.current = "";
      }
   }, [dataDecolagem, dataPouso, isEditable]);

   // Auto-ajuste reativo: se mesma data mas hora decolagem >= hora pouso
   useEffect(() => {
      if (
         !isEditable ||
         !dataDecolagem ||
         !horaDecolagem ||
         !dataPouso ||
         !horaPouso
      )
         return;

      if (dataDecolagem === dataPouso && horaDecolagem >= horaPouso) {
         const [hours, minutes] = horaDecolagem.split(":").map(Number);
         const totalMinutes = hours * 60 + minutes + 5;
         const newHours = Math.floor(totalMinutes / 60) % 24;
         const newMinutes = totalMinutes % 60;
         const newHoraPouso = `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}`;

         const adjustmentKey = `hora-${newHoraPouso}`;
         if (lastAdjustmentRef.current !== adjustmentKey) {
            lastAdjustmentRef.current = adjustmentKey;
            updateDateTime("dt_arr", dataPouso, newHoraPouso);
         }
      } else {
         lastAdjustmentRef.current = "";
      }
   }, [dataDecolagem, horaDecolagem, dataPouso, horaPouso, isEditable]);

   // Validacao: decolagem nao pode ser posterior ao pouso
   const erroDataHora = useMemo(() => {
      if (!etapa.dt_dep || !etapa.dt_arr) return null;
      const decolagem = new Date(etapa.dt_dep);
      const pouso = new Date(etapa.dt_arr);
      if (decolagem >= pouso) {
         return "A data/hora de decolagem deve ser anterior a data/hora de pouso.";
      }
      return null;
   }, [etapa.dt_dep, etapa.dt_arr]);

   // Validacao: tempo de voo da etapa deve ser >= 5 minutos
   const erroTempoVooEtapa = useMemo(() => {
      if (!etapa.dt_dep || !etapa.dt_arr) return null;
      const minutes = calcularTempoVooMinutos(etapa.dt_dep, etapa.dt_arr);
      if (minutes > 0 && minutes < 5) {
         return `Tempo de voo mínimo é 5 minutos (calculado: ${minutes} min).`;
      }
      return null;
   }, [etapa.dt_dep, etapa.dt_arr]);

   // Validacao: tempo de voo alternativa deve ser >= 5 minutos
   const erroTempoVooAlternativa = useMemo(() => {
      if (!etapa.tvoo_alt || etapa.tvoo_alt === 0) return null;
      if (etapa.tvoo_alt > 0 && etapa.tvoo_alt < 5) {
         return "Tempo de voo alternativa mínimo é 5 minutos.";
      }
      return null;
   }, [etapa.tvoo_alt]);

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
                           updateDateTime(
                              "dt_dep",
                              e.target.value,
                              horaDecolagem || "00:00"
                           )
                        }
                        disabled={!isEditable}
                        className={clsx(
                           "w-36 rounded border bg-white px-2 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
                           fieldErrors.dt_dep
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
                           updateDateTime("dt_dep", dataDecolagem, rounded);
                        }}
                        disabled={!isEditable}
                        step="300"
                        className={clsx(
                           "w-20 rounded border bg-white px-2 py-2 text-center text-sm text-gray-900 focus:border-transparent focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
                           fieldErrors.dt_dep
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
                        onChange={(e) =>
                           updateDateTime(
                              "dt_arr",
                              e.target.value,
                              horaPouso || "00:00"
                           )
                        }
                        disabled={!isEditable}
                        className={clsx(
                           "w-36 rounded border bg-white px-2 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
                           fieldErrors.dt_arr
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
                           updateDateTime("dt_arr", dataPouso, rounded);
                        }}
                        disabled={!isEditable}
                        step="300"
                        className={clsx(
                           "w-20 rounded border bg-white px-2 py-2 text-center text-sm text-gray-900 focus:border-transparent focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
                           fieldErrors.dt_arr
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
                           onChange("dest", value.toUpperCase());
                        }}
                        disabled={!isEditable}
                        placeholder="SBBR"
                        maxLength={4}
                        className={clsx(
                           "w-20 rounded border bg-white px-2 py-2 text-center font-mono text-sm text-gray-900 uppercase placeholder:text-gray-400 focus:border-transparent focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
                           fieldErrors.dest
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
                           const [hours, minutes] = rounded
                              .split(":")
                              .map(Number);
                           const totalMinutes =
                              (hours || 0) * 60 + (minutes || 0);
                           onChange("tvoo_alt", totalMinutes);
                        }}
                        disabled={!isEditable}
                        step="300"
                        className={clsx(
                           "w-20 rounded border bg-white px-2 py-2 text-center text-sm text-gray-900 focus:border-transparent focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
                           fieldErrors.tvoo_alt
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
                  Combustível (T)
               </span>
               <input
                  type="number"
                  min="1"
                  max="30"
                  value={quantidadeCombustivel}
                  onChange={(e) => {
                     const value = e.target.value.replace(/[^0-9]/g, "");
                     if (value === "" || parseInt(value, 10) > 0) {
                        onChange("qtd_comb", value);
                     }
                  }}
                  disabled={!isEditable}
                  placeholder="1500"
                  className={clsx(
                     "w-24 rounded border bg-white px-2 py-2 text-center font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
                     fieldErrors.qtd_comb
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
                     onChange("esf_aer", e.target.value.toUpperCase())
                  }
                  disabled={!isEditable}
                  placeholder="ESFORÇO AÉREO ALOCADO"
                  className={clsx(
                     "w-full rounded border bg-white px-3 py-2 text-center text-sm text-gray-900 uppercase placeholder:text-gray-400 focus:border-transparent focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
                     fieldErrors.esf_aer
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
});
