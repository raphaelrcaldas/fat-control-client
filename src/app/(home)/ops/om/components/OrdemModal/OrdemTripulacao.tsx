"use client";

import {
   TripulacaoOrdem,
   TripulanteSearchResult,
   FuncaoTripulante,
   TODAS_FUNCOES,
} from "../../types";
import { TripulanteSelect } from "./TripulanteSelect";

interface OrdemTripulacaoProps {
   tripulacao: TripulacaoOrdem;
   projeto: string;
   onAdd: (
      funcao: FuncaoTripulante,
      tripulante: TripulanteSearchResult
   ) => void;
   onRemove: (funcao: FuncaoTripulante, tripulanteId: number) => void;
   isEditable: boolean;
}

export function OrdemTripulacao({
   tripulacao,
   projeto,
   onAdd,
   onRemove,
   isEditable,
}: OrdemTripulacaoProps) {
   // Coletar IDs de tripulantes já selecionados (em qualquer função) para evitar duplicatas
   const selectedIds = TODAS_FUNCOES.flatMap((funcao) =>
      tripulacao[funcao].map((t) => t.id)
   );

   return (
      <div className="flex flex-col gap-4">
         {TODAS_FUNCOES.map((funcao) => (
            <TripulanteSelect
               key={funcao}
               funcao={funcao}
               projeto={projeto}
               tripulantes={tripulacao[funcao]}
               onAdd={(tripulante) => onAdd(funcao, tripulante)}
               onRemove={(tripulanteId) => onRemove(funcao, tripulanteId)}
               disabled={!isEditable}
               excludeIds={selectedIds}
            />
         ))}
      </div>
   );
}
