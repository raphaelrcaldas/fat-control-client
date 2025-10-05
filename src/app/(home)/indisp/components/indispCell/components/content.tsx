import { isoDateToString } from "utils/dateHandler";
import { getIndisp } from "../../options";

export default function IndispContent({
   dateRef,
   trip,
   filterIndisp,
   isDesadaptado,
   isValidCEMAL,
}) {
   const diaSemana = dateRef.toLocaleDateString("pt-BR", { weekday: "long" });

   return (
      <div className='w-64 text-sm text-gray-500'>
         <div className='border-b border-gray-200 bg-gray-100 px-3 py-2'>
            <h3 className='text-center font-semibold uppercase text-gray-900'>
               {`${trip.user.posto.short} ${trip.user.nome_guerra}`}
            </h3>
         </div>
         <h3 className='m-2 text-center'>{diaSemana}</h3>
         <h3 className='m-2 font-semibold text-center'>
            {isoDateToString(dateRef)}
         </h3>
         {filterIndisp.map((indisp, index) => (
            <IndispBody key={index} indisp={indisp} />
         ))}

         {!isValidCEMAL && (
            <div className='bg-gray-100 m-2 px-3 py-2 rounded-lg'>
               <p className='uppercase text-red-600 font-semibold text-center'>
                  CEMAL INVÁLIDO
               </p>
            </div>
         )}

         {isDesadaptado && (
            <div className='bg-gray-100 m-2 px-3 py-2 rounded-lg text-center'>
               <p className='uppercase text-red-600 font-semibold'>
                  DESADAPTADO
               </p>
            </div>
         )}
      </div>
   );
}

function IndispBody({ indisp }) {
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
         className={`flex flex-col gap-2 m-2 px-3 py-2 rounded-lg ${bgColor}`}
      >
         <p className='uppercase text-center text-base font-semibold'>
            {indispProps.label}
         </p>
         <p className='text-sm font-medium text-center'>{`${dateStart} a ${dateEnd}`}</p>
         <p className='text-base font-medium '>{indisp.obs}</p>
         <div className='border-t border-slate-300 py-1'>
            <p className='uppercase'>{`${createdAt}: ${resp.posto.short} ${resp.nome_guerra}`}</p>
         </div>
      </div>
   );
}
