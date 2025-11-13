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

   // Calcular número de dias
   const dias = pnt.custo?.dias || 0;

   // Calcular valor total do pernoite
   const valorTotal = pnt.custo?.subtotal || 0;

   function editPntShow(): void {
      if (edit) {
         setShowFormPnt(true);
      }
   }

   return (
      <>
         <div
            className={clsx(
               "group relative p-4 flex gap-3 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-sm",
               {
                  "hover:shadow-lg hover:border-blue-300 cursor-pointer": edit,
               }
            )}
            onClick={editPntShow}
         >
            {/* Header com ícone e datas */}
            <div className='flex items-center gap-3'>
               <div className='flex items-center gap-2 flex-1'>
                  <MdCalendarToday className='text-gray-500 text-sm' />
                  <span className='font-semibold text-gray-700'>{dataIni}</span>
                  <span className='text-gray-400'>→</span>
                  <span className='font-semibold text-gray-700'>{dataFim}</span>
                  {dias > 0 && (
                     <span className='ml-2 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full'>
                        {dias} {dias === 1 ? "dia" : "dias"}
                     </span>
                  )}
               </div>
            </div>

            {/* Localização */}
            <div className='flex items-center gap-2 pl-13'>
               <MdLocationOn className='text-red-500 text-lg' />
               <span className='font-medium text-gray-800'>
                  {pnt.cidade.nome}, {pnt.cidade.uf}
               </span>
            </div>

            {/* Tags e Valor */}
            <div className='flex items-center justify-between pl-13'>
               <div className='flex gap-2'>
                  {pnt.acrec_desloc && (
                     <Tooltip content='Acréscimo Deslocamento'>
                        <span className='flex items-center gap-1 font-semibold bg-gradient-to-r from-green-400 to-green-500 text-white px-3 py-1 rounded-full text-xs shadow-sm'>
                           <MdAttachMoney className='text-sm' />
                           AC
                        </span>
                     </Tooltip>
                  )}

                  {pnt.meia_diaria && (
                     <Tooltip content='Meia Diária'>
                        <span className='font-semibold bg-gradient-to-r from-amber-400 to-amber-500 text-white px-3 py-1 rounded-full text-xs shadow-sm'>
                           MD
                        </span>
                     </Tooltip>
                  )}

                  {pnt.obs && (
                     <Tooltip content={pnt.obs}>
                        <span className='font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs'>
                           Obs
                        </span>
                     </Tooltip>
                  )}
               </div>

               {valorTotal > 0 && (
                  <div className='flex items-center gap-1 font-bold text-green-700 bg-green-50 px-3 py-1 rounded-lg border border-green-200'>
                     <MdAttachMoney />
                     <span className='text-sm'>
                        {valorTotal.toLocaleString("pt-BR", {
                           style: "currency",
                           currency: "BRL",
                        })}
                     </span>
                  </div>
               )}
            </div>

            {/* Indicador de edição */}
            {edit && (
               <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                  <span className='text-xs text-blue-500 font-medium'>
                     Clique para editar
                  </span>
               </div>
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
