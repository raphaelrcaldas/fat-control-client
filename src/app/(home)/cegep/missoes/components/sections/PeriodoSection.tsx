import { Label, Checkbox } from "flowbite-react";
import { FaPlaneDeparture, FaPlaneArrival } from "react-icons/fa";
import { DateTimePicker } from "@/app/(home)/components/dateTimePicker";
import clsx from "clsx";
import { SectionWrapper } from "../../../components/SectionWrapper";
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
            {/* Em leitura, os dois campos dividem a linha já no celular: são
                dois carimbos curtos ("20/08/26 12:00") e empilhados gastavam
                meia tela para dizer duas datas. O espaço veio de tirar o
                ícone de dentro da caixa — ele repetia o do label, a um palmo
                de distância —, não de encolher a fonte nem de quebrar linha.
                Em edição continua uma coluna no mobile: o DateTimePicker não
                cabe em 170px. */}
            <div
               className={clsx(
                  "grid gap-3 lg:grid-cols-2 lg:gap-6",
                  editMode ? "grid-cols-1" : "grid-cols-2"
               )}
            >
               <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                     <FaPlaneDeparture className="text-slate-500" />
                     Afastamento
                  </Label>
                  {editMode ? (
                     <DateTimePicker value={afast} setValue={setAfast} />
                  ) : (
                     <div className="flex items-center rounded border border-slate-200 bg-slate-50 px-2 py-2 font-mono shadow-sm sm:px-4 sm:py-3">
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
                     <div className="flex items-center rounded border border-slate-200 bg-slate-50 px-2 py-2 font-mono shadow-sm sm:px-4 sm:py-3">
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
