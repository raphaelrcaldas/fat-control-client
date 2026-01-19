import { Tooltip } from "flowbite-react";
import { Pernoite } from "services/routes/cegep/missoes";
import { FormPernoite } from "./formPernoite";
import { useState } from "react";
import clsx from "clsx";
import { isoStrToDate } from "utils/dateHandler";
import { MdCalendarToday, MdLocationOn, MdAttachMoney } from "react-icons/md";

interface MissionPernoiteProps {
   pnt: Pernoite;
   pnts: Pernoite[];
   edit: boolean;
   afast: string;
   regres: string;
   setPnts: React.Dispatch<React.SetStateAction<Pernoite[]>>;
}

export function MissionPernoite({
   pnt,
   pnts,
   afast,
   regres,
   edit,
   setPnts,
}: MissionPernoiteProps) {
   const [showFormPnt, setShowFormPnt] = useState<boolean>(false);

   const dataIni = isoStrToDate(pnt.data_ini).toLocaleDateString("pt-br", {
      day: "2-digit",
      month: "short",
   });

   const dataFim = isoStrToDate(pnt.data_fim).toLocaleDateString("pt-br", {
      day: "2-digit",
      month: "short",
   });

   function editPntShow(): void {
      if (edit) {
         setShowFormPnt(true);
      }
   }

   return (
      <>
         <div
            className={clsx(
               "group relative flex justify-between",
               "rounded-xl border-2 border-gray-200 bg-linear-to-br from-white to-gray-50 p-4 shadow-sm",
               {
                  "cursor-pointer hover:border-blue-300 hover:shadow-lg": edit,
               }
            )}
            onClick={editPntShow}
         >
            {/* Header com ícone e datas */}
            <div className="flex items-center gap-6">
               <div className="flex flex-1 items-center gap-2">
                  <MdCalendarToday className="text-sm text-gray-500" />
                  <span className="font-semibold text-gray-700">{dataIni}</span>
                  <span className="text-gray-400">→</span>
                  <span className="font-semibold text-gray-700">{dataFim}</span>
               </div>

               {/* Localização */}
               <div className="flex items-center">
                  <span className="font-medium text-gray-800">
                     {pnt.cidade.nome}, {pnt.cidade.uf}
                  </span>
               </div>
            </div>

            {/* Tags e Valor */}
            <div className="flex items-center justify-center gap-2">
               {pnt.acrec_desloc && (
                  <Tooltip content="Acréscimo Deslocamento">
                     <span className="flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                        AC
                     </span>
                  </Tooltip>
               )}

               {pnt.meia_diaria && (
                  <Tooltip content="Meia Diária">
                     <span className="flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                        MD
                     </span>
                  </Tooltip>
               )}
            </div>
         </div>

         {showFormPnt && (
            <FormPernoite
               showFormPnt={showFormPnt}
               setShowFormPnt={setShowFormPnt}
               afast={afast}
               regres={regres}
               pnt={pnt}
               pnts={pnts}
               setPnts={setPnts}
            />
         )}
      </>
   );
}
