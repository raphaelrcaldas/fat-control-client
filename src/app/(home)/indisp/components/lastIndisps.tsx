import { useEffect, useState } from "react";
import { isoStrToDate } from "utils/dateHandler";
import { getIndisp } from "./options";

export function LastIndisps({ indisps }) {
   const [lastIndisps, setLastIndisp] = useState([]);

   useEffect(() => {
      const oIndis = indisps
         .flatMap((item) =>
            item.indisps.map((idp) => ({
               ...idp,
               trig: item.trip.trig,
            }))
         )
         .sort(
            (a, b) =>
               new Date(b.created_at).getTime() -
               new Date(a.created_at).getTime()
         );
      setLastIndisp(oIndis);
   }, [indisps]);

   return (
      <div className='p-2 bg-white rounded-lg shadow-md'>
         <h3 className='text-center text-base font-medium'>
            Últimas Adicionadas
         </h3>

         <div className='flex mt-2 flex-col gap-1'>
            {lastIndisps.slice(0, 15).map((idp, idx) => {
               const dateIni = isoStrToDate(idp.date_start).toLocaleDateString(
                  "pt-br",
                  {
                     day: "2-digit",
                     month: "2-digit",
                  }
               );
               const dateEnd = isoStrToDate(idp.date_end).toLocaleDateString(
                  "pt-br",
                  {
                     day: "2-digit",
                     month: "2-digit",
                  }
               );
               const createdAt = new Date(idp.created_at).toLocaleDateString(
                  "pt-br",
                  {
                     day: "2-digit",
                     month: "2-digit",
                     hour: "2-digit",
                     minute: "2-digit",
                  }
               );

               const indispTheme = getIndisp(idp.mtv);

               return (
                  <div
                     className='flex justify-evenly select-none gap-1 hover:bg-slate-200 border-b p-1 uppercase text-center last:border-b-0'
                     key={idx}
                  >
                     <span className='font-medium w-10'>{idp.trig}</span>
                     <span
                        className={`w-10 text-center rounded ${indispTheme.color.bg}`}
                     >
                        {idp.mtv}
                     </span>
                     <span className='w-28'>
                        {dateIni} <span className='lowercase'>a</span> {dateEnd}
                     </span>
                     <span className='w-24 text-slate-500'>{createdAt}</span>
                  </div>
               );
            })}
         </div>
      </div>
   );
}
