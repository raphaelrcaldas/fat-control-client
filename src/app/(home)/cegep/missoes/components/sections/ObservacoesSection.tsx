import { Textarea } from "flowbite-react";
import { SectionWrapper } from "../SectionWrapper";

interface ObservacoesSectionProps {
   obs: string;
   setObs: (value: string) => void;
   editMode: boolean;
}

export function ObservacoesSection({
   obs,
   setObs,
   editMode,
}: ObservacoesSectionProps) {
   return (
      <SectionWrapper title="Observações">
         {editMode ? (
            <Textarea
               value={obs}
               onChange={(e) => setObs(e.target.value)}
               placeholder="RETORNO OM XXX"
               rows={4}
               className="w-full"
            />
         ) : (
            <div className="min-h-25 rounded-lg border border-slate-200 bg-white px-4 py-3">
               {obs ? (
                  <p className="whitespace-pre-wrap text-slate-700">{obs}</p>
               ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400 italic">
                     Nenhuma observação adicionada
                  </div>
               )}
            </div>
         )}
      </SectionWrapper>
   );
}
