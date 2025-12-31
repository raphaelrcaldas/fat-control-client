"use client";

import clsx from "clsx";
import { OrdemMissao } from "../../types";
import { matriculasAeronaves } from "../../constants";

interface ValidationErrors {
   tipo: boolean;
   matriculaAeronave: boolean;
   etapas: boolean;
   piloto: boolean;
   mecanico: boolean;
   loadmaster: boolean;
}

interface OrdemBasicInfoProps {
   formData: OrdemMissao;
   isEditable: boolean;
   onUpdate: (updates: Partial<OrdemMissao>) => void;
   validationErrors?: ValidationErrors;
}

export function OrdemBasicInfo({
   formData,
   isEditable,
   onUpdate,
   validationErrors,
}: OrdemBasicInfoProps) {
   return (
      <div className="flex gap-4">
         <div className="flex-1">
            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-gray-600 uppercase">
               Documento Referência
            </label>
            <input
               type="text"
               value={formData.documentoReferencia}
               onChange={(e) =>
                  onUpdate({
                     documentoReferencia: e.target.value.toUpperCase(),
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
               value={formData.matriculaAeronave || ""}
               onChange={(e) =>
                  onUpdate({
                     matriculaAeronave: parseInt(e.target.value) || 0,
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
               {matriculasAeronaves.map((matricula) => (
                  <option key={matricula} value={matricula}>
                     {matricula}
                  </option>
               ))}
            </select>
         </div>
      </div>
   );
}
