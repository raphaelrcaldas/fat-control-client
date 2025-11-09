import { useState } from "react";
import { isoDateToString } from "utils/dateHandler";
import { getIndisp } from "../../options";
import { IndispForm } from "../../indispForm";

export default function IndispContent({
   dateRef,
   trip,
   filterIndisp,
   isDesadaptado,
   isValidCEMAL,
   update,
}) {
   const [selectedIndisp, setSelectedIndisp] = useState(null);
   const [openIndispForm, setOpenIndispForm] = useState(false);

   const handleIndispClick = (indisp) => {
      setSelectedIndisp(indisp);
      setOpenIndispForm(true);
   };
   const diaSemana = dateRef.toLocaleDateString("pt-BR", { weekday: "long" });
   const dataFormatada = isoDateToString(dateRef);

   return (
      <div className='w-72 text-sm'>
         <div className='border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3'>
            <h3 className='text-center font-bold uppercase text-gray-900 text-base'>
               {`${trip.user.posto.short} ${trip.user.nome_guerra}`}
            </h3>
         </div>

         <div className='px-3 py-2 bg-gray-50 border-b border-gray-200'>
            <p className='text-center text-gray-700 font-medium capitalize'>
               {diaSemana}
            </p>
            <p className='text-center text-gray-900 font-semibold'>
               {dataFormatada}
            </p>
         </div>

         <div className='max-h-80 overflow-y-auto'>
            {filterIndisp.length > 0 ? (
               <div className='p-2 space-y-2'>
                  {filterIndisp.map((indisp, index) => (
                     <IndispBody
                        key={index}
                        indisp={indisp}
                        onClick={() => handleIndispClick(indisp)}
                     />
                  ))}
               </div>
            ) : (
               <div className='p-4 text-center'>
                  <p className='text-gray-500'>Sem indisponibilidades</p>
               </div>
            )}

            {!isValidCEMAL && (
               <div className='m-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200'>
                  <p className='uppercase text-red-700 font-bold text-center text-xs'>
                     ⚠️ CEMAL INVÁLIDO
                  </p>
               </div>
            )}

            {isDesadaptado && (
               <div className='m-2 px-3 py-2 rounded-lg bg-orange-50 border border-orange-200'>
                  <p className='uppercase text-orange-700 font-bold text-center text-xs'>
                     ⚠️ DESADAPTADO
                  </p>
               </div>
            )}
         </div>

         {selectedIndisp && (
            <IndispForm
               open={openIndispForm}
               setOpen={setOpenIndispForm}
               trip={trip}
               update={update}
               indisp={selectedIndisp}
            />
         )}
      </div>
   );
}

function IndispBody({ indisp, onClick }) {
   const indispProps = getIndisp(indisp.mtv);
   const dateStart = isoDateToString(indisp.date_start);
   const dateEnd = isoDateToString(indisp.date_end);
   const createdAt = new Date(indisp.created_at).toLocaleString("pt-br", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
   });
   const bgColor = indispProps.color.bg;
   const resp = indisp.user_created;

   return (
      <div
         className={`flex flex-col gap-2 px-3 py-3 rounded-lg shadow-sm border ${bgColor} border-gray-300 cursor-pointer hover:shadow-md transition-all`}
         onClick={onClick}
      >
         <div className='flex items-center justify-center'>
            <span className='uppercase text-center text-sm font-bold text-gray-900'>
               {indispProps.label}
            </span>
         </div>

         <div className='text-center'>
            <p className='text-xs font-semibold text-gray-800'>
               {dateStart} <span className='text-gray-600'>até</span> {dateEnd}
            </p>
         </div>

         {indisp.obs && (
            <div className='rounded px-2 py-1.5 mt-1'>
               <p className='text-gray-700 leading-relaxed'>
                  {indisp.obs}
               </p>
            </div>
         )}

         <div className='border-t border-gray-400/30 pt-2 mt-1'>
            <p className='text-xs text-gray-600 uppercase'>
               {createdAt}
            </p>
            <p className='text-xs font-medium text-gray-700 uppercase'>
               {resp.posto.short} {resp.nome_guerra}
            </p>
         </div>
      </div>
   );
}
