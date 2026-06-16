import { Label, Checkbox } from "flowbite-react";
import { FaPlaneDeparture, FaPlaneArrival } from "react-icons/fa";
import { DateTimePicker } from "@/app/(home)/components/dateTimePicker";
import clsx from "clsx";
import { SectionWrapper } from "../SectionWrapper";
import { formatNaiveDateTime } from "utils/dateHandler";

interface PeriodoSectionProps {
   afast: string;
   setAfast: (value: string) => void;
   regres: string;
   setRegres: (value: string) => void;
   acrecDesloc: boolean;
   setAcrecDesloc: (value: boolean) => void;
   editMode: boolean;
}

export function PeriodoSection({
   afast,
   setAfast,
   regres,
   setRegres,
   acrecDesloc,
   setAcrecDesloc,
   editMode,
}: PeriodoSectionProps) {
   return (
      <SectionWrapper title="Período e Deslocamento">
         <div className="space-y-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
               <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                     <FaPlaneDeparture className="text-slate-500" />
                     Afastamento
                  </Label>
                  {editMode ? (
                     <DateTimePicker value={afast} setValue={setAfast} />
                  ) : (
                     <div className="flex items-center gap-3 rounded border border-yellow-300 bg-yellow-100 px-4 py-3 font-mono shadow-sm">
                        <FaPlaneDeparture className="text-lg text-yellow-700" />
                        <span className="font-semibold text-slate-800">
                           {formatNaiveDateTime(afast)}
                        </span>
                     </div>
                  )}
               </div>

               <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                     <FaPlaneArrival className="text-slate-500" />
                     Regresso
                  </Label>
                  {editMode ? (
                     <DateTimePicker value={regres} setValue={setRegres} />
                  ) : (
                     <div className="flex items-center gap-3 rounded border border-yellow-300 bg-yellow-100 px-4 py-3 font-mono shadow-sm">
                        <FaPlaneArrival className="text-lg text-yellow-700" />
                        <span className="font-semibold text-slate-800">
                           {formatNaiveDateTime(regres)}
                        </span>
                     </div>
                  )}
               </div>
            </div>

            <div className="flex items-center gap-3 border-t border-slate-200 pt-2">
               <Label
                  className="font-medium text-slate-500"
                  htmlFor="ac_desloc"
               >
                  Acréscimo de Deslocamento:
               </Label>
               {editMode ? (
                  <Checkbox
                     id="ac_desloc"
                     color="blue"
                     onChange={(e) => setAcrecDesloc(e.target.checked)}
                     className="size-5"
                     checked={acrecDesloc}
                  />
               ) : (
                  <span
                     className={clsx(
                        "rounded-md px-3 py-1 font-semibold uppercase",
                        {
                           "bg-green-100 text-green-700": acrecDesloc,
                           "bg-slate-200 text-slate-600": !acrecDesloc,
                        }
                     )}
                  >
                     {acrecDesloc ? "Sim" : "Não"}
                  </span>
               )}
            </div>
         </div>
      </SectionWrapper>
   );
}
