"use client";

import { Etapa } from "../../types";
import { DurationInput } from "@/components/DurationInput";
import { roundToNearestFiveMinutes } from "@/hooks/useDateTimeRound";

interface OrdemEtapaItemProps {
   etapa: Etapa;
   index: number;
   isEditable: boolean;
   canRemove: boolean;
   onChange: (field: string, value: string) => void;
   onRemove: () => void;
   onInsertAfter: () => void;
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
}: OrdemEtapaItemProps) {
   return (
      <div className="group relative rounded-lg border border-gray-200 bg-white p-4">
         <div className="absolute top-1/2 -left-3 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border-2 border-red-500 bg-white text-xs font-bold text-red-600">
            {index + 1}
         </div>

         <div className="flex gap-2 text-center">
            <div>
               <label className="mb-1 block text-xs font-medium text-gray-500">
                  Data
               </label>
               <input
                  type="date"
                  value={etapa.dataDecolagem}
                  onChange={(e) => onChange("dataDecolagem", e.target.value)}
                  disabled={!isEditable}
                  className="w-36 rounded border border-gray-300 bg-white px-2 py-2 text-center text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
               />
            </div>
            <div>
               <label className="mb-1 block text-xs font-medium text-gray-500">
                  DEP (Z)
               </label>
               <input
                  type="time"
                  value={etapa.horaDecolagem}
                  onChange={(e) => {
                     const rounded = roundTimeToFiveMinutes(e.target.value);
                     onChange("horaDecolagem", rounded);
                  }}
                  disabled={!isEditable}
                  step="300"
                  className="w-20 rounded border border-gray-300 bg-white px-2 py-2 text-center text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
               />
            </div>
            <div>
               <label className="mb-1 block text-xs font-medium text-gray-500">
                  Origem
               </label>
               <input
                  type="text"
                  value={etapa.origem}
                  onChange={(e) =>
                     onChange("origem", e.target.value.toUpperCase())
                  }
                  disabled={!isEditable}
                  placeholder="SBGL"
                  maxLength={4}
                  className="w-20 rounded border border-gray-300 bg-white px-2 py-2 text-center font-mono text-sm text-gray-900 uppercase placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
               />
            </div>
            <div>
               <label className="mb-1 block text-xs font-medium text-gray-500">
                  ETA (Z)
               </label>
               <input
                  type="time"
                  value={etapa.eta}
                  onChange={(e) => {
                     const rounded = roundTimeToFiveMinutes(e.target.value);
                     onChange("eta", rounded);
                  }}
                  disabled={!isEditable}
                  step="300"
                  className="w-20 rounded border border-gray-300 bg-white px-2 py-2 text-center text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
               />
            </div>
            <div>
               <label className="mb-1 block text-xs font-medium text-gray-500">
                  Destino
               </label>
               <input
                  type="text"
                  value={etapa.destino}
                  onChange={(e) =>
                     onChange("destino", e.target.value.toUpperCase())
                  }
                  disabled={!isEditable}
                  placeholder="SBBR"
                  maxLength={4}
                  className="w-20 rounded border border-gray-300 bg-white px-2 py-2 text-center font-mono text-sm text-gray-900 uppercase placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
               />
            </div>
            <div>
               <label className="mb-1 block text-xs font-medium text-gray-500">
                  T. Voo
               </label>
               <DurationInput
                  value={etapa.tempoVooEtapa}
                  onChange={(value) => onChange("tempoVooEtapa", value)}
                  disabled={!isEditable}
                  placeholder="02:30"
                  roundMinutes={true}
                  className="w-20 rounded border border-gray-300 bg-white px-2 py-2 text-center text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
               />
            </div>
            <div>
               <label className="mb-1 block text-center text-xs font-medium text-gray-500">
                  Alternativa
               </label>
               <input
                  type="text"
                  value={etapa.alternativa}
                  onChange={(e) =>
                     onChange("alternativa", e.target.value.toUpperCase())
                  }
                  disabled={!isEditable}
                  placeholder="SBSP"
                  maxLength={4}
                  className="w-20 rounded border border-gray-300 bg-white px-2 py-2 text-center font-mono text-sm text-gray-900 uppercase placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
               />
            </div>
            <div>
               <label className="mb-1 block text-xs font-medium text-gray-500">
                  T. Alt.
               </label>
               <DurationInput
                  value={etapa.tempoVooAlternativa}
                  onChange={(value) => onChange("tempoVooAlternativa", value)}
                  disabled={!isEditable}
                  placeholder="00:45"
                  roundMinutes={true}
                  className="w-20 rounded border border-gray-300 bg-white px-2 py-2 text-center text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
               />
            </div>
            <div>
               <label className="mb-1 block text-xs font-medium text-gray-500">
                  Combustível
               </label>
               <input
                  type="text"
                  value={etapa.quantidadeCombustivel}
                  onChange={(e) =>
                     onChange("quantidadeCombustivel", e.target.value)
                  }
                  disabled={!isEditable}
                  placeholder="1500"
                  className="w-20 rounded border border-gray-300 bg-white px-2 py-2 text-center text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
               />
            </div>
            <div className="flex-1">
               <label className="mb-1 block text-xs font-medium text-gray-500">
                  Esforço Aéreo
               </label>
               <input
                  type="text"
                  value={etapa.esforcoAereo}
                  onChange={(e) => onChange("esforcoAereo", e.target.value)}
                  disabled={!isEditable}
                  placeholder="Esforço Aéreo Alocado"
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
               />
            </div>
         </div>

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
