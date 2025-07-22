import { Tooltip } from "flowbite-react";
import { Pernoite } from "services/routes/cegep/missoes";
import { FormPernoite } from "./formPernoite";
import { useState } from "react";
import clsx from "clsx";

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

   const dataIni = new Date(pnt.data_ini).toLocaleDateString("pt-br", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
   });

   const dataFim = new Date(pnt.data_fim).toLocaleDateString("pt-br", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
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
               "p-1 flex flex-row gap-0.5 rounded-xl justify-start",
               {
                  "hover:bg-slate-200 cursor-pointer": edit,
               }
            )}
            onClick={editPntShow}
         >
            <span className='w-32 text-sm text-center font-medium'>
               {dataIni}
            </span>
            <span>a</span>
            <span className='w-32 text-sm text-center font-medium'>
               {dataFim}
            </span>

            <span className='px-1'>
               {pnt.cidade.nome}-{pnt.cidade.uf}
            </span>

            {pnt.acrec_desloc && (
               <Tooltip content='Acréscimo Deslocamento'>
                  <span className='font-semibold bg-green-400 px-2.5 rounded-lg'>
                     AC
                  </span>
               </Tooltip>
            )}

            {pnt.meia_diaria && (
               <Tooltip content='Meia Diária'>
                  <span className='font-semibold bg-amber-400 px-2.5 rounded-lg'>
                     MD
                  </span>
               </Tooltip>
            )}
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
