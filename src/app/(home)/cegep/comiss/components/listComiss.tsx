"use client";
import { useState } from "react";
import { Progress, Label, Button } from "flowbite-react";
import { isoStrToDate } from "utils/dateHandler";
import {
   MdOutlineAttachMoney,
   MdOutlineCalendarToday,
   MdChevronRight,
} from "react-icons/md";
import { DetailComiss } from "./detailComiss";
import clsx from "clsx";
import { ComissWithMiss } from "services/routes/cegep/comiss";

export function ListComiss({
   comiss,
   update,
}: {
   comiss: ComissWithMiss;
   update: () => void;
}) {
   const [showDetail, setShowDetail] = useState(false);
   const user = comiss.user;
   const data_abertura = isoStrToDate(comiss.data_ab).toLocaleDateString(
      "pt-br",
      {
         day: "2-digit",
         month: "2-digit",
         year: "2-digit",
      }
   );
   const data_fechamento = isoStrToDate(comiss.data_fc).toLocaleDateString(
      "pt-br",
      {
         day: "2-digit",
         month: "2-digit",
         year: "2-digit",
      }
   );

   const ajd_ab = comiss.valor_aj_ab;
   const ajd_fc = comiss.valor_aj_fc;

   return (
      <>
         <div
            onClick={() => setShowDetail(true)}
            className={clsx(
               "group bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:border-gray-200 cursor-pointer",
               {
                  "hover:bg-blue-50/50": comiss.dias_cumprir,
                  "hover:bg-green-50/50": !comiss.dias_cumprir,
               }
            )}
         >
            <div className='flex flex-row justify-between items-center p-4 gap-4'>
               {/* Nome do Militar */}
               <div className='font-semibold text-gray-900 uppercase min-w-[11rem] text-sm'>
                  {user.p_g} {user.nome_guerra}
               </div>

               {/* Datas de Abertura/Fechamento */}
               <div className='hidden md:flex gap-6'>
                  <div className='flex items-center gap-2.5'>
                     <div
                        className={clsx(
                           "w-2 h-2 rounded-full transition-colors duration-300",
                           {
                              "bg-emerald-500 shadow-sm shadow-emerald-200":
                                 comiss.status === "aberto",
                              "bg-gray-400": comiss.status === "fechado",
                           }
                        )}
                     />
                     <span className='font-mono text-sm text-gray-700'>
                        {data_abertura}
                     </span>
                  </div>
                  <div className='flex items-center gap-2.5'>
                     <div
                        className={clsx(
                           "w-2 h-2 rounded-full transition-colors duration-300",
                           {
                              "bg-rose-500 shadow-sm shadow-rose-200":
                                 comiss.status === "aberto",
                              "bg-gray-400": comiss.status === "fechado",
                           }
                        )}
                     />
                     <span className='font-mono text-sm text-gray-700'>
                        {data_fechamento}
                     </span>
                  </div>
               </div>

               {/* Tipo de Comissionamento */}
               <div
                  className={clsx(
                     "flex items-center gap-2 px-3 py-1.5 md:w-32 rounded-lg text-xs font-medium transition-colors duration-200",
                     {
                        "bg-blue-100 text-blue-700": comiss.dias_cumprir,
                        "bg-green-100 text-green-700": !comiss.dias_cumprir,
                     }
                  )}
               >
                  {comiss.dias_cumprir ? (
                     <>
                        <MdOutlineCalendarToday size={14} />
                        <span className='hidden w-full text-center md:flex'>
                           Período
                        </span>
                     </>
                  ) : (
                     <>
                        <MdOutlineAttachMoney size={14} />
                        <span className='hidden w-full text-center md:flex'>
                           Comparativo
                        </span>
                     </>
                  )}
               </div>

               {/* Progress */}
               <div className='w-40'>
                  <ComissProgress
                     value={comiss.completude}
                     status={comiss.status}
                     modulo={comiss.modulo}
                  />
               </div>

               {/* Métricas */}
               <div className='hidden lg:grid grid-cols-3 gap-6 min-w-[24rem]'>
                  <div className='text-center'>
                     <div className='text-base font-semibold text-gray-900'>
                        {comiss.dias_cumprir
                           ? comiss.dias_cumprir
                           : `~ ${((ajd_ab + ajd_fc) / 335).toFixed(0)}`}
                        <span className='text-xs font-normal text-gray-500 ml-1'>
                           dias
                        </span>
                     </div>
                     <div className='text-xs text-gray-500 mt-0.5'>
                        Previsto
                     </div>
                  </div>
                  <div className='text-center'>
                     <div className='text-base font-semibold text-gray-900'>
                        {comiss.dias_cumprir
                           ? comiss.dias_comp
                           : `~ ${(comiss.vals_comp / 335).toFixed(0)}`}
                        <span className='text-xs font-normal text-gray-500 ml-1'>
                           dias
                        </span>
                     </div>
                     <div className='text-xs text-gray-500 mt-0.5'>
                        Computado
                     </div>
                  </div>
                  <div className='text-center'>
                     <div className='text-base font-semibold text-gray-900'>
                        {comiss.dias_cumprir
                           ? comiss.dias_cumprir - comiss.dias_comp
                           : `~ ${(
                                (ajd_ab + ajd_fc - comiss.vals_comp) /
                                335
                             ).toFixed(0)}`}
                        <span className='text-xs font-normal text-gray-500 ml-1'>
                           dias
                        </span>
                     </div>
                     <div className='text-xs text-gray-500 mt-0.5'>
                        Restante
                     </div>
                  </div>
               </div>

               {/* Indicador Clicável */}
               <div className='hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 group-hover:bg-blue-100 transition-colors duration-200'>
                  <MdChevronRight
                     size={20}
                     className='text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all duration-200'
                  />
               </div>
            </div>
         </div>

         {showDetail && (
            <DetailComiss
               show={showDetail}
               setShow={setShowDetail}
               comiss={comiss}
               update={update}
            />
         )}
      </>
   );
}

function ComissProgress({
   value,
   modulo,
   status,
}: {
   value: number;
   modulo: boolean;
   status: string;
}) {
   let color = modulo ? "green" : "red";
   color = status == "fechado" ? "gray" : color;

   const percent = Number(value) * 100;
   const labelText = `${percent.toFixed(1)}%`;

   return (
      <div className='space-y-2'>
         <div className='flex items-center justify-between'>
            <Label className='text-sm font-medium text-gray-600'>
               {labelText}
            </Label>
         </div>
         <Progress
            progress={value * 100}
            color={color}
            size='md'
            className='h-3'
         />
      </div>
   );
}
