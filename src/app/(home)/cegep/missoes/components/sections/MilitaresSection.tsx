import { useState } from "react";
import { HiPlus } from "react-icons/hi";
import { UserMission } from "services/routes/cegep/missoes";
import { MissionMilitar } from "../../registros/components/missionDetail/militar/missionMilitar";
import { FormMilitar } from "../../registros/components/missionDetail/militar/formMilitar";
import { SectionWrapper } from "../SectionWrapper";

interface MilitaresSectionProps {
   mils: UserMission[];
   setMils: React.Dispatch<React.SetStateAction<UserMission[]>>;
   editMode: boolean;
}

export function MilitaresSection({
   mils,
   setMils,
   editMode,
}: MilitaresSectionProps) {
   const [formMil, setFormMil] = useState(false);

   return (
      <SectionWrapper
         title="Militares"
         action={
            editMode && (
               <button
                  type="button"
                  onClick={() => setFormMil(true)}
                  className="group text-primary-600 hover:text-primary-700 flex items-center gap-1.5 text-sm font-semibold transition-all pointer-coarse:min-h-[44px]"
               >
                  <HiPlus className="h-4 w-4 transition-transform group-hover:scale-110" />
                  Adicionar
               </button>
            )
         }
      >
         {mils.length === 0 && (
            <div className="flex items-center justify-center rounded border border-slate-200 bg-white px-4 py-8">
               <p className="text-sm text-slate-400 italic">
                  Nenhum militar adicionado
               </p>
            </div>
         )}

         <div className="grid grid-cols-2 gap-2 font-medium uppercase md:grid-cols-3 lg:grid-cols-4">
            {mils.map((userMis) => (
               <MissionMilitar
                  key={userMis.user_id}
                  edit={editMode}
                  userMis={userMis}
                  mils={mils}
                  setMils={setMils}
               />
            ))}
         </div>

         {formMil && (
            <FormMilitar
               show={formMil}
               setShow={setFormMil}
               mils={mils}
               setMils={setMils}
            />
         )}
      </SectionWrapper>
   );
}
