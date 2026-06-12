"use client";

import { memo, useMemo } from "react";
import { type CrewMember } from "services/routes/trips";
import {
   FUNCOES_PRINCIPAIS as TODAS_FUNCOES,
   type FuncaoTripulante,
} from "@/constants/tripulantes";
import { TripulanteSelect } from "./TripulanteSelect";

// TripulacaoOrdem usando tipos da API diretamente
interface TripulacaoOrdem {
   pil: CrewMember[];
   mc: CrewMember[];
   lm: CrewMember[];
   tf: CrewMember[];
   oe: CrewMember[];
   os: CrewMember[];
}

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
   onAdd: (funcao: FuncaoTripulante, tripulante: CrewMember) => void;
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

export const OrdemTripulacao = memo(function OrdemTripulacao({
   tripulacao,
   onAdd,
   onRemove,
   isEditable,
   validationErrors,
}: OrdemTripulacaoProps) {
   // Coletar IDs de tripulantes já selecionados (em qualquer função) para evitar duplicatas
   const selectedIds = useMemo(
      () =>
         TODAS_FUNCOES.flatMap((funcao) =>
            tripulacao[funcao]
               .map((t) => t.id)
               .filter((id): id is number => id != null)
         ),
      [tripulacao]
   );

   return (
      <div className="grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
         {TODAS_FUNCOES.map((funcao) => {
            const errorKey = REQUIRED_FUNCOES[funcao];
            const isRequired = errorKey !== null;
            const hasError = errorKey ? validationErrors?.[errorKey] : false;

            return (
               <TripulanteSelect
                  key={funcao}
                  funcao={funcao}
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
});
