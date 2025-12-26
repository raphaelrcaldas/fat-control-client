"use client";

import { OrdemMissao } from "../../types";
import { matriculasAeronaves } from "../../constants";

interface OrdemBasicInfoProps {
   formData: OrdemMissao;
   isEditable: boolean;
   onUpdate: (updates: Partial<OrdemMissao>) => void;
}

export function OrdemBasicInfo({
   formData,
   isEditable,
   onUpdate,
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
                  onUpdate({ documentoReferencia: e.target.value })
               }
               disabled={!isEditable}
               placeholder="FIEX-001/2025"
               className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2.5 text-gray-900 transition-all placeholder:text-gray-400 focus:border-red-400 focus:ring-2 focus:ring-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            />
         </div>
         <div className="flex-1">
            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-gray-600 uppercase">
               Descrição da Missão
            </label>
            <input
               type="text"
               value={formData.tipo || ""}
               onChange={(e) => onUpdate({ tipo: e.target.value })}
               disabled={!isEditable}
               placeholder="Ex: Transporte de autoridade"
               className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2.5 text-gray-900 transition-all placeholder:text-gray-400 focus:border-red-400 focus:ring-2 focus:ring-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            />
         </div>
         <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-gray-600 uppercase">
               Aeronave
            </label>
            <select
               value={formData.matriculaAeronave || ""}
               onChange={(e) =>
                  onUpdate({
                     matriculaAeronave: parseInt(e.target.value) || 0,
                  })
               }
               disabled={!isEditable}
               className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2.5 text-center text-gray-900 transition-all focus:border-red-400 focus:ring-2 focus:ring-red-400 disabled:cursor-not-allowed disabled:opacity-50"
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
