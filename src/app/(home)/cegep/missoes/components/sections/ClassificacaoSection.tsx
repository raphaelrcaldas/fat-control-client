import { Select, Label } from "flowbite-react";
import clsx from "clsx";
import { SectionWrapper } from "../SectionWrapper";

interface ClassificacaoSectionProps {
   tipo: string;
   setTipo: (value: string) => void;
   ind: string;
   setInd: (value: string) => void;
   editMode: boolean;
}

export function ClassificacaoSection({
   tipo,
   setTipo,
   ind,
   setInd,
   editMode,
}: ClassificacaoSectionProps) {
   return (
      <SectionWrapper title="Classificação">
         <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
               <Label
                  htmlFor="class-tipo-missao"
                  className="mr-2 text-sm font-medium text-slate-600"
               >
                  Tipo de Missão
               </Label>
               {editMode ? (
                  <Select
                     id="class-tipo-missao"
                     value={tipo}
                     onChange={(e) => setTipo(e.target.value)}
                     className="w-full"
                  >
                     <option value="" disabled></option>
                     <option value="tal">TAL - Transporte Aerologístico</option>
                     <option value="opr">OPR - Operacional</option>
                     <option value="adm">ADM - Administrativo</option>
                  </Select>
               ) : (
                  <div className="inline-block">
                     <span
                        className={clsx(
                           "inline-flex items-center rounded px-3 py-2 text-sm font-bold tracking-wide text-white uppercase shadow-sm",
                           {
                              "bg-amber-500": tipo === "opr",
                              "bg-blue-500": tipo === "adm",
                              "bg-green-500": tipo === "tal",
                           }
                        )}
                     >
                        {tipo}
                     </span>
                  </div>
               )}
            </div>
            <div className="space-y-2">
               <Label
                  htmlFor="class-natureza"
                  className="mr-2 text-sm font-medium text-slate-600"
               >
                  Natureza
               </Label>
               {editMode ? (
                  <Select
                     id="class-natureza"
                     value={ind}
                     onChange={(e) => setInd(e.target.value)}
                     className="w-full"
                  >
                     <option disabled value=""></option>
                     <option value="n_ind">NÃO INDENIZÁVEL</option>
                     <option value="ind">INDENIZÁVEL</option>
                  </Select>
               ) : (
                  <div className="inline-block">
                     <span
                        className={clsx(
                           "inline-flex items-center rounded px-4 py-2 text-sm font-bold tracking-wide uppercase shadow-sm",
                           {
                              "bg-emerald-500 text-white": ind === "ind",
                              "bg-slate-200 text-slate-700": ind === "n_ind",
                           }
                        )}
                     >
                        {ind === "ind" && "Indenizável"}
                        {ind === "n_ind" && "Não Indenizável"}
                     </span>
                  </div>
               )}
            </div>
         </div>
      </SectionWrapper>
   );
}
