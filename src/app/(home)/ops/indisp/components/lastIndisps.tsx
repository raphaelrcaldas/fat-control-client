import { useEffect, useState } from "react";
import { isoStrToDate } from "utils/dateHandler";
import { getIndisp } from "./options";
import { IndispForm } from "./indispForm";

export function LastIndisps({ indisps, update }) {
   const [lastIndisps, setLastIndisp] = useState([]);
   const [selectedIndisp, setSelectedIndisp] = useState(null);
   const [openIndispForm, setOpenIndispForm] = useState(false);

   useEffect(() => {
      const oIndis = indisps
         .flatMap((item) =>
            item.indisps.map((idp) => ({
               ...idp,
               trig: item.trip.trig,
               trip: item.trip,
               // Usa updated_at se existir, senão created_at
               lastChange: idp.updated_at || idp.created_at,
               wasModified: !!idp.updated_at,
            }))
         )
         .sort(
            (a, b) =>
               new Date(b.lastChange).getTime() -
               new Date(a.lastChange).getTime()
         );
      setLastIndisp(oIndis);
   }, [indisps]);

   const handleIndispClick = (idp) => {
      setSelectedIndisp(idp);
      setOpenIndispForm(true);
   };

   return (
      <div className='p-3 bg-white rounded-lg shadow-lg border border-gray-200 w-fit h-fit'>
         <h3 className='text-center text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200 whitespace-nowrap'>
            Últimas Atualizações
         </h3>

         <div className='flex flex-col gap-0.5'>
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
               const lastChangeDate = new Date(
                  idp.lastChange
               ).toLocaleDateString("pt-br", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
               });

               const indispTheme = getIndisp(idp.mtv);

               return (
                  <div
                     className='flex items-center select-none gap-2 hover:bg-blue-50 border-b border-gray-100 px-2 py-1 uppercase text-xs last:border-b-0 transition-colors rounded cursor-pointer'
                     key={idp.id || `${idp.trig}-${idp.created_at}-${idx}`}
                     onClick={() => handleIndispClick(idp)}
                  >
                     <span className='font-bold w-10 text-gray-900 text-center flex-shrink-0'>
                        {idp.trig}
                     </span>
                     <span
                        className={`w-12 flex-shrink-0 text-center text-xs font-semibold rounded px-2 py-0.5 ${indispTheme.color.bg} border border-gray-300`}
                     >
                        {idp.mtv}
                     </span>
                     <span className='w-24 flex-shrink-0 text-center text-gray-700 font-medium text-xs whitespace-nowrap'>
                        {dateIni}{" "}
                        <span className='lowercase text-gray-500'>a</span>{" "}
                        {dateEnd}
                     </span>
                     <span className='w-24 text-center flex-shrink-0 text-gray-500 text-xs whitespace-nowrap'>
                        {idp.wasModified && <span title='Modificado'>✏️</span>}{" "}
                        {lastChangeDate}
                     </span>
                  </div>
               );
            })}
         </div>

         {selectedIndisp && (
            <IndispForm
               open={openIndispForm}
               setOpen={setOpenIndispForm}
               trip={selectedIndisp.trip}
               update={update}
               indisp={selectedIndisp}
            />
         )}
      </div>
   );
}
