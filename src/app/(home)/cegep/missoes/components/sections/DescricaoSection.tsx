import { TextInput } from "flowbite-react";
import { SectionWrapper } from "../SectionWrapper";

interface DescricaoSectionProps {
   desc: string;
   setDesc: (value: string) => void;
   editMode: boolean;
}

export function DescricaoSection({
   desc,
   setDesc,
   editMode,
}: DescricaoSectionProps) {
   return (
      <SectionWrapper title="Descrição">
         {editMode ? (
            <TextInput
               className="w-full"
               placeholder="OFRAG XXX - APOIO XXX"
               value={desc}
               onChange={(e) => setDesc(e.target.value)}
            />
         ) : (
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
               <p className="text-base font-medium text-slate-800 uppercase">
                  {desc}
               </p>
            </div>
         )}
      </SectionWrapper>
   );
}
