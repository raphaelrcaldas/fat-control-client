"use client";

import {
   TripulacaoOrdem,
   TripulanteSearchResult,
   FuncaoTripulante,
   TODAS_FUNCOES,
} from "../../types";
import { TripulanteSelect } from "./TripulanteSelect";

interface ValidationErrors {
   tipo: boolean;
   matriculaAeronave: boolean;
   etapas: boolean;
   piloto: boolean;
   mecanico: boolean;
   loadmaster: boolean;
}

interface OrdemTripulacaoProps {
   tripulacao: TripulacaoOrdem;
   projeto: string;
   onAdd: (
      funcao: FuncaoTripulante,
      tripulante: TripulanteSearchResult
   ) => void;
   onRemove: (funcao: FuncaoTripulante, tripulanteId: number) => void;
   isEditable: boolean;
   validationErrors?: ValidationErrors;
}

// Funcoes obrigatorias com mapeamento para os erros de validacao
const REQUIRED_FUNCOES: Record<
   FuncaoTripulante,
   keyof ValidationErrors | null
> = {
   pil: "piloto",
   mc: "mecanico",
   lm: "loadmaster",
   tf: null,
   oe: null,
   os: null,
};

export function OrdemTripulacao({
   tripulacao,
   projeto,
   onAdd,
   onRemove,
   isEditable,
   validationErrors,
}: OrdemTripulacaoProps) {
   // Coletar IDs de tripulantes já selecionados (em qualquer função) para evitar duplicatas
   const selectedIds = TODAS_FUNCOES.flatMap((funcao) =>
      tripulacao[funcao].map((t) => t.id)
   );

   return (
      <div className="grid grid-cols-6 gap-4">
         {TODAS_FUNCOES.map((funcao) => {
            const errorKey = REQUIRED_FUNCOES[funcao];
            const isRequired = errorKey !== null;
            const hasError = errorKey ? validationErrors?.[errorKey] : false;

            return (
               <TripulanteSelect
                  key={funcao}
                  funcao={funcao}
                  projeto={projeto}
                  tripulantes={tripulacao[funcao]}
                  onAdd={(tripulante) => onAdd(funcao, tripulante)}
                  onRemove={(tripulanteId) => onRemove(funcao, tripulanteId)}
                  disabled={!isEditable}
                  excludeIds={selectedIds}
                  required={isRequired}
                  hasError={hasError}
               />
            );
         })}
      </div>
   );
}
