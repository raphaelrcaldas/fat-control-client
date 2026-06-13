import { Label, Checkbox } from "flowbite-react";
import { FaPlaneDeparture, FaPlaneArrival } from "react-icons/fa";
import { DateTimePicker } from "@/app/(home)/components/dateTimePicker";
import clsx from "clsx";
import { SectionWrapper } from "../SectionWrapper";

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
                     <div className="flex items-center gap-3 rounded border border-yellow-300 bg-linear-to-r from-yellow-100 to-yellow-200 px-4 py-3 shadow-sm">
                        <FaPlaneDeparture className="text-lg text-yellow-700" />
                        <span className="font-semibold text-slate-800">
                           {new Date(afast).toLocaleDateString("pt-BR", {
                              year: "numeric",
                              month: "numeric",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                           })}
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
                     <div className="flex items-center gap-3 rounded border border-yellow-300 bg-linear-to-r from-yellow-100 to-yellow-200 px-4 py-3 shadow-sm">
                        <FaPlaneArrival className="text-lg text-yellow-700" />
                        <span className="font-semibold text-slate-800">
                           {new Date(regres).toLocaleDateString("pt-BR", {
                              year: "numeric",
                              month: "numeric",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                           })}
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
