import { memo } from "react";
import { Tooltip } from "flowbite-react";
import { Pernoite } from "services/routes/cegep/missoes";
import { FormPernoite } from "./formPernoite";
import { useState } from "react";
import clsx from "clsx";
import { formatDayMonthShort } from "utils/dateHandler";
import { MdCalendarToday } from "react-icons/md";

interface MissionPernoiteProps {
   pnt: Pernoite;
   pnts: Pernoite[];
   edit: boolean;
   afast: string;
   regres: string;
   setPnts: React.Dispatch<React.SetStateAction<Pernoite[]>>;
}

export const MissionPernoite = memo(function MissionPernoite({
   pnt,
   pnts,
   afast,
   regres,
   edit,
   setPnts,
}: MissionPernoiteProps) {
   const [showFormPnt, setShowFormPnt] = useState<boolean>(false);

   const dataIni = formatDayMonthShort(pnt.data_ini);
   const dataFim = formatDayMonthShort(pnt.data_fim);

   function editPntShow(): void {
      if (edit) {
         setShowFormPnt(true);
      }
   }

   return (
      <>
         <div
            className={clsx(
               "group relative flex justify-between gap-3",
               "rounded border border-slate-200 bg-white px-3 py-2 shadow-sm",
               {
                  "cursor-pointer hover:border-blue-300": edit,
               }
            )}
            onClick={editPntShow}
         >
            {/* Header com ícone e datas */}
            <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-6">
               <div className="flex shrink-0 items-center gap-2">
                  <MdCalendarToday className="text-sm text-gray-500" />
                  <span className="text-sm tracking-wide whitespace-nowrap text-gray-700">
                     {dataIni}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="text-sm tracking-wide whitespace-nowrap text-gray-700">
                     {dataFim}
                  </span>
               </div>

               {/* Localização */}
               <div className="flex min-w-0 items-center">
                  <span
                     className="truncate text-sm text-gray-800"
                     title={`${pnt.cidade.nome}, ${pnt.cidade.uf}`}
                  >
                     {pnt.cidade.nome}, {pnt.cidade.uf}
                  </span>
               </div>
            </div>

            {/* Tags e Valor */}
            <div className="flex shrink-0 items-center justify-center gap-2">
               {pnt.acrec_desloc && (
                  <Tooltip content="Acréscimo Deslocamento">
                     <span className="flex items-center gap-1 rounded bg-green-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                        AC
                     </span>
                  </Tooltip>
               )}

               {pnt.meia_diaria && (
                  <Tooltip content="Meia Diária">
                     <span className="flex items-center gap-1 rounded bg-amber-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
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
});
