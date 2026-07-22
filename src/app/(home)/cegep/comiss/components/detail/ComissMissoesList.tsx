"use client";

import { Missao } from "services/routes/cegep/missoes";
import { ComissWithMiss } from "services/routes/cegep/comiss";
import { MissionRow } from "./MissionRow";
import { SectionWrapper } from "../../../components/SectionWrapper";

interface ComissMissoesListProps {
   comiss: ComissWithMiss;
   onShowDetail: (mis: Missao) => void;
   onNavigate: (missaoId: number) => void;
}

export function ComissMissoesList({
   comiss,
   onShowDetail,
   onNavigate,
}: ComissMissoesListProps) {
   const missoes = comiss.missoes ?? [];

   return (
      <SectionWrapper title="Missões Relacionadas">
         <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
            {missoes.length > 0 ? (
               <div className="divide-y divide-slate-200">
                  {missoes.map((m) => (
                     <MissionRow
                        key={m.id}
                        mis={m}
                        diasPrev={comiss?.dias_cumprir}
                        onShowDetail={() => onShowDetail(m)}
                        onNavigate={() => onNavigate(m.id!)}
                     />
                  ))}
               </div>
            ) : (
               <div className="p-8 text-center text-sm text-gray-500">
                  Nenhuma missão adicionada
               </div>
            )}
         </div>
      </SectionWrapper>
   );
}
