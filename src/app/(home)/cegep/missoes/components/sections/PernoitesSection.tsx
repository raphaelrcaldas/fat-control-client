import { useState } from "react";
import { HiPlus } from "react-icons/hi";
import { Pernoite } from "services/routes/cegep/missoes";
import { MissionPernoite } from "../../registros/components/missionDetail/pernoite/missionPernoite";
import { FormPernoite } from "../../registros/components/missionDetail/pernoite/formPernoite";
import { SectionWrapper } from "../../../components/SectionWrapper";

interface PernoitesSectionProps {
   sortedPnts: Pernoite[];
   pnts: Pernoite[];
   setPnts: React.Dispatch<React.SetStateAction<Pernoite[]>>;
   afast: string;
   regres: string;
   editMode: boolean;
}

export function PernoitesSection({
   sortedPnts,
   pnts,
   setPnts,
   afast,
   regres,
   editMode,
}: PernoitesSectionProps) {
   const [formPnt, setFormPnt] = useState(false);

   return (
      <SectionWrapper
         title="Pernoites"
         action={
            editMode && (
               <button
                  type="button"
                  onClick={() => setFormPnt(true)}
                  className="group text-primary-600 hover:text-primary-700 flex items-center gap-1.5 text-sm font-semibold transition-all pointer-coarse:min-h-[44px]"
               >
                  <HiPlus className="h-4 w-4 transition-transform group-hover:scale-110" />
                  Adicionar
               </button>
            )
         }
      >
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
      </SectionWrapper>
   );
}
