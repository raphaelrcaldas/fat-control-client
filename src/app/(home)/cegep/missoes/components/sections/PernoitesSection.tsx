import { useState } from "react";
import { Button } from "flowbite-react";
import { Pernoite } from "services/routes/cegep/missoes";
import { MissionPernoite } from "../../registros/components/missionDetail/pernoite/missionPernoite";
import { FormPernoite } from "../../registros/components/missionDetail/pernoite/formPernoite";
import { SectionWrapper } from "../SectionWrapper";

interface PernoitesSectionProps {
   sortedPnts: Pernoite[];
   pnts: Pernoite[];
   setPnts: React.Dispatch<React.SetStateAction<Pernoite[]>>;
   afast: string;
   regres: string;
   editMode: boolean;
   checkAfastRegres: boolean;
}

export function PernoitesSection({
   sortedPnts,
   pnts,
   setPnts,
   afast,
   regres,
   editMode,
   checkAfastRegres,
}: PernoitesSectionProps) {
   const [formPnt, setFormPnt] = useState(false);

   return (
      <SectionWrapper title="Pernoites">
         {pnts.length === 0 && (
            <div className="flex items-center justify-center rounded border border-slate-200 bg-white px-4 py-8">
               <p className="text-sm text-slate-400 italic">
                  Nenhum pernoite adicionado
               </p>
            </div>
         )}

         <div className="space-y-2">
            {sortedPnts.map((pnt) => (
               <MissionPernoite
                  key={pnt.id ?? `${pnt.data_ini}-${pnt.cidade_id}`}
                  pnt={pnt}
                  edit={editMode}
                  afast={afast}
                  regres={regres}
                  pnts={pnts}
                  setPnts={setPnts}
               />
            ))}
         </div>

         <FormPernoite
            afast={afast}
            regres={regres}
            showFormPnt={formPnt}
            setShowFormPnt={setFormPnt}
            pnts={pnts}
            setPnts={setPnts}
         />

         {editMode && (
            <Button
               color="primary"
               size="sm"
               onClick={() => setFormPnt(true)}
               disabled={!checkAfastRegres}
               className="mt-4 w-full font-semibold"
            >
               + Adicionar Pernoite
            </Button>
         )}
      </SectionWrapper>
   );
}
