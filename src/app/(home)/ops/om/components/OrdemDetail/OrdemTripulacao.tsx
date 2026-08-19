"use client";

import { memo, useMemo } from "react";
import { type CrewMember } from "services/routes/trips";
import { type FuncType } from "@/constants/tripulantes";
import { TripulanteSelect } from "./TripulanteSelect";
import { type TripulacaoOrdem } from "./utils/ordemFormUtils";
import { type OrdemValidationFlags } from "./utils/ordemValidation";

interface OrdemTripulacaoProps {
   tripulacao: TripulacaoOrdem;
   onAdd: (funcao: FuncType, tripulante: CrewMember) => void;
   onRemove: (funcao: FuncType, tripulanteId: number) => void;
   isEditable: boolean;
   validationErrors?: OrdemValidationFlags;
}

// Funcoes obrigatorias com mapeamento para os erros de validacao. É regra
// da OM (não catálogo): a ordem só sai sem piloto, mecânico ou loadmaster
// se a unidade não operar a função — o que já a mantém fora das chaves.
const REQUIRED_FUNCOES: Partial<Record<FuncType, keyof OrdemValidationFlags>> =
   {
      pil: "piloto",
      mc: "mecanico",
      lm: "loadmaster",
   };

export const OrdemTripulacao = memo(function OrdemTripulacao({
   tripulacao,
   onAdd,
   onRemove,
   isEditable,
   validationErrors,
}: OrdemTripulacaoProps) {
   // Coletar IDs de tripulantes já selecionados (em qualquer função) para evitar duplicatas
   // As funções vêm das chaves do estado, montadas a partir do catálogo da
   // unidade em `buildInitialState`.
   const funcoes = useMemo(() => Object.keys(tripulacao), [tripulacao]);

   const selectedIds = useMemo(
      () =>
         funcoes.flatMap((funcao) =>
            tripulacao[funcao]
               .map((t) => t.id)
               .filter((id): id is number => id != null)
         ),
      [tripulacao, funcoes]
   );

   return (
      <div className="grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
         {funcoes.map((funcao) => {
            const errorKey = REQUIRED_FUNCOES[funcao];
            const isRequired = errorKey !== undefined;
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
